import { SparklesIcon } from "lucide-react"

import type { FoilPattern } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { FoilPiece, FoilTilt } from "./foil-tilt"
import type { RareInk } from "./rare-art"
import { Stamp, type StampTone } from "./stamp"

export interface TicketRare {
  /** Art as an image URL (the generated SVG data URI). */
  image: string
  ink: RareInk
  /** Replaces "Admit one", e.g. "Rare foil · 7/50". */
  label: string
  /** Perks printed as chips under the rules. */
  perks?: string[]
  perksLabel?: string
  /** Embossed foil pattern; zig-zag when absent. */
  pattern?: FoilPattern
  /** The printed back, shown when the ticket is `flipped`. */
  back?: TicketRareBack
}

export interface TicketRareBack {
  title: string
  /** Perks, one per line. */
  perks: string[]
  facts: { label: string; value: string }[]
  /** Short line on the stub, e.g. the edition "7/50". */
  stub: string
}

export interface TicketLabels {
  admitOne: string
  serial: string
  section: string
  seat: string
  doors: string
  venue: string
  rules: string
  cap: string
  royalty: string
  limit: string
  souvenir: string
}

export interface TicketRuleValues {
  cap: string
  royalty: string
  limit: string
  souvenir: string
}

export interface TicketProps {
  eventName: string
  tagline?: string
  venue: string
  date: string
  doors: string
  section: string
  seat: string
  serial: string
  labels: TicketLabels
  rules?: TicketRuleValues
  /** Replaces the stub's default token block, e.g. with the live entry code. */
  stub?: React.ReactNode
  stamp?: { label: string; tone: StampTone; animate?: boolean }
  /** Play the tear: the stub drops away along the perforation. */
  tearing?: boolean
  /** Short shake (refused at the door). */
  shaking?: boolean
  dimmed?: boolean
  compact?: boolean
  className?: string
  headingLevel?: "h2" | "h3" | "p"
  /** Print it as a rare foil: custom art, foil that follows the pointer, and tilt. */
  rare?: TicketRare
  /** Pass a bright sweep across the foil once (just revealed). */
  sweep?: boolean
  /** Let touch drags tilt the foil (only where the page needn't scroll under it). */
  captureTouch?: boolean
  /** Turn a foil ticket over to its printed back (needs `rare.back`). */
  flipped?: boolean
}

const face = "col-start-1 row-start-1 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"

/**
 * The NFTokenPass ticket: yellow card stock, a main part and a stub joined by a
 * perforation with punched notches. Horizontal from 30rem of container width,
 * vertical below. Pure presentation; server- or client-rendered.
 */
export function Ticket({
  eventName,
  tagline,
  venue,
  date,
  doors,
  section,
  seat,
  serial,
  labels,
  rules,
  stub,
  stamp,
  tearing,
  shaking,
  dimmed,
  compact,
  className,
  headingLevel = "p",
  rare,
  sweep,
  captureTouch,
  flipped,
}: TicketProps) {
  const Heading = headingLevel
  const ink = rare?.ink
  // A foil ticket swaps the stock and its inks for the art's own, so every class below still applies.
  const inkVars = ink
    ? ({
        "--color-stock": ink.stock,
        "--color-stock-ink": ink.ink,
        "--color-stock-ink-soft": ink.inkSoft,
        "--color-stock-line": ink.line,
        // Entry code: the art's dark base on its light ink keeps the matrix high-contrast.
        "--color-code-ink": ink.stock,
        "--color-code-paper": ink.ink,
      } as React.CSSProperties)
    : undefined
  // One sheet of art across both pieces, shaded where the type sits (left, and the stub on the right).
  const art: React.CSSProperties | undefined =
    rare && ink
      ? {
          backgroundImage: `linear-gradient(90deg, ${ink.stock}e0 0%, ${ink.stock}80 40%, ${ink.stock}40 62%, ${ink.stock}a0 85%), url("${rare.image}")`,
          backgroundSize: "auto, cover",
          backgroundPosition: "0 0, center",
        }
      : undefined
  // The back: the same art, toned down evenly so the perk list reads anywhere on it.
  const backArt: React.CSSProperties | undefined =
    rare && ink
      ? {
          backgroundImage: `linear-gradient(${ink.stock}cc, ${ink.stock}cc), url("${rare.image}")`,
          backgroundSize: "auto, cover",
          backgroundPosition: "0 0, center",
        }
      : undefined

  const card = (
    <div
      className={cn(
        "paper-drop relative flex h-full flex-col text-stock-ink @[30rem]:flex-row",
        shaking && "animate-shake",
        dimmed && "saturate-[0.35]"
      )}
    >
      {/* Main part */}
      <div
        className={cn(
          "relative min-w-0 flex-1 overflow-hidden rounded-t-lg bg-stock notch-b @[30rem]:rounded-l-lg @[30rem]:rounded-tr-none @[30rem]:notch-r",
          compact ? "p-4" : "p-5 @[30rem]:p-6"
        )}
      >
        {rare && <FoilPiece art={art} pattern={rare.pattern} sweep={sweep} />}
        <div className="flex items-center justify-between gap-3">
          {rare ? (
            <span className="label-caps inline-flex items-center gap-1.5">
              <SparklesIcon className="size-3.5" aria-hidden="true" />
              {rare.label}
            </span>
          ) : (
            <span className="label-caps">{labels.admitOne}</span>
          )}
          <span className="font-display text-base font-bold tabular-nums">
            {labels.serial} {serial}
          </span>
        </div>
        <Heading
          className={cn(
            "mt-2 font-display leading-[0.92] font-extrabold tracking-tight break-words uppercase",
            compact ? "text-3xl" : "text-4xl @[30rem]:text-5xl"
          )}
        >
          {eventName}
        </Heading>
        {tagline && <p className="mt-1.5 line-clamp-2 text-sm text-stock-ink-soft">{tagline}</p>}
        <dl className={cn("grid grid-cols-2 gap-x-4 gap-y-2 border-t-[1.5px] border-stock-ink/70 pt-3", compact ? "mt-3" : "mt-4", stamp && (rules && !compact ? "" : "pr-24"))}>
          <div className="col-span-2 @[30rem]:col-span-1">
            <dt className="label-caps text-stock-ink-soft">{labels.venue}</dt>
            <dd className="text-sm font-semibold">{venue}</dd>
          </div>
          <div>
            <dt className="label-caps text-stock-ink-soft">{date}</dt>
            <dd className="text-sm font-semibold">
              {labels.doors} {doors}
            </dd>
          </div>
        </dl>
        {rules && !compact && (
          <div className={cn("mt-3 border-t-[1.5px] border-dashed border-stock-ink/50 pt-2.5", stamp && "pr-28")}>
            <p className="sr-only">{labels.rules}</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <li>
                <span className="text-stock-ink-soft">{labels.cap} </span>
                <strong className="inline-flex items-center gap-0.5 font-semibold">
                  {rules.cap}
                  {rare && <SparklesIcon className="size-3" aria-hidden="true" />}
                </strong>
              </li>
              <li>
                <span className="text-stock-ink-soft">{labels.royalty} </span>
                <strong className="font-semibold">{rules.royalty}</strong>
              </li>
              <li>
                <span className="text-stock-ink-soft">{labels.limit} </span>
                <strong className="font-semibold">{rules.limit}</strong>
              </li>
            </ul>
          </div>
        )}
        {rare?.perks && rare.perks.length > 0 && (
          <div className={cn("mt-2.5 text-xs", stamp && "pr-28")}>
            <p className="sr-only">{rare.perksLabel}</p>
            <ul className="flex flex-wrap gap-1.5">
              {rare.perks.map((p) => (
                <li key={p} className="rounded-sm border border-stock-ink/40 bg-stock/60 px-1.5 py-0.5 font-semibold">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
        {stamp && (
          <div key={stamp.label} className="pointer-events-none absolute right-4 bottom-4 @[30rem]:right-6">
            <Stamp tone={stamp.tone} animate={stamp.animate} size="md" surface="stock">
              {stamp.label}
            </Stamp>
          </div>
        )}
      </div>

      {/* Stub */}
      <div
        className={cn(
          "relative flex shrink-0 items-center gap-4 overflow-hidden rounded-b-lg border-t-2 border-dashed border-stock-line bg-stock notch-t @[30rem]:w-44 @[30rem]:flex-col @[30rem]:items-stretch @[30rem]:justify-between @[30rem]:rounded-tr-lg @[30rem]:rounded-b-none @[30rem]:rounded-br-lg @[30rem]:border-t-0 @[30rem]:border-l-2 @[30rem]:notch-l",
          compact ? "p-4" : "p-5",
          tearing && "animate-tear-y @[30rem]:animate-tear"
        )}
      >
        {rare && <FoilPiece end art={art} pattern={rare.pattern} sweep={sweep} />}
        <div className="min-w-0 flex-1 @[30rem]:flex-none">
          <p className="label-caps text-stock-ink-soft">{labels.section}</p>
          <p className="truncate font-display text-2xl leading-tight font-extrabold uppercase">{section}</p>
          <p className="label-caps mt-1 text-stock-ink-soft">{labels.seat}</p>
          <p className="font-display text-2xl leading-tight font-extrabold tabular-nums">{seat}</p>
        </div>
        {stub ?? (
          <div aria-hidden="true" className="flex items-end justify-between gap-2">
            <span className="size-9 rounded-[3px] bg-stock-ink" />
            <span className="font-display text-sm font-bold tabular-nums [writing-mode:vertical-rl]">{serial}</span>
          </div>
        )}
      </div>
    </div>
  )

  if (!rare) {
    return (
      <div className={cn("@container w-full", className)} style={inkVars}>
        {card}
      </div>
    )
  }

  // A foil with a printed back: both faces share one cell and turn over together.
  const sides = rare.back ? (
    <div className="[perspective:1400px]">
      <div
        className="grid transition-transform duration-700 ease-[cubic-bezier(0.3,1.25,0.5,1)] [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
      >
        <div className={face} aria-hidden={flipped || undefined}>
          {card}
        </div>
        <div className={cn(face, "[transform:rotateY(180deg)]")} aria-hidden={!flipped}>
          <RareBackCard back={rare.back} art={backArt} pattern={rare.pattern} compact={compact} />
        </div>
      </div>
    </div>
  ) : (
    card
  )

  return (
    <div className={cn("@container w-full", className)} style={inkVars}>
      <FoilTilt captureTouch={captureTouch}>{sides}</FoilTilt>
    </div>
  )
}

/** The back of a foil ticket: its perks and what makes it rare, on the same art, more heavily shaded. */
function RareBackCard({
  back,
  art,
  pattern,
  compact,
}: {
  back: TicketRareBack
  art?: React.CSSProperties
  pattern?: FoilPattern
  compact?: boolean
}) {
  return (
    <div className="paper-drop relative flex h-full flex-col text-stock-ink @[30rem]:flex-row">
      <div
        className={cn(
          "relative min-w-0 flex-1 overflow-hidden rounded-t-lg bg-stock notch-b @[30rem]:rounded-l-lg @[30rem]:rounded-tr-none @[30rem]:notch-r",
          compact ? "p-4" : "p-5 @[30rem]:p-6"
        )}
      >
        <FoilPiece art={art} pattern={pattern} />
        <p className="label-caps inline-flex items-center gap-1.5">
          <SparklesIcon className="size-3.5" aria-hidden="true" />
          {back.title}
        </p>
        <ul className={cn("mt-3 space-y-1.5", compact ? "text-base" : "text-lg @[30rem]:text-xl")}>
          {back.perks.map((p) => (
            <li key={p} className="flex items-center gap-2 font-display leading-tight font-extrabold uppercase">
              <SparklesIcon className="size-4 shrink-0 text-stock-ink-soft" aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t-[1.5px] border-dashed border-stock-ink/50 pt-3 text-xs @[30rem]:grid-cols-3">
          {back.facts.map((f) => (
            <div key={f.label}>
              <dt className="label-caps text-stock-ink-soft">{f.label}</dt>
              <dd className="font-semibold">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center gap-3 overflow-hidden rounded-b-lg border-t-2 border-dashed border-stock-line bg-stock notch-t @[30rem]:w-44 @[30rem]:flex-col @[30rem]:rounded-tr-lg @[30rem]:rounded-b-none @[30rem]:rounded-br-lg @[30rem]:border-t-0 @[30rem]:border-l-2 @[30rem]:notch-l",
          compact ? "p-4" : "p-5"
        )}
      >
        <FoilPiece end art={art} pattern={pattern} />
        <SparklesIcon className="size-10" aria-hidden="true" />
        <span className="font-display text-3xl font-extrabold tabular-nums">{back.stub}</span>
      </div>
    </div>
  )
}
