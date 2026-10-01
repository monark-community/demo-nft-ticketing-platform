/**
 * Domain types for the simulated NFTokenPass network. Amounts are integer
 * cents of tUSDC (a test stablecoin with 2 display decimals); times are epoch ms.
 */

export type Address = `0x${string}`
export type Cents = number

export type Category = "music" | "conference" | "sports" | "comedy" | "film" | "theatre"

/** The rules an organizer sets once; the ticket contract enforces them on every transfer. */
export interface TicketRules {
  /** Maximum resale price as a % of face value (100–150). */
  resaleCapPct: number
  /** % of every resale paid to the organizer (0–10). */
  royaltyPct: number
  /** Max tickets one wallet may hold for this event (1–8). */
  perWalletLimit: number
  /** Mint a souvenir collectible at check-in. */
  souvenir: boolean
}

/** Seeded content is bilingual; content typed by the visitor is a plain string. */
export type L10n = string | { en: string; fr: string }

export interface Tier {
  id: string
  name: L10n
  /** Section label printed on the ticket, e.g. "Floor" or "Balcony B". */
  section: L10n
  price: Cents
  supply: number
  sold: number
}

export interface Organizer {
  id: string
  name: string
  address: Address
}

export interface EventItem {
  id: string
  name: string
  /** One line under the name: artist, format or matchup. */
  tagline: L10n
  category: Category
  venue: string
  city: L10n
  /** Show start. */
  startsAt: number
  /** Doors open. */
  doorsAt: number
  organizerId: string
  /** Poster colour (one of the POSTER_TONES keys). */
  tone: PosterTone
  tiers: Tier[]
  rules: TicketRules
  /** Contract address of the event's ticket collection. */
  contract: Address
  createdByYou?: boolean
}

export type PosterTone = "ink" | "stock" | "brick" | "teal" | "cream"

export type TicketStatus = "held" | "listed" | "used"

/** Artwork printed on a rare foil ticket (see components/ticket/rare-art.ts). */
export type RareArt = "afterglow" | "marquee" | "aurora" | "vinyl" | "confetti" | "neon"

/** What holding a rare foil gets you at the show (see RARE_PERKS in seed.ts). */
export type RarePerk = "earlyEntry" | "merch" | "soundcheck" | "lounge" | "poster" | "afterparty"

/** The foil's embossed pattern, drawn independently of the art. */
export type FoilPattern = "zigzag" | "waves" | "lattice" | "scales" | "rings" | "glitter"

/** A rare drop: the ticket was printed in foil with custom art, numbered within a small edition. */
export interface RareDrop {
  art: RareArt
  /** Missing on drops minted before patterns existed (they're zig-zag). */
  pattern?: FoilPattern
  edition: number
  of: number
}

export interface Ticket {
  id: string
  /** Serial printed on the ticket, e.g. "0412". */
  serial: string
  eventId: string
  tierId: string
  seat: string
  owner: Address
  /** Previous holders, most recent last (used to explain "not the holder"). */
  previousOwners: Address[]
  /** What the current holder paid. */
  paid: Cents
  status: TicketStatus
  usedAt?: number
  mintedAt: number
  /** Set when the mint dropped a rare foil edition. */
  rare?: RareDrop
}

export interface Listing {
  id: string
  ticketId: string
  seller: Address
  price: Cents
  listedAt: number
}

export interface Souvenir {
  id: string
  eventId: string
  eventName: string
  venue: string
  date: number
  serial: string
  tone: PosterTone
  mintedAt: number
}

export type TxKind =
  | "connect"
  | "faucet"
  | "buy"
  | "buyResale"
  | "list"
  | "cancelListing"
  | "resaleSold"
  | "deploy"
  | "checkIn"

export type TxState = "pending" | "confirmed" | "failed"

export type TxError = "rejected" | "network" | "aboveCap" | "insufficient" | "limit" | "soldOut" | "gone"

export interface Tx {
  id: string
  hash: `0x${string}`
  kind: TxKind
  state: TxState
  error?: TxError
  /** Values interpolated into the activity label. */
  vars: Record<string, string | number>
  /** Signed amount for the wallet, in cents (negative = spent). */
  amount?: Cents
  at: number
}

/** A royalty or primary-sale line in an organizer's ledger. */
export interface LedgerLine {
  id: string
  eventId: string
  kind: "primary" | "royalty"
  amount: Cents
  hash: `0x${string}`
  at: number
  serial: string
}

export type WalletStatus = "disconnected" | "connecting" | "connected"

export interface WalletState {
  status: WalletStatus
  address: Address
  balance: Cents
}

export interface DemoSettings {
  /** The next transaction fails at the network step. */
  failNext: boolean
  /** Multiply latency (slow network). */
  slow: boolean
}

export type DoorVerdict =
  | { ok: true; ticketId: string; serial: string; seat: string; tierId: string; own: boolean }
  | {
      ok: false
      reason: "expired" | "used" | "wrongEvent" | "notHolder" | "forged"
      serial?: string
      seconds?: number
      usedAt?: number
      eventName?: string
    }

export interface DoorLogEntry {
  id: string
  eventId: string
  guest: string
  code: string
  verdict: DoorVerdict
  at: number
}

/** Simulated guests queuing at the door, each with a scripted scenario. */
export type GuestScenario = "valid" | "expired" | "used" | "wrongEvent" | "notHolder" | "forged"

export interface Guest {
  id: string
  name: string
  eventId: string
  scenario: GuestScenario
  ticketId?: string
  scanned: boolean
}

export interface DemoState {
  version: 1
  seededAt: number
  wallet: WalletState
  organizers: Organizer[]
  /** The organizer you play in the Organizer console. */
  youOrganize: string
  events: EventItem[]
  tickets: Ticket[]
  listings: Listing[]
  souvenirs: Souvenir[]
  txs: Tx[]
  ledger: LedgerLine[]
  guests: Guest[]
  doorLog: DoorLogEntry[]
  settings: DemoSettings
  nextSerial: number
}

/** What the simulated wallet shows before you sign. */
export interface TxSummary {
  kind: TxKind
  title: string
  lines: { label: string; value: string; strong?: boolean }[]
  /** Moves value: show the testnet notice. */
  movesValue: boolean
}
