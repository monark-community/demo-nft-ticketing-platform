"use client"

import { ExternalLinkIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useNow } from "@/hooks/use-now"
import { useDemo } from "@/lib/demo/store"
import { ago, eventDate, money, number } from "@/lib/format"

import { useApp } from "./app-context"
import { CreateEvent } from "./create-event"
import { Poster } from "./poster"
import { dateParts } from "./box-office"

export function OrganizerView() {
  const { d, locale, categories } = useApp()
  const o = d.organizer
  const state = useDemo()
  const [creating, setCreating] = useState(false)
  const clockNow = useNow(30_000)

  if (!state) return <div className="h-[60vh] animate-pulse rounded-lg bg-muted" aria-busy="true" aria-label={d.loading} />

  const org = state.organizers.find((x) => x.id === state.youOrganize)
  const events = state.events.filter((e) => e.organizerId === state.youOrganize).sort((a, b) => a.startsAt - b.startsAt)
  const ids = new Set(events.map((e) => e.id))
  const ledger = state.ledger.filter((l) => ids.has(l.eventId)).sort((a, b) => b.at - a.at)
  const royaltyTotal = ledger.reduce((n, l) => n + l.amount, 0)
  const soldTotal = events.reduce((n, e) => n + e.tiers.reduce((m, x) => m + x.sold, 0), 0)
  const primaryTotal = events.reduce((n, e) => n + e.tiers.reduce((m, x) => m + x.sold * x.price, 0), 0)
  const now = clockNow ?? state.seededAt

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-5xl leading-none font-extrabold tracking-tight uppercase sm:text-6xl">{o.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t(o.intro, { name: org?.name ?? "" })}</p>
        </div>
        {!creating && (
          <Button className="h-12 px-5" onClick={() => setCreating(true)}>
            <PlusIcon aria-hidden="true" />
            {o.create}
          </Button>
        )}
      </header>

      {creating && <CreateEvent onClose={() => setCreating(false)} />}

      <dl className="grid gap-4 sm:grid-cols-3">
        {[
          { label: o.sold, value: number(soldTotal, locale) },
          { label: o.primary, value: money(primaryTotal, locale) },
          { label: o.totalRoyalties, value: money(royaltyTotal, locale), accent: true },
        ].map((s) => (
          <div key={s.label} className={s.accent ? "rounded-lg bg-stock p-5 text-stock-ink" : "rounded-lg border bg-card p-5"}>
            <dt className={s.accent ? "label-caps text-stock-ink-soft" : "label-caps text-muted-foreground"}>{s.label}</dt>
            <dd className="mt-1 font-display text-3xl font-extrabold tabular-nums sm:text-4xl">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="ev-h">
        <h2 id="ev-h" className="font-display text-3xl font-extrabold uppercase">
          {o.yourEvents}
        </h2>
        {events.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed px-6 py-12 text-center">
            <p className="text-lg font-semibold">{o.emptyTitle}</p>
            <p className="mt-1 text-muted-foreground">{o.emptyBody}</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {events.map((ev) => {
              const sold = ev.tiers.reduce((n, x) => n + x.sold, 0)
              const supply = ev.tiers.reduce((n, x) => n + x.supply, 0)
              const primary = ev.tiers.reduce((n, x) => n + x.sold * x.price, 0)
              const royalties = state.ledger.filter((l) => l.eventId === ev.id).reduce((n, l) => n + l.amount, 0)
              const scanned = state.tickets.filter((x) => x.eventId === ev.id && x.status === "used").length
              const { day, month } = dateParts(ev.startsAt, locale)
              return (
                <li key={ev.id} className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-[7rem_1fr] sm:p-5">
                  <Poster name={ev.name} kicker={categories[ev.category]} day={day} month={month} tone={ev.tone} className="hidden aspect-[3/4] rounded-md p-2.5 sm:flex [&_p]:text-lg" />
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-lg font-semibold">{ev.name}</h3>
                      <Link
                        href={href(locale, `/app/events/${ev.id}`)}
                        className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                      >
                        {o.viewPage}
                        <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {eventDate(ev.startsAt, locale)} · {ev.venue}
                    </p>
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">{o.sold}</span>
                        <span className="font-semibold tabular-nums">
                          {number(sold, locale)} / {number(supply, locale)}
                        </span>
                      </div>
                      <Progress value={supply ? (sold / supply) * 100 : 0} aria-label={`${o.sold} ${sold} / ${supply}`} className="h-2 bg-muted" />
                    </div>
                    <dl className="grid grid-cols-3 gap-3 border-t border-dashed pt-3 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">{o.primary}</dt>
                        <dd className="font-semibold tabular-nums">{money(primary, locale)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">{o.royalties}</dt>
                        <dd className="font-semibold text-success tabular-nums">{money(royalties, locale)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">{o.admitted}</dt>
                        <dd className="font-semibold tabular-nums">{number(scanned, locale)}</dd>
                      </div>
                    </dl>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="ledger-h">
        <h2 id="ledger-h" className="font-display text-3xl font-extrabold uppercase">
          {o.ledgerTitle}
        </h2>
        {ledger.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed px-5 py-8 text-center text-sm text-muted-foreground">{o.ledgerEmpty}</p>
        ) : (
          <ul className="mt-4 divide-y rounded-lg border bg-card font-mono text-sm">
            {ledger.map((l) => {
              const ev = state.events.find((e) => e.id === l.eventId)
              return (
                <li key={l.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0 font-sans">
                    <p className="font-semibold">{t(o.ledgerLine, { serial: l.serial })}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {ev?.name} · {ago(l.at, now, locale)} · {l.hash.slice(0, 10)}…
                    </p>
                  </div>
                  <span className="shrink-0 font-bold text-success tabular-nums">+{money(l.amount, locale)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
