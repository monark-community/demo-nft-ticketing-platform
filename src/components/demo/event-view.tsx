"use client"

import { ArrowLeftIcon, ArrowRightIcon, MinusIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Stamp } from "@/components/ticket/stamp"
import { Ticket } from "@/components/ticket/ticket"
import { Button } from "@/components/ui/button"
import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { available, buyCheck, buyPrimary, buyResale, capOf, eventById, heldFor, listingsFor, resaleCheck, royaltyOf, tierOf } from "@/lib/demo/ops"
import { NETWORK_FEE } from "@/lib/demo/seed"
import { getDemo, useDemo } from "@/lib/demo/store"
import type { DemoState, EventItem, TxError } from "@/lib/demo/types"
import { clock, longDate, loc, money, percent } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useNow } from "@/hooks/use-now"

import { useApp, type AppCopy } from "./app-context"
import { dateParts, isTonight } from "./box-office"
import { errorText, FlowFeedback, livePending, useConnect, type FlowState } from "./feedback"
import { Poster } from "./poster"
import { RareDropReveal } from "./rare-drop"
import { ticketProps } from "./ticket-props"

function varsFor(state: DemoState, ev: EventItem, error: TxError, need: number) {
  if (error === "insufficient") return { need, have: state.wallet.balance }
  if (error === "limit") return { n: heldFor(state, ev.id), max: ev.rules.perWalletLimit }
  return {}
}

export function EventView({ id }: { id: string }) {
  const copy = useApp()
  const { d, locale, categories } = copy
  const state = useDemo()
  const e = d.event

  if (!state) return <div className="h-[60vh] animate-pulse rounded-lg bg-muted" aria-busy="true" aria-label={d.loading} />
  const ev = eventById(state, id)
  if (!ev)
    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed px-6 py-20 text-center">
        <Stamp tone="void" size="lg" rotate={-6}>
          404
        </Stamp>
        <h1 className="mt-8 font-display text-4xl font-extrabold uppercase">{e.notFoundTitle}</h1>
        <p className="mt-2 text-muted-foreground">{e.notFoundBody}</p>
        <Button asChild className="mt-6 h-11">
          <Link href={href(locale, "/app")}>{e.back}</Link>
        </Button>
      </div>
    )

  const org = state.organizers.find((o) => o.id === ev.organizerId)
  const { day, month } = dateParts(ev.startsAt, locale)

  return (
    <div>
      <Link href={href(locale, "/app")} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        {e.back}
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_26rem] lg:gap-10">
        <div className="min-w-0 space-y-8">
          <header className="grid gap-6 sm:grid-cols-[14rem_1fr]">
            <Poster name={ev.name} kicker={categories[ev.category]} day={day} month={month} tone={ev.tone} className="paper-edge aspect-[3/4] rounded-lg max-sm:aspect-[16/10]" />
            <div className="min-w-0">
              {isTonight(ev) && (
                <span className="label-caps inline-flex rounded-sm bg-stock px-2 py-1 text-stock-ink">{d.boxOffice.tonight}</span>
              )}
              <h1 className="mt-3 font-display text-5xl leading-[0.9] font-extrabold tracking-tight break-words uppercase sm:text-6xl">{ev.name}</h1>
              <p className="mt-3 text-lg text-muted-foreground">{loc(ev.tagline, locale)}</p>
              {org && <p className="mt-1 text-sm text-muted-foreground">{t(e.organizedBy, { name: org.name })}</p>}
              <dl className="mt-6 grid gap-4 border-t pt-4 sm:grid-cols-2">
                <div>
                  <dt className="label-caps text-muted-foreground">{e.when}</dt>
                  <dd className="mt-1 font-semibold first-letter:uppercase">{longDate(ev.startsAt, locale)}</dd>
                  <dd className="text-sm text-muted-foreground">
                    {clock(ev.startsAt, locale)} · {t(e.doorsAt, { time: clock(ev.doorsAt, locale) })}
                  </dd>
                </div>
                <div>
                  <dt className="label-caps text-muted-foreground">{e.where}</dt>
                  <dd className="mt-1 font-semibold">{ev.venue}</dd>
                  <dd className="text-sm text-muted-foreground">{loc(ev.city, locale)}</dd>
                </div>
              </dl>
            </div>
          </header>

          <RulesCard ev={ev} copy={copy} />
          <ResaleList ev={ev} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Checkout ev={ev} />
        </aside>
      </div>
    </div>
  )
}

function RulesCard({ ev, copy }: { ev: EventItem; copy: AppCopy }) {
  const { d, tk, locale } = copy
  const items = [
    { label: tk.cap, value: t(tk.capValue, { pct: percent(ev.rules.resaleCapPct, locale) }) },
    { label: tk.royalty, value: percent(ev.rules.royaltyPct, locale) },
    { label: tk.limit, value: t(tk.limitValue, { n: ev.rules.perWalletLimit }) },
    { label: tk.souvenir, value: ev.rules.souvenir ? tk.souvenirYes : tk.souvenirNo },
  ]
  return (
    <section aria-labelledby="rules-h" className="rounded-lg border bg-card p-5">
      <h2 id="rules-h" className="font-display text-2xl font-extrabold uppercase">
        {d.event.rulesTitle}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{d.event.rulesBody}</p>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className="border-t-2 border-foreground pt-2 dark:border-primary">
            <dt className="text-xs text-muted-foreground">{i.label}</dt>
            <dd className="font-display text-2xl font-extrabold">{i.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {d.event.contract}
        <WalletAddress address={ev.contract} className="text-foreground" />
      </p>
    </section>
  )
}

function Checkout({ ev }: { ev: EventItem }) {
  const copy = useApp()
  const { d, locale, tk } = copy
  const e = d.event
  const state = useDemo() as DemoState
  const connect = useConnect()
  const firstOpen = ev.tiers.find((x) => available(x) > 0) ?? ev.tiers[0]
  const [tierId, setTierId] = useState(firstOpen?.id ?? "")
  const [qty, setQty] = useState(1)
  const [flow, setFlow] = useState<FlowState>({ phase: "idle" })
  const [mintedIds, setMintedIds] = useState<string[]>([])
  /** A rare drop waiting to be revealed: the minted ticket stays hidden here until it's put away. */
  const [drop, setDrop] = useState<string | null>(null)
  const [justRevealed, setJustRevealed] = useState(false)
  const mintedRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (justRevealed) mintedRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [justRevealed])
  const clockNow = useNow(60_000)
  const tier = tierOf(ev, tierId)
  const connected = state.wallet.status === "connected"
  const held = heldFor(state, ev.id)
  const maxQty = Math.max(1, Math.min(ev.rules.perWalletLimit - held, tier ? available(tier) : 1, 8))
  const total = (tier?.price ?? 0) * qty + NETWORK_FEE
  const busy = flow.phase === "pending"
  const past = (clockNow ?? state.seededAt) > ev.startsAt + 3 * 3_600_000
  const shown = livePending(flow, state)

  async function buy() {
    if (!tier) return
    if (!connected) {
      const ok = await connect()
      if (!ok) return
    }
    const s = getDemo()
    const pre = s && buyCheck(s, ev.id, tier.id, qty)
    if (s && pre) {
      setFlow({ phase: "error", message: errorText(copy, pre, varsFor(s, ev, pre, total)) })
      return
    }
    setFlow({ phase: "pending" })
    const tierName = loc(tier.name, locale)
    const res = await buyPrimary(ev.id, tier.id, qty, {
      kind: "buy",
      title: t(e.promptBuy, { qty, tier: tierName }),
      movesValue: true,
      lines: [
        { label: e.promptEvent, value: ev.name },
        { label: e.promptTier, value: tierName },
        { label: e.promptPrice, value: t(e.subtotal, { qty, price: money(tier.price, locale) }) },
        { label: d.prompt.fee, value: money(NETWORK_FEE, locale) },
        { label: d.prompt.total, value: money(total, locale), strong: true },
      ],
    })
    if (res.ok) {
      const after = getDemo()
      const ids = res.ids ?? []
      const serial = after?.tickets.find((x) => x.id === ids[0])?.serial ?? ""
      const message = ids.length > 1 ? t(e.successPlural, { n: ids.length }) : t(e.success, { serial })
      const rare = after?.tickets.find((x) => ids.includes(x.id) && x.rare)
      setMintedIds(rare ? [rare.id, ...ids.filter((x) => x !== rare.id)] : ids)
      setDrop(rare?.id ?? null)
      setJustRevealed(false)
      setQty(1)
      setFlow({ phase: "done", tx: res.result?.tx, message })
      // A rare drop announces itself; the toast waits until it's put away.
      if (!rare) toast.success(message)
    } else {
      const s2 = getDemo()
      setFlow({ phase: "error", tx: res.result?.tx, message: errorText(copy, res.error, s2 ? varsFor(s2, ev, res.error, total) : {}) })
    }
  }

  const minted = state.tickets.find((x) => x.id === mintedIds[0])

  return (
    <section aria-labelledby="buy-h" className="paper-edge rounded-lg border bg-card">
      <h2 id="buy-h" className="border-b px-5 py-4 font-display text-2xl font-extrabold uppercase">
        {e.tiersTitle}
      </h2>
      {past ? (
        <p className="p-5 text-sm text-muted-foreground">{e.past}</p>
      ) : (
        <div className="space-y-5 p-5">
          <fieldset>
            <legend className="sr-only">{e.tiersTitle}</legend>
            <div className="space-y-2">
              {ev.tiers.map((x) => {
                const left = available(x)
                const soldOut = left === 0
                return (
                  <label
                    key={x.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border p-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                      tierId === x.id ? "border-foreground bg-background dark:border-primary" : "border-border hover:border-input",
                      soldOut && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <input
                      type="radio"
                      name="tier"
                      value={x.id}
                      checked={tierId === x.id}
                      disabled={soldOut || busy}
                      onChange={() => {
                        setTierId(x.id)
                        setQty(1)
                        setFlow({ phase: "idle" })
                      }}
                      className="size-4 accent-[var(--foreground)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{loc(x.name, locale)}</span>
                      <span className={cn("block text-xs", soldOut ? "font-semibold text-destructive" : "text-muted-foreground")}>
                        {soldOut ? e.tierSoldOut : t(e.tierLeft, { n: left })}
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums">{money(x.price, locale)}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {tier && available(tier) > 0 && (
            <>
              <div className="flex items-center justify-between gap-4">
                <span id="qty-label" className="text-sm font-semibold">
                  {e.quantity}
                </span>
                <div className="flex items-center gap-1" role="group" aria-labelledby="qty-label">
                  <Button variant="outline" size="icon" className="size-10 border-input" aria-label={e.decrease} disabled={qty <= 1 || busy} onClick={() => setQty((q) => q - 1)}>
                    <MinusIcon aria-hidden="true" />
                  </Button>
                  <output aria-live="polite" className="w-10 text-center font-display text-2xl font-extrabold tabular-nums">
                    {qty}
                  </output>
                  <Button variant="outline" size="icon" className="size-10 border-input" aria-label={e.increase} disabled={qty >= maxQty || busy} onClick={() => setQty((q) => q + 1)}>
                    <PlusIcon aria-hidden="true" />
                  </Button>
                </div>
              </div>
              {connected && <p className="text-xs text-muted-foreground">{t(e.holding, { n: held, max: ev.rules.perWalletLimit })}</p>}

              <dl className="space-y-1.5 border-t border-dashed pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t(e.subtotal, { qty, price: money(tier.price, locale) })}</dt>
                  <dd className="tabular-nums">{money(tier.price * qty, locale)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{e.fee}</dt>
                  <dd className="tabular-nums">{money(NETWORK_FEE, locale)}</dd>
                </div>
                <div className="flex justify-between border-t pt-2 text-base font-bold">
                  <dt>{e.total}</dt>
                  <dd className="tabular-nums">{money(total, locale)}</dd>
                </div>
              </dl>
              <Button className="h-12 w-full text-base" disabled={busy} onClick={() => void buy()}>
                {busy ? e.buying : !connected ? e.connectToBuy : t(qty > 1 ? e.buyPlural : e.buy, { qty })}
              </Button>
            </>
          )}
          {tier && available(tier) === 0 && flow.phase === "idle" && <p className="text-sm font-medium text-destructive">{d.tx.errors.soldOut}</p>}

          <FlowFeedback state={shown} />
          {flow.phase === "done" && minted && drop === minted.id && (
            <RareDropReveal
              key={minted.id}
              ticket={minted}
              onDone={() => {
                setDrop(null)
                setJustRevealed(true)
                if (flow.phase === "done") toast.success(flow.message)
              }}
            />
          )}
          {flow.phase === "done" && minted && drop !== minted.id && (
            <div ref={mintedRef} className={cn("space-y-3", justRevealed && "animate-in duration-500 fade-in-0 zoom-in-90")}>
              <Ticket
                {...ticketProps(state, minted, copy)}
                compact
                sweep={justRevealed}
                stamp={{ label: tk.stamps.minted, tone: "ink", animate: true }}
              />
              <Link href={href(locale, "/app/wallet")} className="inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline">
                {e.seeWallet}
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function ResaleList({ ev }: { ev: EventItem }) {
  const copy = useApp()
  const { d, locale } = copy
  const e = d.event
  const state = useDemo() as DemoState
  const connect = useConnect()
  const [active, setActive] = useState<string | null>(null)
  const [flow, setFlow] = useState<FlowState>({ phase: "idle" })
  const rows = listingsFor(state, ev.id)
  const you = state.wallet.address.toLowerCase()

  async function buy(listingId: string) {
    setActive(listingId)
    if (state.wallet.status !== "connected") {
      const ok = await connect()
      if (!ok) return
    }
    const s = getDemo()
    const l = s?.listings.find((x) => x.id === listingId)
    const tkt = l && s?.tickets.find((x) => x.id === l.ticketId)
    if (!s || !l || !tkt) return
    const pre = resaleCheck(s, listingId)
    const total = l.price + NETWORK_FEE
    if (pre) {
      setFlow({ phase: "error", message: errorText(copy, pre, varsFor(s, ev, pre, total)) })
      return
    }
    setFlow({ phase: "pending" })
    const royalty = royaltyOf(ev, l.price)
    const res = await buyResale(listingId, {
      kind: "buyResale",
      title: t(e.promptBuyResale, { serial: tkt.serial }),
      movesValue: true,
      lines: [
        { label: e.promptEvent, value: ev.name },
        { label: e.promptPrice, value: money(l.price, locale) },
        { label: e.promptRoyalty, value: money(royalty, locale) },
        { label: d.prompt.fee, value: money(NETWORK_FEE, locale) },
        { label: d.prompt.total, value: money(total, locale), strong: true },
      ],
    })
    if (res.ok) {
      const message = t(e.resaleSuccess, { serial: tkt.serial, royalty: money(royalty, locale) })
      setFlow({ phase: "done", tx: res.result?.tx, message })
      toast.success(message)
    } else {
      const s2 = getDemo()
      setFlow({ phase: "error", tx: res.result?.tx, message: errorText(copy, res.error, s2 ? varsFor(s2, ev, res.error, total) : {}) })
    }
  }

  const shown = livePending(flow, state)
  return (
    <section aria-labelledby="resale-h">
      <h2 id="resale-h" className="font-display text-3xl font-extrabold uppercase">
        {t(e.resaleTitle, { pct: percent(ev.rules.resaleCapPct, locale) })}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{e.resaleBody}</p>
      {rows.length === 0 && flow.phase !== "done" ? (
        <p className="mt-4 rounded-lg border border-dashed px-5 py-8 text-center text-sm text-muted-foreground">{e.resaleEmpty}</p>
      ) : (
        <ul className="mt-4 divide-y rounded-lg border bg-card">
          {rows.map(({ listing, ticket }) => {
            const tier = tierOf(ev, ticket.tierId)
            const face = tier?.price ?? ticket.paid
            const cap = capOf(ev, face)
            const mine = listing.seller.toLowerCase() === you
            return (
              <li key={listing.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="font-display text-2xl font-extrabold tabular-nums">{ticket.serial}</span>
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold">
                      {tier ? loc(tier.name, locale) : ""} · {ticket.seat}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {mine ? (
                        e.yourListing
                      ) : (
                        <>
                          {e.seller} <WalletAvatar address={listing.seller} size={14} />
                          <WalletAddress address={listing.seller} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{money(listing.price, locale)}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {`${copy.tk.cap} ${money(cap, locale)}`}
                    </p>
                  </div>
                  {!mine && (
                    <Button
                      variant="outline"
                      className="h-11 border-input"
                      disabled={flow.phase === "pending"}
                      onClick={() => void buy(listing.id)}
                      aria-label={`${t(e.buyResale, { price: money(listing.price, locale) })} · ${ticket.serial}`}
                    >
                      {t(e.buyResale, { price: money(listing.price, locale, false) })}
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {active && <FlowFeedback state={shown} className="mt-4" />}
    </section>
  )
}

