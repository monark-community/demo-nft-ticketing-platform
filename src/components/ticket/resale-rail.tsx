"use client"

import { MinusIcon, PlusIcon } from "lucide-react"
import { useId, useState } from "react"

import { t } from "@/i18n/t"
import type { Locale } from "@/i18n/config"
import { money, percent } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface RailLabels {
  label: string
  face: string
  cap: string
  capReached: string
  receipt: string
  buyerPays: string
  royaltyTo: string
  youReceive: string
  youReceiveYou: string
  decrease: string
  increase: string
}

/**
 * The resale rail: a price track that stops hard at the organizer's cap, with
 * the blocked zone beyond it, and a printed receipt that splits the price live.
 */
export function ResaleRail({
  face,
  capPct,
  royaltyPct,
  value,
  onChange,
  locale,
  labels,
  you = false,
  step = 10,
  className,
}: {
  face: number
  capPct: number
  royaltyPct: number
  value: number
  onChange: (cents: number) => void
  locale: Locale
  labels: RailLabels
  you?: boolean
  step?: number
  className?: string
}) {
  const id = useId()
  const min = Math.round(face * 0.5)
  const cap = Math.floor((face * capPct) / 100)
  const visualMax = Math.max(Math.round(face * 1.6), cap + step * 4)
  const pos = (v: number) => ((v - min) / (visualMax - min)) * 100
  const [bump, setBump] = useState(0)
  const atCap = value >= cap

  const set = (v: number) => {
    const clamped = Math.min(cap, Math.max(min, Math.round(v)))
    if (v > cap) setBump((b) => b + 1)
    onChange(clamped)
  }

  const royalty = Math.round((value * royaltyPct) / 100)
  const seller = value - royalty

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="label-caps text-muted-foreground">
          {labels.label}
        </label>
        <output htmlFor={id} className="font-display text-4xl leading-none font-extrabold tabular-nums">
          {money(value, locale, false)} <span className="text-lg font-bold text-muted-foreground">tUSDC</span>
        </output>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set(value - step * 10)}
          aria-label={labels.decrease}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-input hover:bg-muted pointer-coarse:size-11"
        >
          <MinusIcon className="size-4" aria-hidden="true" />
        </button>

        <div className="relative h-12 flex-1">
          {/* Track: allowed zone, then the blocked zone beyond the cap. */}
          <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-muted" aria-hidden="true" />
          <div
            aria-hidden="true"
            className="absolute top-1/2 h-2 -translate-y-1/2 rounded-r-full bg-[repeating-linear-gradient(135deg,var(--muted-foreground)_0_2px,transparent_2px_6px)] opacity-40"
            style={{ left: `${pos(cap)}%`, right: 0 }}
          />
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-l-full bg-foreground dark:bg-primary"
            style={{ width: `${pos(value)}%` }}
          />
          {/* Face value tick */}
          <div aria-hidden="true" className="absolute top-0 bottom-0 w-px bg-muted-foreground/60" style={{ left: `${pos(face)}%` }} />
          <span aria-hidden="true" className="absolute -bottom-4 -translate-x-1/2 text-[10px] font-semibold text-muted-foreground uppercase" style={{ left: `${pos(face)}%` }}>
            {labels.face}
          </span>
          {/* The hard stop */}
          <div
            key={bump}
            aria-hidden="true"
            className={cn("absolute top-1 bottom-1 w-1.5 -translate-x-1/2 rounded-sm bg-destructive", bump > 0 && "animate-rail-bump")}
            style={{ left: `${pos(cap)}%` }}
          />
          <span
            aria-hidden="true"
            className="absolute -top-3 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap text-destructive uppercase"
            style={{ left: `${pos(cap)}%` }}
          >
            {labels.cap} {percent(capPct, locale)}
          </span>
          <input
            id={id}
            type="range"
            min={min}
            max={cap}
            step={step}
            value={value}
            onChange={(e) => set(Number(e.target.value))}
            onKeyDown={(e) => {
              if ((e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "PageUp") && value >= cap) setBump((b) => b + 1)
            }}
            onPointerUp={() => value >= cap && setBump((b) => b + 1)}
            aria-valuetext={money(value, locale)}
            className="peer absolute top-0 left-0 h-full cursor-pointer opacity-0 focus-visible:opacity-0"
            style={{ width: `${pos(cap)}%` }}
          />
          {/* Thumb */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-[4px] border-2 border-foreground bg-stock peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring dark:border-primary"
            style={{ left: `${pos(value)}%` }}
          />
        </div>

        <button
          type="button"
          onClick={() => set(value + step * 10)}
          aria-label={labels.increase}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-input hover:bg-muted pointer-coarse:size-11"
        >
          <PlusIcon className="size-4" aria-hidden="true" />
        </button>
      </div>

      <p role="status" className={cn("min-h-5 text-sm font-medium text-destructive transition-opacity", atCap ? "opacity-100" : "opacity-0")}>
        {atCap ? labels.capReached : ""}
      </p>

      {/* Receipt */}
      <div className="rounded-md border border-dashed bg-background p-4 font-mono text-sm">
        <p className="label-caps mb-2 font-sans text-muted-foreground">{labels.receipt}</p>
        <dl className="space-y-1.5">
          <div className="flex justify-between gap-4">
            <dt>{labels.buyerPays}</dt>
            <dd className="tabular-nums">{money(value, locale)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-muted-foreground">
            <dt>{t(labels.royaltyTo, { pct: percent(royaltyPct, locale) })}</dt>
            <dd className="tabular-nums">−{money(royalty, locale)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-dashed pt-1.5 font-bold">
            <dt>{you ? labels.youReceiveYou : labels.youReceive}</dt>
            <dd className="tabular-nums">{money(seller, locale)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
