"use client"

import { RefreshCwIcon, SparklesIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { FoilPiece, FoilTilt } from "@/components/ticket/foil-tilt"
import { rareArt } from "@/components/ticket/rare-art"
import { Ticket } from "@/components/ticket/ticket"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { t } from "@/i18n/t"
import { capPctOf, eventById, perksOf } from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"
import type { DemoState, FoilPattern, Ticket as TicketItem } from "@/lib/demo/types"
import { percent } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useApp } from "./app-context"
import { ticketProps } from "./ticket-props"

const face = "col-start-1 row-start-1 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
/** Stacks alternatives in one grid cell. */
const stack = "col-start-1 row-start-1"

type Phase = "sealed" | "charging" | "burst" | "revealed"

/** When each beat of the reveal starts, in ms after the click. */
const BURST_AT = 650
/** The spin takes 1.5 s (rare-spin in globals.css); the copy lands with the card. */
const REVEALED_AT = BURST_AT + 1500

/** Staggered entrance for the copy once the card lands. */
const POP = "animate-in fade-in-0 zoom-in-95 duration-500 [animation-fill-mode:both]"
const delay = (ms: number) => ({ animationDelay: `${ms}ms` })

/**
 * The rare drop after a purchase. A sealed card bobs until clicked, then the
 * reveal plays in beats: it charges (shakes harder, glows in the art's colour,
 * buzzes the phone), blooms (warm light, rays), spins a turn and a half
 * and lands on the foil ticket with a stamp. Tilt and foil follow the pointer;
 * a second click puts it away. Mount with a `key` per ticket so each drop starts sealed.
 */
export function RareDropReveal({ ticket, onDone }: { ticket: TicketItem; onDone: () => void }) {
  const copy = useApp()
  const r = copy.d.event.rare
  const state = useDemo() as DemoState
  const [phase, setPhase] = useState<Phase>("sealed")
  const [flipped, setFlipped] = useState(false)
  const timers = useRef<number[]>([])
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])
  if (!ticket.rare) return null
  const ev = eventById(state, ticket.eventId)
  const art = copy.tk.rareArt[ticket.rare.art]
  const revealed = phase === "revealed"
  const playing = phase === "charging" || phase === "burst"

  function activate() {
    if (revealed) return onDone()
    if (phase !== "sealed") return
    // Reduced motion: no shake, flash or spin; the global rule settles the flip instantly.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setPhase("revealed")
    setPhase("charging")
    try {
      navigator.vibrate?.([15, 40, 15, 40, 60])
    } catch {}
    timers.current.push(
      window.setTimeout(() => setPhase("burst"), BURST_AT),
      window.setTimeout(() => setPhase("revealed"), REVEALED_AT)
    )
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onDone()}>
      <DialogContent
        closeLabel={r.close}
        overlayClassName={cn("rare-overlay bg-[#0d0a08]/90 backdrop-blur-sm", `rare-${phase}`)}
        overlayStyle={{ "--rare-glow": rareArt(ticket.rare.art).ink.line } as React.CSSProperties}
        className="max-w-3xl gap-5 border-0 bg-transparent px-4 py-10 text-[#fff8ea] shadow-none sm:px-8 [&>button:last-child]:text-[#fff8ea]"
      >
        {/*
          Both states share one cell (the inactive one hidden but still taking
          room), so nothing above or below the card changes height at the
          reveal and the centred card never jumps.
        */}
        <div className="text-center">
          <DialogTitle className="grid font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">
            <span className={cn(stack, revealed && "invisible")}>{r.title}</span>
            <span className={cn(stack, !revealed && "invisible", revealed && "animate-in fade-in-0 slide-in-from-top-3 duration-500")}>
              {t(r.revealedTitle, { art })}
            </span>
          </DialogTitle>
          <p className={cn("label-caps mt-2 text-[#f4c542]", !revealed && "invisible", revealed && POP)} style={delay(80)}>
            {t(r.patternLine, { pattern: copy.tk.foilPatterns[ticket.rare.pattern ?? "zigzag"] })}
          </p>
          <DialogDescription className="mt-2 grid text-sm text-[#e9dcc4]">
            <span className={cn(stack, revealed && "invisible")}>{r.sealed}</span>
            <span className={cn(stack, !revealed && "invisible", revealed && POP)} style={delay(150)}>
              {t(r.revealedBody, {
                serial: ticket.serial,
                n: ticket.rare.edition,
                of: ticket.rare.of,
                event: ev?.name ?? "",
                base: ev ? percent(ev.rules.resaleCapPct, copy.locale) : "",
                cap: ev ? percent(capPctOf(ev, ticket), copy.locale) : "",
              })}
            </span>
          </DialogDescription>
          <ul aria-label={copy.tk.perks} className={cn("mt-3 flex flex-wrap justify-center gap-2", !revealed && "invisible")}>
            {perksOf(ticket).map((p, i) => (
              <li
                key={p}
                style={delay(450 + i * 120)}
                className={cn(revealed && POP, "inline-flex items-center gap-1.5 rounded-full border border-[#f4c542]/50 px-3 py-1 text-sm font-semibold text-[#f4c542]")}
              >
                <SparklesIcon className="size-3.5" aria-hidden="true" />
                {copy.tk.rarePerks[p]}
              </li>
            ))}
          </ul>
        </div>

        <div className="[perspective:1600px]">
          <div
            role="button"
            tabIndex={0}
            aria-label={revealed ? r.doneLabel : r.revealLabel}
            aria-disabled={playing || undefined}
            onClick={activate}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                activate()
              }
            }}
            className={cn(
              "grid rounded-lg [transform-style:preserve-3d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4c542]",
              playing ? "cursor-default" : "cursor-pointer",
              (phase === "burst" || revealed) && "animate-rare-spin"
            )}
          >
            <div
              className={cn(face, "flex items-center", phase === "sealed" && "animate-rare-bob", phase === "charging" && "animate-rare-charge")}
              aria-hidden={revealed}
            >
              <Sealed label={r.title} pattern={ticket.rare.pattern} charging={phase === "charging"} paused={phase !== "sealed"} />
            </div>
            <div className={cn(face, "flex items-center [transform:rotateY(180deg)]")} aria-hidden={!revealed}>
              <Ticket
                {...ticketProps(state, ticket, copy)}
                tiltPaused={!revealed}
                captureTouch
                flipped={flipped}
                stamp={{ label: copy.tk.stamps.foil, tone: "ink", animate: revealed, hidden: !revealed }}
              />
            </div>
          </div>
        </div>

        <div className={cn("-mt-1 flex justify-center", !revealed && "invisible", revealed && POP)} style={delay(600)}>
          <FlipButton flipped={flipped} onFlip={() => setFlipped((f) => !f)} labels={copy.tk} className="border-[#f4c542]/50 bg-transparent text-[#f4c542] hover:bg-[#f4c542]/10 hover:text-[#f4c542]" />
        </div>

        <div className="text-center">
          <p className="label-caps grid text-[#f4c542]">
            <span className={cn(stack, revealed && "invisible", playing && "invisible")}>{r.reveal}</span>
            <span className={cn(stack, !revealed && "invisible", revealed && POP)} style={delay(700)}>
              {r.done}
            </span>
          </p>
          <div className={cn(!revealed && "invisible", revealed && POP)} style={delay(850)}>
            <p className="mt-2 text-sm text-[#e9dcc4]">{r.hint}</p>
            <p className="mx-auto mt-3 max-w-md text-xs text-[#b3a792]">{r.odds}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Turns a foil ticket over to its printed back (perks) and back again. */
export function FlipButton({
  flipped,
  onFlip,
  labels,
  className,
}: {
  flipped: boolean
  onFlip: () => void
  labels: { flip: string; flipBack: string }
  className?: string
}) {
  return (
    <Button variant="outline" className={cn("h-11 border-input", className)} aria-pressed={flipped} onClick={onFlip}>
      <RefreshCwIcon aria-hidden="true" />
      {flipped ? labels.flipBack : labels.flip}
    </Button>
  )
}

/** The face-down drop: ticket-shaped, ink black, foil already moving under the question mark. */
function Sealed({ label, pattern, charging, paused }: { label: string; pattern?: FoilPattern; charging?: boolean; paused?: boolean }) {
  return (
    <div className={cn("@container w-full", charging && "[&_.foil-sheen]:opacity-90 [&_.foil-texture]:opacity-100")}>
      <FoilTilt captureTouch paused={paused}>
        <div className="paper-drop relative flex flex-col text-[#f4c542] @[30rem]:flex-row">
          <div className="relative flex min-h-56 min-w-0 flex-1 flex-col justify-between rounded-t-lg bg-[#1c1814] p-6 notch-b @[30rem]:rounded-l-lg @[30rem]:rounded-tr-none @[30rem]:notch-r">
            <FoilPiece pattern={pattern} />
            <span className="label-caps inline-flex items-center gap-1.5">
              <SparklesIcon className="size-3.5" aria-hidden="true" />
              {label}
            </span>
            <span aria-hidden="true" className="font-display text-[7rem] leading-[0.8] font-extrabold">
              ?
            </span>
          </div>
          <div className="relative flex min-h-24 shrink-0 items-center justify-center rounded-b-lg border-t-2 border-dashed border-[#f4c542]/40 bg-[#1c1814] p-5 notch-t @[30rem]:w-44 @[30rem]:rounded-tr-lg @[30rem]:rounded-b-none @[30rem]:rounded-br-lg @[30rem]:border-t-0 @[30rem]:border-l-2 @[30rem]:notch-l">
            <FoilPiece end pattern={pattern} />
            <SparklesIcon className="size-12" aria-hidden="true" />
          </div>
        </div>
      </FoilTilt>
    </div>
  )
}
