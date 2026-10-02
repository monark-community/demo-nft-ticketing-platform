"use client"

import { ArrowRightIcon, CoinsIcon, EyeIcon, EyeOffIcon, SparklesIcon, TagIcon, TicketIcon, UsersIcon, WalletIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { EntryCode } from "@/components/ticket/entry-code"
import { ResaleRail } from "@/components/ticket/resale-rail"
import { Ticket } from "@/components/ticket/ticket"
import { Button } from "@/components/ui/button"
import { NftCard } from "@/components/ui/nft-card"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TxStatus } from "@/components/ui/tx-status"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { capOf, capPctOf, cancelListing, eventById, faceOf, faucet, listTicket, median, recentSales, royaltyOf, simulateBuyer, soldTickets, yourTickets, type SoldTicket } from "@/lib/demo/ops"
import { NETWORK_FEE } from "@/lib/demo/seed"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useNow } from "@/hooks/use-now"
import { getDemo, useDemo } from "@/lib/demo/store"
import type { DemoState, Ticket as TicketT } from "@/lib/demo/types"
import { ago, clock, eventDate, loc, money } from "@/lib/format"
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
  /** Used and sold tickets stay in the inventory, filtered out of the default view. */
  const [view, setView] = useState<"active" | "used" | "sold">("active")

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

  const byShow = (a: TicketT, b: TicketT) => (eventById(state, a.eventId)?.startsAt ?? 0) - (eventById(state, b.eventId)?.startsAt ?? 0)
  const mine = yourTickets(state)
  const active = mine.filter((x) => x.status !== "used").sort(byShow)
  const used = mine.filter((x) => x.status === "used").sort((a, b) => (b.usedAt ?? 0) - (a.usedAt ?? 0))
  const sold = soldTickets(state)
  const f = w.filters

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

      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} asChild>
      <section aria-labelledby="tickets-h">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <h2 id="tickets-h" className="font-display text-3xl font-extrabold uppercase">
            {w.upcoming}
          </h2>
          <TabsList aria-label={f.label} className="h-11 pointer-coarse:h-12">
            {(
              [
                ["active", f.active, active.length],
                ["used", f.used, used.length],
                ["sold", f.sold, sold.length],
              ] as const
            ).map(([key, label, n]) => (
              <TabsTrigger key={key} value={key} className="h-9 gap-1.5 px-3.5 font-semibold pointer-coarse:h-10">
                {label}
                <span className="tabular-nums opacity-60">{n}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="active" className="mt-0">
        {active.length === 0 ? (
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
            {active.map((tkt) => (
              <li key={tkt.id}>
                <TicketItem ticket={tkt} state={state} onSold={setNotice} />
              </li>
            ))}
          </ul>
        )}
        </TabsContent>

        <TabsContent value="used" className="mt-0">
          {used.length === 0 ? (
            <p className="mt-5 rounded-lg border border-dashed px-5 py-10 text-center text-sm text-muted-foreground">{f.usedEmpty}</p>
          ) : (
            <ul className="mt-5 grid gap-10 xl:grid-cols-2">
              {used.map((tkt) => (
                <li key={tkt.id}>
                  <TicketItem ticket={tkt} state={state} onSold={setNotice} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="sold" className="mt-0">
          {sold.length === 0 ? (
            <p className="mt-5 rounded-lg border border-dashed px-5 py-10 text-center text-sm text-muted-foreground">{f.soldEmpty}</p>
          ) : (
            <ul className="mt-5 grid gap-10 xl:grid-cols-2">
              {sold.map((x) => (
                <li key={x.ticket.id}>
                  <SoldItem sale={x} state={state} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </section>
      </Tabs>

      <Souvenirs state={state} />
      <Activity state={state} />
    </div>
  )
}

/** A ticket you resold: kept for the record, greyed, with what it sold for and what reached you. */
function SoldItem({ sale, state }: { sale: SoldTicket; state: DemoState }) {
  const copy = useApp()
  const { d, locale, tk } = copy
  const f = d.walletView.filters
  const now = useNow(60_000) ?? state.seededAt
  const [flipped, setFlipped] = useState(false)
  const ev = eventById(state, sale.ticket.eventId)
  if (!ev) return null
  return (
    <article aria-label={`${ev.name} · ${tk.serial} ${sale.ticket.serial} · ${tk.stamps.sold}`} className="space-y-3">
      <Ticket {...ticketProps(state, sale.ticket, copy)} dimmed flipped={flipped} stamp={{ label: tk.stamps.sold, tone: "ink" }} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {sale.ticket.rare && <FlipButton flipped={flipped} onFlip={() => setFlipped((v) => !v)} labels={tk} />}
        <div className="text-sm">
          <p className="font-semibold tabular-nums">{t(f.soldFor, { price: money(sale.price, locale), ago: ago(sale.at, now, locale) })}</p>
          <p className="text-muted-foreground tabular-nums">{t(f.received, { amount: money(sale.proceeds, locale) })}</p>
        </div>
      </div>
    </article>
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
  const wide = useMediaQuery("(min-width: 768px)")
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

  function openResell(open: boolean) {
    if (busy) return
    setReselling(open)
    if (open) setFlow({ phase: "idle" })
  }

  const resellButton = (
    <Button variant="outline" className="h-11 border-input" aria-expanded={reselling} disabled={busy} onClick={() => openResell(!reselling)}>
      <TagIcon aria-hidden="true" />
      {w.resell}
    </Button>
  )
  const panel = (
    <ResellPanel
      ticket={ticket}
      state={state}
      price={price}
      setPrice={setPrice}
      cap={cap}
      face={face}
      busy={busy}
      flow={flow}
      onList={(bypass) => void list(bypass)}
      onCancel={() => setReselling(false)}
    />
  )

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
            {resellButton}
            {/* Resell: the ticket beside the form (stacked on phones). Held open while the wallet prompt signs. */}
            <Dialog open={reselling} onOpenChange={openResell}>
              <DialogContent
                closeLabel={w.cancel}
                className="max-w-5xl gap-0 p-0 max-sm:max-h-dvh max-sm:rounded-none"
                onInteractOutside={(e) => busy && e.preventDefault()}
                onEscapeKeyDown={(e) => busy && e.preventDefault()}
              >
                <div className="grid md:grid-cols-[minmax(0,1fr)_27rem]">
                  <div className="flex items-center bg-muted/60 p-4 pt-12 max-md:border-b sm:p-8 md:border-r">
                    {/* Phones: the compact ticket, so the form starts on the first screen (the cap is in the form). */}
                    <Ticket {...ticketProps(state, ticket, copy)} compact={!wide} />
                  </div>
                  <div className="p-5 sm:p-6">{panel}</div>
                </div>
              </DialogContent>
            </Dialog>
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

      {!reselling && <FlowFeedback state={livePending(flow, getDemo())} />}
    </article>
  )
}

/** Resell form: what similar tickets sold for lately, the capped price rail, and the listing actions. */
function ResellPanel({
  ticket,
  state,
  price,
  setPrice,
  cap,
  face,
  busy,
  flow,
  onList,
  onCancel,
}: {
  ticket: TicketT
  state: DemoState
  price: number
  setPrice: (p: number) => void
  cap: number
  face: number
  busy: boolean
  flow: FlowState
  onList: (bypass: boolean) => void
  onCancel: () => void
}) {
  const { d, locale, rail } = useApp()
  const w = d.walletView
  const ev = eventById(state, ticket.eventId)
  if (!ev) return null
  return (
    <div className="space-y-5">
      <div className="pr-8">
        <DialogTitle className="font-display text-2xl leading-tight font-extrabold uppercase">{t(w.resellTitle, { serial: ticket.serial })}</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">{w.resellBody}</DialogDescription>
      </div>
      <MarketPrices ticket={ticket} state={state} cap={cap} onPick={setPrice} disabled={busy} />
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button className="h-12 px-5" disabled={busy} onClick={() => onList(false)}>
          {busy ? w.listing : t(w.listButton, { price: money(price, locale) })}
        </Button>
        <Button variant="ghost" className="h-11" onClick={onCancel} disabled={busy}>
          {w.cancel}
        </Button>
      </div>
      <FlowFeedback state={livePending(flow, getDemo())} />
      <div className="border-t border-dashed pt-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => onList(true)}
          className="text-sm font-semibold text-destructive underline underline-offset-4 disabled:opacity-50"
        >
          {w.bypass}
        </button>
      </div>
    </div>
  )
}

/** Recent resales of this tier (foils apart), with their median one tap away (held to the cap). */
function MarketPrices({
  ticket,
  state,
  cap,
  onPick,
  disabled,
}: {
  ticket: TicketT
  state: DemoState
  cap: number
  onPick: (p: number) => void
  disabled?: boolean
}) {
  const { d, locale } = useApp()
  const m = d.walletView.market
  const now = useNow(60_000) ?? state.seededAt
  const ev = eventById(state, ticket.eventId)
  const tier = ev?.tiers.find((x) => x.id === ticket.tierId)
  const tierName = tier ? loc(tier.name, locale) : ""
  const { similar, foil } = recentSales(state, ticket)
  const rows = [
    ...(ticket.rare ? [{ key: "foil", label: t(m.foil, { tier: tierName }), sales: foil, foil: true }] : []),
    { key: "similar", label: t(m.similar, { tier: tierName }), sales: similar, foil: false },
  ]
  return (
    <section aria-labelledby={`mkt-${ticket.id}`} className="rounded-md border bg-background p-3.5">
      <h4 id={`mkt-${ticket.id}`} className="label-caps text-muted-foreground">
        {m.title}
      </h4>
      <div className="mt-2 space-y-3">
        {rows.map((row) => {
          const mid = median(row.sales)
          return (
            <div key={row.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  {row.foil && <SparklesIcon className="size-3.5" aria-hidden="true" />}
                  {row.label}
                </p>
                {mid !== null && (
                  <p className="flex items-center gap-2 text-sm">
                    <span className="tabular-nums">{t(m.median, { price: money(mid, locale) })}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-input pointer-coarse:h-9"
                      disabled={disabled}
                      onClick={() => onPick(Math.min(mid, cap))}
                      aria-label={t(m.useLabel, { price: money(Math.min(mid, cap), locale) })}
                    >
                      {m.use}
                    </Button>
                  </p>
                )}
              </div>
              {row.sales.length === 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">{m.none}</p>
              ) : (
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {row.sales.slice(0, 4).map((s) => (
                    <li key={`${s.serial}-${s.at}`} className="rounded-sm bg-muted px-1.5 py-0.5 text-xs tabular-nums">
                      <span className="font-semibold">{money(s.price, locale)}</span>
                      <span className="text-muted-foreground"> · {ago(s.at, now, locale)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
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
