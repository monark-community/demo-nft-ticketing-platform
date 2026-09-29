"use client"

import { SearchIcon, SearchXIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Input } from "@/components/ui/input"
import { href, intlLocale, type Locale } from "@/i18n/config"
import { t } from "@/i18n/t"
import { available, listingsFor } from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"
import type { Category, EventItem } from "@/lib/demo/types"
import { clock, eventDate, loc, money } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useNow } from "@/hooks/use-now"

import { useApp } from "./app-context"
import { Poster } from "./poster"

export function isTonight(ev: EventItem, now = Date.now()): boolean {
  const a = new Date(ev.startsAt)
  const b = new Date(now)
  return a.toDateString() === b.toDateString()
}

export function dateParts(time: number, locale: Locale) {
  const day = new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric" }).format(time)
  const month = new Intl.DateTimeFormat(intlLocale[locale], { month: "short" }).format(time).replace(".", "")
  return { day, month }
}

const CATS: (Category | "all")[] = ["all", "music", "sports", "conference", "comedy", "film", "theatre"]

export function BoxOffice() {
  const { d, locale, categories } = useApp()
  const state = useDemo()
  const [q, setQ] = useState("")
  const [cat, setCat] = useState<Category | "all">("all")
  const clockNow = useNow(60_000)
  const b = d.boxOffice

  const events = useMemo(() => {
    if (!state) return []
    const needle = q.trim().toLowerCase()
    return state.events
      .filter((e) => e.startsAt > (clockNow ?? state.seededAt) - 6 * 3_600_000)
      .filter((e) => cat === "all" || e.category === cat)
      .filter((e) => !needle || [e.name, e.venue, loc(e.city, locale), loc(e.tagline, locale)].some((s) => s.toLowerCase().includes(needle)))
      .sort((a, c) => a.startsAt - c.startsAt)
  }, [state, q, cat, locale, clockNow])

  return (
    <div>
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-5xl leading-none font-extrabold tracking-tight uppercase sm:text-6xl">{b.title}</h1>
        <p className="max-w-2xl text-muted-foreground">{b.intro}</p>
      </header>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <label htmlFor="bo-search" className="sr-only">
            {b.searchLabel}
          </label>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="bo-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={b.search}
            className="h-11 border-input bg-card pl-9"
          />
        </div>
        <div role="group" aria-label={b.category} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={cn(
                "h-9 shrink-0 rounded-sm border px-3 text-sm font-semibold transition-colors pointer-coarse:h-11",
                cat === c ? "border-foreground bg-foreground text-background" : "border-input bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {categories[c]}
            </button>
          ))}
        </div>
      </div>

      {!state ? (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label={d.loading}>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
          ))}
        </ul>
      ) : events.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-lg border border-dashed px-6 py-16 text-center">
          <SearchXIcon className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-4 text-lg font-semibold">{t(b.emptyTitle, { q: q || categories[cat] })}</p>
          <p className="mt-1 text-muted-foreground">{b.emptyBody}</p>
          <button
            type="button"
            onClick={() => {
              setQ("")
              setCat("all")
            }}
            className="mt-5 h-11 rounded-md border border-input px-4 font-semibold hover:bg-muted"
          >
            {b.clear}
          </button>
        </div>
      ) : (
        <>
          <p className="sr-only" aria-live="polite">
            {t(b.results, { n: events.length })}
          </p>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => {
              const minPrice = Math.min(...ev.tiers.map((x) => x.price))
              const left = ev.tiers.reduce((n, x) => n + available(x), 0)
              const resale = listingsFor(state, ev.id).length
              const { day, month } = dateParts(ev.startsAt, locale)
              return (
                <li key={ev.id}>
                  <Link
                    href={href(locale, `/app/events/${ev.id}`)}
                    className="paper-edge group flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-transform hover:-translate-y-0.5"
                  >
                    <Poster name={ev.name} kicker={categories[ev.category]} day={day} month={month} tone={ev.tone} className="aspect-[16/10]" />
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="flex flex-wrap gap-1.5">
                        {isTonight(ev) && <Badge tone="stock">{b.tonight}</Badge>}
                        {ev.createdByYou && <Badge tone="ink">{b.yours}</Badge>}
                        {left === 0 ? <Badge tone="void">{b.soldOut}</Badge> : <Badge tone="muted">{t(b.left, { n: left })}</Badge>}
                        {resale > 0 && <Badge tone="muted">{t(b.resaleCount, { n: resale })}</Badge>}
                      </div>
                      <div>
                        <h2 className="text-lg leading-tight font-semibold group-hover:underline group-hover:underline-offset-4">{ev.name}</h2>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{loc(ev.tagline, locale)}</p>
                      </div>
                      <p className="mt-auto text-sm">
                        {eventDate(ev.startsAt, locale)} · {clock(ev.startsAt, locale)}
                        <br />
                        <span className="text-muted-foreground">
                          {ev.venue}, {loc(ev.city, locale)}
                        </span>
                      </p>
                      <p className="border-t border-dashed pt-3 font-semibold tabular-nums">{t(b.from, { price: money(minPrice, locale) })}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

export function Badge({ tone, children }: { tone: "stock" | "ink" | "void" | "muted" | "ok"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-sm px-2 text-xs font-semibold",
        tone === "stock" && "bg-stock text-stock-ink",
        tone === "ink" && "bg-foreground text-background",
        tone === "void" && "border border-destructive text-destructive",
        tone === "ok" && "border border-success text-success",
        tone === "muted" && "bg-muted text-muted-foreground"
      )}
    >
      {children}
    </span>
  )
}
