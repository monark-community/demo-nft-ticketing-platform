import { fnv1a, seeded } from "./ids"
import type { Address, DemoState, DoorVerdict, Ticket } from "./types"

/**
 * Rotating entry codes. A code is "NTP-<serial>-<sig>", where sig is derived
 * from the ticket, the signing wallet and the current 20-second window. In a
 * real deployment the wallet signs (EIP-712) and the door checks the signature
 * against the current on-chain holder; here a hash stands in for the signature.
 */

export const CODE_WINDOW_MS = 20_000
/** A code is still accepted during the window right after its own (clock drift). */
const GRACE_WINDOWS = 1
/** How far back we recognise a code as "expired" rather than forged (1 hour). */
const LOOKBACK_WINDOWS = 180

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

export function windowOf(time: number): number {
  return Math.floor(time / CODE_WINDOW_MS)
}

function signature(ticketId: string, signer: Address, window: number): string {
  let h = fnv1a(`${ticketId}|${signer.toLowerCase()}|${window}`)
  let out = ""
  for (let i = 0; i < 6; i++) {
    out += ALPHABET[h % ALPHABET.length]
    h = (Math.floor(h / ALPHABET.length) ^ fnv1a(out + ticketId)) >>> 0
  }
  return out
}

export function entryCode(ticket: Pick<Ticket, "id" | "serial">, signer: Address, time: number): string {
  return `NTP-${ticket.serial}-${signature(ticket.id, signer, windowOf(time))}`
}

/** A code signed in an earlier window, e.g. a screenshot taken `windowsAgo` windows ago. */
export function staleCode(ticket: Pick<Ticket, "id" | "serial">, signer: Address, time: number, windowsAgo: number): string {
  return `NTP-${ticket.serial}-${signature(ticket.id, signer, windowOf(time) - windowsAgo)}`
}

/** Milliseconds left before the current code rotates. */
export function msUntilRotation(time: number): number {
  return CODE_WINDOW_MS - (time % CODE_WINDOW_MS)
}

export function parseCode(raw: string): { serial: string; sig: string } | null {
  const m = raw
    .trim()
    .toUpperCase()
    .match(/^NTP-(\d{3,5})-([2-9A-HJ-NP-Z]{6})$/)
  if (!m) return null
  return { serial: m[1] ?? "", sig: m[2] ?? "" }
}

/** Check a presented code at the door of `eventId`. Pure: does not mark anything used. */
export function verifyCode(state: DemoState, eventId: string, raw: string, now: number): DoorVerdict {
  const parsed = parseCode(raw)
  if (!parsed) return { ok: false, reason: "forged" }
  const ticket = state.tickets.find((t) => t.serial === parsed.serial)
  if (!ticket) return { ok: false, reason: "forged", serial: parsed.serial }

  const current = windowOf(now)
  const signedBy = (signer: Address, from: number, to: number) => {
    for (let w = from; w >= to; w--) if (signature(ticket.id, signer, w) === parsed.sig) return w
    return null
  }

  const ownerWindow = signedBy(ticket.owner, current, current - LOOKBACK_WINDOWS)
  if (ownerWindow !== null && ownerWindow >= current - GRACE_WINDOWS) {
    if (ticket.eventId !== eventId) {
      const ev = state.events.find((e) => e.id === ticket.eventId)
      return { ok: false, reason: "wrongEvent", serial: ticket.serial, eventName: ev?.name }
    }
    if (ticket.status === "used") return { ok: false, reason: "used", serial: ticket.serial, usedAt: ticket.usedAt }
    return {
      ok: true,
      ticketId: ticket.id,
      serial: ticket.serial,
      seat: ticket.seat,
      tierId: ticket.tierId,
      own: ticket.owner.toLowerCase() === state.wallet.address.toLowerCase(),
    }
  }
  if (ownerWindow !== null) {
    const expiredAt = (ownerWindow + 1 + GRACE_WINDOWS) * CODE_WINDOW_MS
    return { ok: false, reason: "expired", serial: ticket.serial, seconds: Math.max(1, Math.round((now - expiredAt) / 1000)) }
  }
  for (const prev of ticket.previousOwners) {
    if (signedBy(prev, current, current - LOOKBACK_WINDOWS) !== null) return { ok: false, reason: "notHolder", serial: ticket.serial }
  }
  return { ok: false, reason: "forged", serial: ticket.serial }
}

/**
 * A code drawn as a 25×25 matrix with three finder squares, like a QR code.
 * It is a deterministic drawing of the code string, not a scannable QR.
 */
export function codeMatrix(code: string, size = 25): boolean[][] {
  const rand = seeded(fnv1a(code))
  const grid: boolean[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => rand() > 0.52))
  const finder = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++)
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r
        const cc = c0 + c
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue
        const edge = r === 0 || r === 6 || c === 0 || c === 6
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4
        const row = grid[rr]
        if (row) row[cc] = r >= 0 && r <= 6 && c >= 0 && c <= 6 && (edge || core)
      }
  }
  finder(0, 0)
  finder(0, size - 7)
  finder(size - 7, 0)
  return grid
}
