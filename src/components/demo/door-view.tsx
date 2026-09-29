"use client"

import { RotateCcwIcon, ScanLineIcon, TicketIcon, UserIcon } from "lucide-react"
import { useState } from "react"

import { CodeMatrix } from "@/components/ticket/entry-code"
import { Stamp } from "@/components/ticket/stamp"
import { Ticket } from "@/components/ticket/ticket"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { t } from "@/i18n/t"
import { currentCode, guestCode, refillQueue, scanAtDoor, yourTickets } from "@/lib/demo/ops"
import { getDemo, useDemo } from "@/lib/demo/store"
import type { DemoState, DoorVerdict } from "@/lib/demo/types"
import { clock, loc } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useNow } from "@/hooks/use-now"

import { useApp, type AppCopy } from "./app-context"
import { isTonight } from "./box-office"
import { ticketProps } from "./ticket-props"

type Scan =
  | { phase: "idle" }
  | { phase: "verifying"; label: string; code: string }
  | { phase: "result"; label: string; code: string; verdict: DoorVerdict }

export function verdictText(copy: AppCopy, v: DoorVerdict): string {
  const x = copy.d.door.verdict
  if (v.ok) return x.admitted
  switch (v.reason) {
    case "expired":
      return t(x.expired, { s: v.seconds ?? 0 })
    case "used":
      return t(x.used, { time: v.usedAt ? clock(v.usedAt, copy.locale) : "—" })
    case "wrongEvent":
      return t(x.wrongEvent, { event: v.eventName ?? "?" })
    case "notHolder":
      return x.notHolder
    default:
      return x.forged
  }
}

export function DoorView() {
  const copy = useApp()
  const { d, locale, tk } = copy
  const x = d.door
  const state = useDemo()
  const [chosen, setChosen] = useState<string | null>(null)
  const [scan, setScan] = useState<Scan>({ phase: "idle" })
  const [manual, setManual] = useState("")
  const clockNow = useNow(15_000)

  if (!state) return <div className="h-[60vh] animate-pulse rounded-lg bg-muted" aria-busy="true" aria-label={d.loading} />

  const tonight = state.events.filter((e) => isTonight(e)).sort((a, b) => a.startsAt - b.startsAt)
  const eventId = chosen && tonight.some((e) => e.id === chosen) ? chosen : tonight[0]?.id
  const ev = tonight.find((e) => e.id === eventId)

  const header = (
    <header>
      <h1 className="font-display text-5xl leading-none font-extrabold tracking-tight uppercase sm:text-6xl">{x.title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{x.intro}</p>
    </header>
  )

  if (!ev) {
    const next = state.events.filter((e) => e.startsAt > (clockNow ?? state.seededAt)).sort((a, b) => a.startsAt - b.startsAt)[0]
    return (
      <div className="space-y-8">
        {header}
        <p className="rounded-lg border border-dashed px-6 py-12 text-center text-muted-foreground">
          {next ? t(x.notTonight, { event: next.name }) : x.noEvents}
        </p>
      </div>
    )
  }

  const queue = state.guests.filter((g) => g.eventId === ev.id && !g.scanned)
  const log = state.doorLog.filter((l) => l.eventId === ev.id)
  const admitted = log.filter((l) => l.verdict.ok).length
  const refused = log.length - admitted
  const mine = yourTickets(state).filter((tk2) => tk2.eventId === ev.id && tk2.status === "held")
  const connected = state.wallet.status === "connected"
  const busy = scan.phase === "verifying"

  async function run(label: string, code: string, guestId?: string) {
    setScan({ phase: "verifying", label, code })
    const res = await scanAtDoor(ev!.id, code, { id: guestId, label })
    setScan({ phase: "result", label, code, verdict: res.verdict })
  }

  function scanGuest(id: string) {
    const s = getDemo()
    const g = s?.guests.find((y) => y.id === id)
    if (!s || !g) return
    void run(g.name, guestCode(s, g), g.id)
  }

  function scanMine() {
    const s = getDemo()
    const own = s && yourTickets(s).find((y) => y.eventId === ev!.id && y.status === "held")
    if (!s || !own) return
    void run(x.yourTicket, currentCode(own))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        {header}
        <div className="flex flex-wrap items-end gap-4">
          {tonight.length > 1 && (
            <div className="space-y-1.5">
              <Label htmlFor="door-event">{x.event}</Label>
              <select
                id="door-event"
                value={ev.id}
                onChange={(e) => {
                  setChosen(e.target.value)
                  setScan({ phase: "idle" })
                }}
                className="h-11 rounded-md border border-input bg-card px-3 text-sm"
              >
                {tonight.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Counter label={x.admitted} value={admitted} tone="ok" />
          <Counter label={x.refused} value={refused} tone="void" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Viewfinder */}
        <section aria-labelledby="vf-h" className="overflow-hidden rounded-lg border bg-stock-ink text-[#f2eadb]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <h2 id="vf-h" className="label-caps">
              {x.viewfinder} · {ev.name} · {ev.venue}
            </h2>
            <span className="flex items-center gap-1.5 text-xs text-[#cfc4b1]">
              <span aria-hidden="true" className={cn("size-2 rounded-full", busy ? "animate-pulse bg-stock" : "bg-[#6ccb94]")} />
              {clockNow ? clock(clockNow, locale) : ""}
            </span>
          </div>
          <div className="relative flex min-h-[26rem] flex-col items-center justify-center gap-5 p-5 sm:p-8" aria-live="polite">
            {scan.phase === "idle" && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative size-40 rounded-md border-2 border-dashed border-[#f2eadb]/40">
                  <ScanLineIcon className="absolute inset-0 m-auto size-10 text-[#f2eadb]/50" aria-hidden="true" />
                </div>
                <p className="text-sm text-[#cfc4b1]">{x.idle}</p>
              </div>
            )}
            {scan.phase === "verifying" && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative size-44 overflow-hidden rounded-md bg-white p-2">
                  <CodeMatrix code={scan.code} />
                  <span aria-hidden="true" className="animate-scan absolute inset-x-0 h-0.5 bg-[#d93a2b] shadow-[0_0_0_1px_#d93a2b]" />
                </div>
                <p className="font-mono text-xs">{scan.code}</p>
                <p className="text-sm text-[#cfc4b1]">
                  {scan.label} · {x.verifying}
                </p>
              </div>
            )}
            {scan.phase === "result" && <Result scan={scan} state={state} copy={copy} />}
          </div>
        </section>

        {/* Queue and inputs */}
        <section aria-labelledby="queue-h" className="space-y-5">
          <div className="rounded-lg border bg-card">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <h2 id="queue-h" className="font-display text-2xl font-extrabold uppercase">
                {x.queueTitle} <span className="text-muted-foreground tabular-nums">({queue.length})</span>
              </h2>
              {queue.length > 0 ? (
                <Button className="h-10" disabled={busy} onClick={() => scanGuest(queue[0]!.id)}>
                  <ScanLineIcon aria-hidden="true" />
                  {x.scanNext}
                </Button>
              ) : (
                <Button variant="outline" className="h-10 border-input" onClick={() => refillQueue(ev.id)}>
                  <RotateCcwIcon aria-hidden="true" />
                  {x.refill}
                </Button>
              )}
            </div>
            {queue.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">{x.queueEmpty}</p>
            ) : (
              <ul className="divide-y">
                {queue.map((g) => (
                  <li key={g.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="flex items-center gap-2.5 text-sm font-medium">
                      <span className="flex size-8 items-center justify-center rounded-full bg-muted">
                        <UserIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                      </span>
                      {g.name}
                    </span>
                    <Button variant="ghost" size="sm" className="h-9 pointer-coarse:h-11" disabled={busy} onClick={() => scanGuest(g.id)}>
                      {t(x.scanGuest, { name: g.name })}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <Button variant="outline" className="h-11 w-full border-input" disabled={busy || !connected || mine.length === 0} onClick={scanMine}>
              <TicketIcon aria-hidden="true" />
              {x.scanMine}
            </Button>
            {(!connected || mine.length === 0) && (
              <p className="mt-2 text-xs text-muted-foreground">{connected ? x.noMine : d.wallet.needConnect}</p>
            )}
            <form
              className="mt-4 space-y-1.5 border-t border-dashed pt-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (manual.trim()) void run(manual.trim().toUpperCase(), manual.trim())
              }}
            >
              <Label htmlFor="door-code">{x.manualLabel}</Label>
              <div className="flex gap-2">
                <Input
                  id="door-code"
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder={x.manualPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-11 border-input bg-background font-mono uppercase"
                />
                <Button type="submit" variant="outline" className="h-11 border-input" disabled={busy || !manual.trim()}>
                  {x.manualButton}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>

      <section aria-labelledby="log-h">
        <h2 id="log-h" className="font-display text-3xl font-extrabold uppercase">
          {x.logTitle}
        </h2>
        {log.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed px-5 py-8 text-center text-sm text-muted-foreground">{x.logEmpty}</p>
        ) : (
          <ul className="mt-4 divide-y rounded-lg border bg-card">
            {log.map((l) => (
              <li key={l.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {l.guest} <span className="font-mono text-xs font-normal text-muted-foreground">{l.code}</span>
                  </p>
                  <p className={cn("text-sm", l.verdict.ok ? "text-success" : "text-destructive")}>{verdictText(copy, l.verdict)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground tabular-nums">{clock(l.at, locale)}</span>
                  <Stamp size="sm" tone={l.verdict.ok ? "admitted" : "void"} rotate={-4}>
                    {l.verdict.ok ? tk.stamps.admitted : tk.stamps.void}
                  </Stamp>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Counter({ label, value, tone }: { label: string; value: number; tone: "ok" | "void" }) {
  return (
    <div className="min-w-24 rounded-md border bg-card px-4 py-2">
      <p className="label-caps text-muted-foreground">{label}</p>
      <p className={cn("font-display text-3xl leading-none font-extrabold tabular-nums", tone === "ok" ? "text-success" : "text-destructive")}>{value}</p>
    </div>
  )
}

function Result({ scan, state, copy }: { scan: Extract<Scan, { phase: "result" }>; state: DemoState; copy: AppCopy }) {
  const { tk, d, locale } = copy
  const v = scan.verdict
  const serial = v.ok ? v.serial : v.serial
  const ticket = serial ? state.tickets.find((x) => x.serial === serial) : undefined
  const ev = ticket && state.events.find((e) => e.id === ticket.eventId)
  const tier = ev?.tiers.find((x) => x.id === ticket?.tierId)
  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-5">
      {ticket ? (
        <Ticket
          {...ticketProps(state, ticket, copy)}
          compact
          tearing={v.ok}
          shaking={!v.ok}
          stamp={{ label: v.ok ? tk.stamps.admitted : tk.stamps.void, tone: v.ok ? "admitted" : "void", animate: true }}
        />
      ) : (
        <div className="relative size-40 rounded-md bg-white p-2">
          <CodeMatrix code={scan.code} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Stamp tone="void" surface="stock" size="md" animate className="bg-white/90">
              {tk.stamps.void}
            </Stamp>
          </div>
        </div>
      )}
      <div className="text-center">
        <p className={cn("text-lg font-semibold", v.ok ? "text-[#6ccb94]" : "text-[#f2766b]")}>{verdictText(copy, v)}</p>
        <p className="mt-1 text-sm text-[#cfc4b1]">
          {scan.label}
          {v.ok && tier ? ` · ${t(d.door.seat, { section: loc(tier.section, locale), seat: v.seat })}` : ""}
        </p>
        {v.ok && v.own && ev?.rules.souvenir && <p className="mt-2 text-sm font-medium text-stock">{d.door.souvenirMinted}</p>}
      </div>
    </div>
  )
}
