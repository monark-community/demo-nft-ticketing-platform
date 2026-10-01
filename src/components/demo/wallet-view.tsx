"use client"

import { ArrowRightIcon, CoinsIcon, EyeIcon, EyeOffIcon, TagIcon, TicketIcon, UsersIcon, WalletIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { EntryCode } from "@/components/ticket/entry-code"
import { ResaleRail } from "@/components/ticket/resale-rail"
import { Ticket } from "@/components/ticket/ticket"
import { Button } from "@/components/ui/button"
import { NftCard } from "@/components/ui/nft-card"
import { TxStatus } from "@/components/ui/tx-status"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { capOf, capPctOf, cancelListing, eventById, faceOf, faucet, listTicket, royaltyOf, simulateBuyer, yourTickets } from "@/lib/demo/ops"
import { NETWORK_FEE } from "@/lib/demo/seed"
import { useNow } from "@/hooks/use-now"
import { getDemo, useDemo } from "@/lib/demo/store"
import type { DemoState, Ticket as TicketT } from "@/lib/demo/types"
import { ago, clock, eventDate, money } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useApp } from "./app-context"
import { isTonight } from "./box-office"
import { errorText, FlowFeedback, livePending, txLabel, useConnect, type FlowState } from "./feedback"
import { souvenirArt } from "./souvenir-art"
import { FlipButton } from "./rare-drop"
import { ticketProps } from "./ticket-props"

export function WalletView() {
  const copy = useApp()
  const { d, locale } = copy
  const w = d.walletView
  const state = useDemo()
  const connect = useConnect()
  const [notice, setNotice] = useState<FlowState>({ phase: "idle" })
  const [faucetFlow, setFaucetFlow] = useState<FlowState>({ phase: "idle" })

  if (!state) return <div className="h-[60vh] animate-pulse rounded-lg bg-muted" aria-busy="true" aria-label={d.loading} />

  if (state.wallet.status !== "connected")
    return (
      <div>
        <h1 className="font-display text-5xl leading-none font-extrabold tracking-tight uppercase sm:text-6xl">{w.title}</h1>
        <div className="mt-8 flex flex-col items-center rounded-lg border border-dashed bg-card px-6 py-16 text-center">
          <WalletIcon className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-4 max-w-md text-muted-foreground">{d.wallet.needConnect}</p>
          <Button className="mt-6 h-12 px-6" onClick={() => void connect()} disabled={state.wallet.status === "connecting"}>
            {state.wallet.status === "connecting" ? d.wallet.connecting : d.wallet.connect}
          </Button>
        </div>
      </div>
    )

  const tickets = yourTickets(state).sort((a, b) => {
    const ea = eventById(state, a.eventId)?.startsAt ?? 0
    const eb = eventById(state, b.eventId)?.startsAt ?? 0
    return (a.status === "used" ? 1 : 0) - (b.status === "used" ? 1 : 0) || ea - eb
  })

  async function getFunds() {
    setFaucetFlow({ phase: "pending" })
    const res = await faucet({
      kind: "faucet",
      title: w.promptFaucet,
      movesValue: true,
      lines: [{ label: w.amount, value: money(20_000, locale), strong: true }],
    })
    if (res.ok) {
      setFaucetFlow({ phase: "done", tx: res.result?.tx, message: w.faucetDone })
      toast.success(w.faucetDone)
    } else setFaucetFlow({ phase: "error", tx: res.result?.tx, message: errorText(copy, res.error) })
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-5xl leading-none font-extrabold tracking-tight uppercase sm:text-6xl">{w.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{w.intro}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 lg:min-w-80">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="label-caps text-muted-foreground">{d.balance}</p>
              <p className="font-display text-3xl font-extrabold tabular-nums">{money(state.wallet.balance, locale)}</p>
            </div>
            <Button variant="outline" className="h-11 border-input" onClick={() => void getFunds()} disabled={faucetFlow.phase === "pending"}>
              <CoinsIcon aria-hidden="true" />
              {d.wallet.getFunds}
            </Button>
          </div>
          <FlowFeedback state={livePending(faucetFlow, state)} className="mt-3" />
        </div>
      </header>

      <FlowFeedback state={notice} />

      <section aria-labelledby="tickets-h">
        <h2 id="tickets-h" className="font-display text-3xl font-extrabold uppercase">
          {w.upcoming}
        </h2>
        {tickets.length === 0 ? (
          <div className="mt-4 flex flex-col items-center rounded-lg border border-dashed px-6 py-14 text-center">
            <TicketIcon className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 text-lg font-semibold">{w.emptyTitle}</p>
            <p className="mt-1 text-muted-foreground">{w.emptyBody}</p>
            <Button asChild className="mt-5 h-11">
              <Link href={href(locale, "/app")}>{w.browse}</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-5 grid gap-10 xl:grid-cols-2">
            {tickets.map((tkt) => (
              <li key={tkt.id}>
                <TicketItem ticket={tkt} state={state} onSold={setNotice} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Souvenirs state={state} />
      <Activity state={state} />
    </div>
  )
}

function TicketItem({ ticket, state, onSold }: { ticket: TicketT; state: DemoState; onSold: (f: FlowState) => void }) {
  const copy = useApp()
  const { d, locale, tk, rail } = copy
  const w = d.walletView
  const ev = eventById(state, ticket.eventId)
  const face = faceOf(state, ticket)
  const cap = ev ? capOf(ev, face, ticket) : face
  const [showCode, setShowCode] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [reselling, setReselling] = useState(false)
  const [price, setPrice] = useState(cap)
  const [flow, setFlow] = useState<FlowState>({ phase: "idle" })
  const listing = state.listings.find((l) => l.ticketId === ticket.id)
  const busy = flow.phase === "pending"
  if (!ev) return null

  async function list(bypass: boolean) {
    const p = bypass ? cap + Math.round(face * 0.25) : price
    setFlow({ phase: "pending" })
    const res = await listTicket(
      ticket.id,
      p,
      {
        kind: "list",
        title: t(w.promptList, { serial: ticket.serial }),
        movesValue: true,
        lines: [
          { label: d.event.promptEvent, value: ev!.name },
          { label: d.event.promptPrice, value: money(p, locale), strong: true },
          { label: t(rail.royaltyTo, { pct: `${ev!.rules.royaltyPct} %` }), value: money(royaltyOf(ev!, p), locale) },
          { label: d.prompt.fee, value: money(NETWORK_FEE, locale) },
        ],
      },
      bypass
    )
    if (res.ok) {
      const message = t(w.listed, { serial: ticket.serial, price: money(p, locale) })
      setFlow({ phase: "done", tx: res.result?.tx, message })
      setReselling(false)
      toast.success(message)
    } else setFlow({ phase: "error", tx: res.result?.tx, message: errorText(copy, res.error, { cap }) })
  }

  async function cancel() {
    setFlow({ phase: "pending" })
    const res = await cancelListing(ticket.id, {
      kind: "cancelListing",
      title: t(w.promptCancel, { serial: ticket.serial }),
      movesValue: true,
      lines: [{ label: d.prompt.fee, value: money(NETWORK_FEE, locale) }],
    })
    if (res.ok) {
      const message = t(w.cancelled, { serial: ticket.serial })
      setFlow({ phase: "done", tx: res.result?.tx, message })
      toast.success(message)
    } else setFlow({ phase: "error", tx: res.result?.tx, message: errorText(copy, res.error) })
  }

  async function sell() {
    if (!listing) return
    setFlow({ phase: "pending" })
    const royalty = royaltyOf(ev!, listing.price)
    const res = await simulateBuyer(ticket.id)
    if (res.ok) {
      const message = t(w.sold, {
        serial: ticket.serial,
        price: money(listing.price, locale),
        proceeds: money(listing.price - royalty, locale),
        royalty: money(royalty, locale),
      })
      onSold({ phase: "done", tx: res.result?.tx, message })
      toast.success(message)
    } else setFlow({ phase: "error", tx: res.result?.tx, message: errorText(copy, res.error) })
  }

  const used = ticket.status === "used"
  const stamp = used
    ? { label: tk.stamps.admitted, tone: "admitted" as const }
    : listing
      ? { label: tk.stamps.listed, tone: "pending" as const }
      : undefined

  return (
    <article aria-label={`${ev.name} · ${tk.serial} ${ticket.serial}`} className="space-y-4">
      <Ticket
        {...ticketProps(state, ticket, copy)}
        dimmed={used}
        flipped={flipped}
        stamp={stamp}
        stub={
          showCode && !used ? <EntryCode ticket={ticket} signer={ticket.owner} labels={tk} size="sm" /> : undefined
        }
      />
      <div className="flex flex-wrap gap-2">
        {ticket.rare && <FlipButton flipped={flipped} onFlip={() => setFlipped((f) => !f)} labels={tk} />}
        {!used && !listing && (
          <>
            <Button variant={showCode ? "default" : "outline"} className={cn("h-11", !showCode && "border-input")} onClick={() => setShowCode((v) => !v)} aria-pressed={showCode}>
              {showCode ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
              {showCode ? w.hideCode : w.showCode}
            </Button>
            <Button
              variant="outline"
              className="h-11 border-input"
              aria-expanded={reselling}
              disabled={busy}
              onClick={() => {
                setReselling((v) => !v)
                setFlow({ phase: "idle" })
              }}
            >
              <TagIcon aria-hidden="true" />
              {w.resell}
            </Button>
            {isTonight(ev) && (
              <Button asChild variant="ghost" className="h-11">
                <Link href={href(locale, "/app/door")}>
                  {w.goToDoor}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
            )}
          </>
        )}
        {listing && (
          <>
            <span className="inline-flex h-11 items-center rounded-md bg-muted px-3 text-sm font-semibold tabular-nums">
              {t(w.listedAt, { price: money(listing.price, locale) })}
            </span>
            <Button className="h-11" disabled={busy} onClick={() => void sell()}>
              <UsersIcon aria-hidden="true" />
              {w.simulateBuyer}
            </Button>
            <Button variant="outline" className="h-11 border-input" disabled={busy} onClick={() => void cancel()}>
              <XIcon aria-hidden="true" />
              {w.cancelListing}
            </Button>
          </>
        )}
        {used && ticket.usedAt && (
          <p className="text-sm text-muted-foreground">{t(w.used, { time: `${eventDate(ticket.usedAt, locale)} · ${clock(ticket.usedAt, locale)}` })}</p>
        )}
      </div>

      {reselling && !listing && (
        <div className="rounded-lg border bg-card p-5">
          <h3 className="font-display text-2xl font-extrabold uppercase">{t(w.resellTitle, { serial: ticket.serial })}</h3>
          <div className="mb-5" />
          <ResaleRail
            face={face}
            capPct={capPctOf(ev, ticket)}
            royaltyPct={ev.rules.royaltyPct}
            value={price}
            onChange={setPrice}
            locale={locale}
            labels={rail}
            you
          />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button className="h-12 px-5" disabled={busy} onClick={() => void list(false)}>
              {busy ? w.listing : t(w.listButton, { price: money(price, locale) })}
            </Button>
            <Button variant="ghost" className="h-11" onClick={() => setReselling(false)} disabled={busy}>
              {w.cancel}
            </Button>
          </div>
          <div className="mt-4 border-t border-dashed pt-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void list(true)}
              className="text-sm font-semibold text-destructive underline underline-offset-4 disabled:opacity-50"
            >
              {w.bypass}
            </button>
          </div>
        </div>
      )}
      <FlowFeedback state={livePending(flow, getDemo())} />
    </article>
  )
}

function Souvenirs({ state }: { state: DemoState }) {
  const { d, locale } = useApp()
  const w = d.walletView
  return (
    <section aria-labelledby="souv-h">
      <h2 id="souv-h" className="font-display text-3xl font-extrabold uppercase">
        {w.souvenirsTitle}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{w.souvenirsBody}</p>
      {state.souvenirs.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed px-5 py-8 text-center text-sm text-muted-foreground">{w.souvenirsEmpty}</p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {state.souvenirs.map((s) => {
            const date = eventDate(s.date, locale)
            return (
              <li key={s.id}>
                <NftCard
                  name={s.eventName}
                  image={souvenirArt(s, date)}
                  imageAlt=""
                  collection={w.souvenirCollection}
                  price={`Nº ${s.serial}`}
                  priceSecondary={t(w.souvenirMinted, { date })}
                  className="paper-edge max-w-none rounded-lg"
                />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Activity({ state }: { state: DemoState }) {
  const copy = useApp()
  const { d, locale } = copy
  const w = d.walletView
  const now = useNow(30_000) ?? state.seededAt
  return (
    <section aria-labelledby="act-h">
      <h2 id="act-h" className="font-display text-3xl font-extrabold uppercase">
        {w.activityTitle}
      </h2>
      {state.txs.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed px-5 py-8 text-center text-sm text-muted-foreground">{w.activityEmpty}</p>
      ) : (
        <ul className="mt-4 divide-y rounded-lg border bg-card">
          {state.txs.map((tx) => (
            <li key={tx.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">{txLabel(copy, tx)}</p>
                <p className="text-xs text-muted-foreground">
                  {ago(tx.at, now, locale)}
                  {tx.error && ` · ${d.tx.short[tx.error]}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {typeof tx.amount === "number" && tx.state === "confirmed" && (
                  <span className={cn("font-semibold tabular-nums", tx.amount > 0 ? "text-success" : "")}>
                    {tx.amount > 0 ? "+" : "−"}
                    {money(Math.abs(tx.amount), locale)}
                  </span>
                )}
                {tx.error === "rejected" ? (
                  <span className="text-sm font-medium text-destructive">{d.tx.failed}</span>
                ) : (
                  <TxStatus status={tx.state} hash={tx.hash} label={d.tx[tx.state]} className="bg-background" />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
