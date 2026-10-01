"use client"

import { SparklesIcon } from "lucide-react"
import { useState } from "react"

import { FoilPiece, FoilTilt } from "@/components/ticket/foil-tilt"
import { Ticket } from "@/components/ticket/ticket"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { t } from "@/i18n/t"
import { capPctOf, eventById, perksOf } from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"
import type { DemoState, Ticket as TicketItem } from "@/lib/demo/types"
import { percent } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useApp } from "./app-context"
import { ticketProps } from "./ticket-props"

const face = "col-start-1 row-start-1 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"

/**
 * The rare drop after a purchase: a sealed card bobs until clicked, flips to the
 * foil ticket (tilt and foil follow the pointer), and a second click puts it away.
 * Mount with a `key` per ticket so each drop starts sealed.
 */
export function RareDropReveal({ ticket, onDone }: { ticket: TicketItem; onDone: () => void }) {
  const copy = useApp()
  const r = copy.d.event.rare
  const state = useDemo() as DemoState
  const [revealed, setRevealed] = useState(false)
  if (!ticket.rare) return null
  const ev = eventById(state, ticket.eventId)
  const art = copy.tk.rareArt[ticket.rare.art]

  function activate() {
    if (revealed) onDone()
    else setRevealed(true)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onDone()}>
      <DialogContent
        closeLabel={r.close}
        overlayClassName="bg-[#0d0a08]/90 backdrop-blur-sm"
        className="max-w-3xl gap-5 border-0 bg-transparent px-4 py-10 text-[#fff8ea] shadow-none sm:px-8 [&>button:last-child]:text-[#fff8ea]"
      >
        <div className="text-center">
          <DialogTitle className="font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">
            {revealed ? t(r.revealedTitle, { art }) : r.title}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-[#e9dcc4]">
            {revealed
              ? t(r.revealedBody, {
                  serial: ticket.serial,
                  n: ticket.rare.edition,
                  of: ticket.rare.of,
                  event: ev?.name ?? "",
                  base: ev ? percent(ev.rules.resaleCapPct, copy.locale) : "",
                  cap: ev ? percent(capPctOf(ev, ticket), copy.locale) : "",
                })
              : r.sealed}
          </DialogDescription>
          {revealed && (
            <ul aria-label={copy.tk.perks} className="mt-3 flex flex-wrap justify-center gap-2">
              {perksOf(ticket).map((p) => (
                <li key={p} className="inline-flex items-center gap-1.5 rounded-full border border-[#f4c542]/50 px-3 py-1 text-sm font-semibold text-[#f4c542]">
                  <SparklesIcon className="size-3.5" aria-hidden="true" />
                  {copy.tk.rarePerks[p]}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="[perspective:1600px]">
          <div
            role="button"
            tabIndex={0}
            aria-label={revealed ? r.doneLabel : r.revealLabel}
            onClick={activate}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                activate()
              }
            }}
            className="grid cursor-pointer rounded-lg transition-transform duration-700 ease-[cubic-bezier(0.3,1.3,0.5,1)] [transform-style:preserve-3d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4c542]"
            style={{ transform: revealed ? "rotateY(180deg)" : undefined }}
          >
            <div className={cn(face, "flex items-center", !revealed && "animate-rare-bob")} aria-hidden={revealed}>
              <Sealed label={r.title} />
            </div>
            <div className={cn(face, "flex items-center [transform:rotateY(180deg)]")} aria-hidden={!revealed}>
              <Ticket {...ticketProps(state, ticket, copy)} sweep={revealed} captureTouch />
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="label-caps text-[#f4c542]">{revealed ? r.done : r.reveal}</p>
          {revealed && (
            <>
              <p className="mt-2 text-sm text-[#e9dcc4]">{r.hint}</p>
              <p className="mx-auto mt-3 max-w-md text-xs text-[#b3a792]">{r.odds}</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** The face-down drop: ticket-shaped, ink black, foil already moving under the question mark. */
function Sealed({ label }: { label: string }) {
  return (
    <div className="@container w-full">
      <FoilTilt captureTouch>
        <div className="paper-drop relative flex flex-col text-[#f4c542] @[30rem]:flex-row">
          <div className="relative flex min-h-56 min-w-0 flex-1 flex-col justify-between rounded-t-lg bg-[#1c1814] p-6 notch-b @[30rem]:rounded-l-lg @[30rem]:rounded-tr-none @[30rem]:notch-r">
            <FoilPiece />
            <span className="label-caps inline-flex items-center gap-1.5">
              <SparklesIcon className="size-3.5" aria-hidden="true" />
              {label}
            </span>
            <span aria-hidden="true" className="font-display text-[7rem] leading-[0.8] font-extrabold">
              ?
            </span>
          </div>
          <div className="relative flex min-h-24 shrink-0 items-center justify-center rounded-b-lg border-t-2 border-dashed border-[#f4c542]/40 bg-[#1c1814] p-5 notch-t @[30rem]:w-44 @[30rem]:rounded-tr-lg @[30rem]:rounded-b-none @[30rem]:rounded-br-lg @[30rem]:border-t-0 @[30rem]:border-l-2 @[30rem]:notch-l">
            <FoilPiece end />
            <SparklesIcon className="size-12" aria-hidden="true" />
          </div>
        </div>
      </FoilTilt>
    </div>
  )
}
