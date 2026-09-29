"use client"

import { entryCode, staleCode, verifyCode } from "./code"
import { randomAddress, randomHex, txHash, uid } from "./ids"
import { latency, runTx, sleep, type RunResult } from "./chain"
import { FAUCET_AMOUNT, NETWORK_FEE } from "./seed"
import { getDemo, requestSignature, setWallet, update } from "./store"
import type {
  Cents,
  DemoState,
  DoorVerdict,
  EventItem,
  Guest,
  L10n,
  Ticket,
  TicketRules,
  Tier,
  TxError,
  TxSummary,
} from "./types"

/**
 * Every action the UI can take. Each returns a plain result the UI turns into
 * copy; prompts are built by the UI (it owns the words), the rules live here.
 */

export type OpResult = { ok: true; result?: RunResult; ids?: string[] } | { ok: false; error: TxError; result?: RunResult }

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

/* ----------------------------------------------------------------- selectors */

export function eventById(s: DemoState, id: string): EventItem | undefined {
  return s.events.find((e) => e.id === id)
}

export function tierOf(ev: EventItem, tierId: string): Tier | undefined {
  return ev.tiers.find((t) => t.id === tierId)
}

export function yourTickets(s: DemoState): Ticket[] {
  return s.tickets.filter((t) => same(t.owner, s.wallet.address))
}

/** Tickets your wallet holds for an event (held, listed or used all count toward the limit). */
export function heldFor(s: DemoState, eventId: string): number {
  return yourTickets(s).filter((t) => t.eventId === eventId).length
}

export function capOf(ev: EventItem, face: Cents): Cents {
  return Math.floor((face * ev.rules.resaleCapPct) / 100)
}

export function royaltyOf(ev: EventItem, price: Cents): Cents {
  return Math.round((price * ev.rules.royaltyPct) / 100)
}

export function faceOf(s: DemoState, t: Ticket): Cents {
  const ev = eventById(s, t.eventId)
  return (ev && tierOf(ev, t.tierId)?.price) ?? t.paid
}

export function listingsFor(s: DemoState, eventId: string) {
  return s.listings
    .map((l) => ({ listing: l, ticket: s.tickets.find((t) => t.id === l.ticketId) }))
    .filter((x): x is { listing: (typeof s.listings)[number]; ticket: Ticket } => !!x.ticket && x.ticket.eventId === eventId)
    .sort((a, b) => a.listing.price - b.listing.price)
}

export function available(t: Tier): number {
  return Math.max(0, t.supply - t.sold)
}

/* ------------------------------------------------------------------- wallet */

export async function connectWallet(summary: TxSummary): Promise<boolean> {
  setWallet({ status: "connecting" })
  const ok = await requestSignature(summary)
  if (!ok) {
    setWallet({ status: "disconnected" })
    return false
  }
  await sleep(600)
  setWallet({ status: "connected" })
  return true
}

export function disconnectWallet() {
  setWallet({ status: "disconnected" })
}

export async function faucet(summary: TxSummary): Promise<OpResult> {
  const result = await runTx({
    kind: "faucet",
    summary,
    vars: {},
    amount: FAUCET_AMOUNT,
    apply: (s) => ({ ...s, wallet: { ...s.wallet, balance: s.wallet.balance + FAUCET_AMOUNT } }),
  })
  return result.ok ? { ok: true, result } : { ok: false, error: result.tx.error ?? "network", result }
}

/* ------------------------------------------------------------------ buying */

export function buyCheck(s: DemoState, eventId: string, tierId: string, qty: number): TxError | null {
  const ev = eventById(s, eventId)
  const tier = ev && tierOf(ev, tierId)
  if (!ev || !tier) return "gone"
  if (available(tier) < qty) return "soldOut"
  if (heldFor(s, eventId) + qty > ev.rules.perWalletLimit) return "limit"
  if (s.wallet.balance < tier.price * qty + NETWORK_FEE) return "insufficient"
  return null
}

function seatFor(tier: Tier, index: number): string {
  if (["floor", "ga", "early", "standard", "student"].includes(tier.id) || tier.supply > 1000) return "GA"
  const row = String.fromCharCode(65 + (Math.floor(index / 24) % 26))
  return `${row}·${(index % 24) + 1}`
}

function mint(s: DemoState, ev: EventItem, tier: Tier, qty: number, paid: Cents): { state: DemoState; ids: string[] } {
  const ids: string[] = []
  const tickets: Ticket[] = []
  let serial = s.nextSerial
  for (let i = 0; i < qty; i++) {
    const id = `t-${serial}-${randomHex(4)}`
    ids.push(id)
    tickets.push({
      id,
      serial: String(serial).padStart(4, "0"),
      eventId: ev.id,
      tierId: tier.id,
      seat: seatFor(tier, tier.sold + i),
      owner: s.wallet.address,
      previousOwners: [],
      paid,
      status: "held",
      mintedAt: Date.now(),
    })
    serial++
  }
  return {
    ids,
    state: {
      ...s,
      nextSerial: serial,
      tickets: [...s.tickets, ...tickets],
      events: s.events.map((e) =>
        e.id === ev.id ? { ...e, tiers: e.tiers.map((t) => (t.id === tier.id ? { ...t, sold: t.sold + qty } : t)) } : e
      ),
    },
  }
}

export async function buyPrimary(eventId: string, tierId: string, qty: number, summary: TxSummary): Promise<OpResult> {
  const s = getDemo()
  if (!s) return { ok: false, error: "network" }
  const pre = buyCheck(s, eventId, tierId, qty)
  if (pre) return { ok: false, error: pre }
  const ev = eventById(s, eventId) as EventItem
  const tier = tierOf(ev, tierId) as Tier
  const total = tier.price * qty + NETWORK_FEE
  let ids: string[] = []
  const result = await runTx({
    kind: "buy",
    summary,
    vars: { event: ev.name, qty, serial: String(s.nextSerial).padStart(4, "0") },
    amount: -total,
    check: (st) => buyCheck(st, eventId, tierId, qty),
    apply: (st) => {
      const e = eventById(st, eventId) as EventItem
      const t = tierOf(e, tierId) as Tier
      const minted = mint(st, e, t, qty, t.price)
      ids = minted.ids
      return { ...minted.state, wallet: { ...minted.state.wallet, balance: minted.state.wallet.balance - total } }
    },
  })
  return result.ok ? { ok: true, result, ids } : { ok: false, error: result.tx.error ?? "network", result }
}

function transferWithRoyalty(st: DemoState, ticketId: string, buyer: string, price: Cents): DemoState {
  const t = st.tickets.find((x) => x.id === ticketId)
  const ev = t && eventById(st, t.eventId)
  if (!t || !ev) return st
  const royalty = royaltyOf(ev, price)
  return {
    ...st,
    listings: st.listings.filter((l) => l.ticketId !== ticketId),
    tickets: st.tickets.map((x) =>
      x.id === ticketId
        ? { ...x, owner: buyer as Ticket["owner"], previousOwners: [...x.previousOwners, x.owner], paid: price, status: "held" }
        : x
    ),
    ledger:
      royalty > 0
        ? [{ id: uid("r"), eventId: ev.id, kind: "royalty", amount: royalty, hash: txHash(), at: Date.now(), serial: t.serial }, ...st.ledger]
        : st.ledger,
  }
}

export function resaleCheck(s: DemoState, listingId: string): TxError | null {
  const l = s.listings.find((x) => x.id === listingId)
  const t = l && s.tickets.find((x) => x.id === l.ticketId)
  if (!l || !t) return "gone"
  if (heldFor(s, t.eventId) + 1 > (eventById(s, t.eventId)?.rules.perWalletLimit ?? 0)) return "limit"
  if (s.wallet.balance < l.price + NETWORK_FEE) return "insufficient"
  return null
}

export async function buyResale(listingId: string, summary: TxSummary): Promise<OpResult> {
  const s = getDemo()
  if (!s) return { ok: false, error: "network" }
  const pre = resaleCheck(s, listingId)
  if (pre) return { ok: false, error: pre }
  const l = s.listings.find((x) => x.id === listingId)
  const t = l && s.tickets.find((x) => x.id === l.ticketId)
  if (!l || !t) return { ok: false, error: "gone" }
  const ev = eventById(s, t.eventId) as EventItem
  const total = l.price + NETWORK_FEE
  const result = await runTx({
    kind: "buyResale",
    summary,
    vars: { event: ev.name, serial: t.serial },
    amount: -total,
    check: (st) => resaleCheck(st, listingId),
    apply: (st) => {
      const moved = transferWithRoyalty(st, t.id, st.wallet.address, l.price)
      return { ...moved, wallet: { ...moved.wallet, balance: moved.wallet.balance - total } }
    },
  })
  return result.ok ? { ok: true, result, ids: [t.id] } : { ok: false, error: result.tx.error ?? "network", result }
}

/* ----------------------------------------------------------------- reselling */

export async function listTicket(ticketId: string, price: Cents, summary: TxSummary, bypassCap = false): Promise<OpResult> {
  const s = getDemo()
  const t = s?.tickets.find((x) => x.id === ticketId)
  const ev = s && t && eventById(s, t.eventId)
  if (!s || !t || !ev) return { ok: false, error: "gone" }
  const cap = capOf(ev, faceOf(s, t))
  const above = price > cap
  if (above && !bypassCap) return { ok: false, error: "aboveCap" }
  if (s.wallet.balance < NETWORK_FEE) return { ok: false, error: "insufficient" }
  const result = await runTx({
    kind: "list",
    summary,
    vars: { event: ev.name, serial: t.serial, price },
    amount: -NETWORK_FEE,
    revert: above ? "aboveCap" : undefined,
    check: (st) => (st.tickets.find((x) => x.id === ticketId)?.status === "held" ? null : "gone"),
    apply: (st) => ({
      ...st,
      wallet: { ...st.wallet, balance: st.wallet.balance - NETWORK_FEE },
      tickets: st.tickets.map((x) => (x.id === ticketId ? { ...x, status: "listed" } : x)),
      listings: [...st.listings, { id: uid("l"), ticketId, seller: st.wallet.address, price, listedAt: Date.now() }],
    }),
  })
  return result.ok ? { ok: true, result } : { ok: false, error: result.tx.error ?? "network", result }
}

export async function cancelListing(ticketId: string, summary: TxSummary): Promise<OpResult> {
  const s = getDemo()
  const t = s?.tickets.find((x) => x.id === ticketId)
  const ev = s && t && eventById(s, t.eventId)
  if (!s || !t || !ev) return { ok: false, error: "gone" }
  const result = await runTx({
    kind: "cancelListing",
    summary,
    vars: { event: ev.name, serial: t.serial },
    amount: -NETWORK_FEE,
    check: (st) => (st.listings.some((l) => l.ticketId === ticketId) ? null : "gone"),
    apply: (st) => ({
      ...st,
      wallet: { ...st.wallet, balance: st.wallet.balance - NETWORK_FEE },
      tickets: st.tickets.map((x) => (x.id === ticketId ? { ...x, status: "held" } : x)),
      listings: st.listings.filter((l) => l.ticketId !== ticketId),
    }),
  })
  return result.ok ? { ok: true, result } : { ok: false, error: result.tx.error ?? "network", result }
}

/** Another fan buys your listing (the demo's stand-in for the open market). */
export async function simulateBuyer(ticketId: string): Promise<OpResult> {
  const s = getDemo()
  const l = s?.listings.find((x) => x.ticketId === ticketId)
  const t = s?.tickets.find((x) => x.id === ticketId)
  const ev = s && t && eventById(s, t.eventId)
  if (!s || !l || !t || !ev) return { ok: false, error: "gone" }
  const royalty = royaltyOf(ev, l.price)
  const proceeds = l.price - royalty
  const buyer = randomAddress()
  const result = await runTx({
    kind: "resaleSold",
    summary: null,
    vars: { event: ev.name, serial: t.serial, price: l.price, royalty },
    amount: proceeds,
    check: (st) => (st.listings.some((x) => x.ticketId === ticketId) ? null : "gone"),
    apply: (st) => {
      const moved = transferWithRoyalty(st, ticketId, buyer, l.price)
      return { ...moved, wallet: { ...moved.wallet, balance: moved.wallet.balance + proceeds } }
    },
  })
  return result.ok ? { ok: true, result } : { ok: false, error: result.tx.error ?? "network", result }
}

/* ---------------------------------------------------------------- organizer */

export interface EventDraft {
  name: string
  tagline: string
  venue: string
  city: string
  category: EventItem["category"]
  date: string // yyyy-mm-dd
  time: string // hh:mm
  tone: EventItem["tone"]
  tiers: { name: string; price: Cents; supply: number }[]
  rules: TicketRules
}

export function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "event"
  )
}

export async function deployEvent(draft: EventDraft, summary: TxSummary): Promise<OpResult> {
  const s = getDemo()
  if (!s) return { ok: false, error: "network" }
  if (s.wallet.balance < NETWORK_FEE) return { ok: false, error: "insufficient" }
  const startsAt = new Date(`${draft.date}T${draft.time}:00`).getTime()
  const id = `${slugify(draft.name)}-${randomHex(4)}`
  const event: EventItem = {
    id,
    name: draft.name.trim(),
    tagline: draft.tagline.trim(),
    category: draft.category,
    venue: draft.venue.trim(),
    city: draft.city.trim() as L10n,
    startsAt,
    doorsAt: startsAt - 60 * 60_000,
    organizerId: s.youOrganize,
    tone: draft.tone,
    contract: `0x${randomHex(40)}`,
    rules: draft.rules,
    tiers: draft.tiers.map((t, i) => ({
      id: `tier-${i + 1}`,
      name: t.name.trim(),
      section: t.name.trim(),
      price: t.price,
      supply: t.supply,
      sold: 0,
    })),
    createdByYou: true,
  }
  const result = await runTx({
    kind: "deploy",
    summary,
    vars: { event: event.name },
    amount: -NETWORK_FEE,
    apply: (st) => ({ ...st, events: [...st.events, event], wallet: { ...st.wallet, balance: st.wallet.balance - NETWORK_FEE } }),
  })
  return result.ok ? { ok: true, result, ids: [id] } : { ok: false, error: result.tx.error ?? "network", result }
}

/* --------------------------------------------------------------------- door */

/** The code a queued guest shows, generated at scan time from their scenario. */
export function guestCode(s: DemoState, g: Guest, now: number): string {
  const t = s.tickets.find((x) => x.id === g.ticketId)
  if (!t) return `NTP-9999-${"ABCDEF"}`
  switch (g.scenario) {
    case "expired":
      return staleCode(t, t.owner, now, 7)
    case "notHolder":
      return entryCode(t, t.previousOwners[t.previousOwners.length - 1] ?? t.owner, now)
    case "forged": {
      const real = entryCode(t, t.owner, now)
      const sig = real.slice(-6)
      const swapped = sig.split("").reverse().join("")
      return `${real.slice(0, -6)}${swapped === sig ? "ZZZZZZ" : swapped}`
    }
    default:
      return entryCode(t, t.owner, now)
  }
}

export interface ScanResult {
  verdict: DoorVerdict
  code: string
}

/** Verify a code at the door (≈1 s of checks), then mark the ticket used and mint a souvenir if it's yours. */
export async function scanAtDoor(eventId: string, code: string, guest: { id?: string; label: string }): Promise<ScanResult> {
  await sleep(Math.max(700, latency() * 0.6))
  const s = getDemo()
  if (!s) return { verdict: { ok: false, reason: "forged" }, code }
  const now = Date.now()
  const verdict = verifyCode(s, eventId, code, now)
  const ev = eventById(s, eventId)

  update((st) => {
    let next: DemoState = {
      ...st,
      guests: guest.id ? st.guests.map((g) => (g.id === guest.id ? { ...g, scanned: true } : g)) : st.guests,
      doorLog: [{ id: uid("d"), eventId, guest: guest.label, code, verdict, at: now }, ...st.doorLog].slice(0, 40),
    }
    if (verdict.ok) {
      next = {
        ...next,
        tickets: next.tickets.map((t) => (t.id === verdict.ticketId ? { ...t, status: "used", usedAt: now } : t)),
        listings: next.listings.filter((l) => l.ticketId !== verdict.ticketId),
      }
      if (verdict.own && ev) {
        next.txs = [
          { id: uid("tx"), hash: txHash(), kind: "checkIn", state: "confirmed", vars: { event: ev.name, serial: verdict.serial }, at: now },
          ...next.txs,
        ]
        if (ev.rules.souvenir) {
          next.souvenirs = [
            {
              id: uid("s"),
              eventId: ev.id,
              eventName: ev.name,
              venue: ev.venue,
              date: ev.startsAt,
              serial: verdict.serial,
              tone: ev.tone,
              mintedAt: now,
            },
            ...next.souvenirs,
          ]
        }
      }
    }
    return next
  })
  return { verdict, code }
}

/** Put the queue back (keeps admitted tickets used). */
export function refillQueue(eventId: string) {
  update((st) => ({ ...st, guests: st.guests.map((g) => (g.eventId === eventId ? { ...g, scanned: false } : g)) }))
}
