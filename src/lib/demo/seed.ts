import { randomAddress, txHash } from "./ids"
import type { Address, DemoState, EventItem, Guest, LedgerLine, Listing, Organizer, RareArt, RarePerk, Souvenir, Ticket } from "./types"

/**
 * The starting world. All artists, venues, teams and people are invented.
 * Dates are relative to the moment of seeding, so "tonight" is always tonight.
 */

export const YOUR_ADDRESS: Address = "0x4B2f9c3E71A0d58B6e2F1c9D04a7E3b85C61d9F2"
export const STARTING_BALANCE = 250_00
export const FAUCET_AMOUNT = 200_00
export const NETWORK_FEE = 4 // 0.04 tUSDC per transaction
/** Chance that a primary purchase drops a rare foil ticket. A real collection would set this low; the demo always drops one. */
export const RARE_ODDS = 1
/** Size of each show's foil edition. */
export const RARE_EDITION = 50
/** Percentage points a foil adds to the show's resale cap (110 % of face becomes 135 %). */
export const RARE_CAP_BONUS = 25
/** Perks that come with each foil artwork. */
export const RARE_PERKS: Record<RareArt, RarePerk[]> = {
  afterglow: ["earlyEntry", "merch"],
  marquee: ["earlyEntry", "soundcheck"],
  aurora: ["earlyEntry", "lounge"],
  vinyl: ["earlyEntry", "poster"],
  confetti: ["earlyEntry", "afterparty"],
  neon: ["earlyEntry", "merch"],
}

const HOUR = 3_600_000
const DAY = 24 * HOUR

/** Local midnight of the day `offset` days from `now`, plus `hours`. */
function at(now: number, offset: number, hours: number, minutes = 0): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  d.setHours(hours, minutes, 0, 0)
  return d.getTime()
}

const ORGANIZERS: Organizer[] = [
  { id: "bellechasse", name: "Productions Bellechasse", address: "0x7aC1e4B9d2F03a6E58c1B7D90f4e2A3c6B81d5E0" },
  { id: "northline", name: "Northline Collective", address: "0x19E3b7A5c0D48f2e6B9a1C7d3E5f0A8b2C4d6E71" },
  { id: "hiboux", name: "Club des Hiboux", address: "0xC4d2E8f1A7b3906D5e2c8B1a4F7d0E3b9A6c5D28" },
  { id: "rire", name: "Rire Capitale", address: "0x5E9a0C3d7B1f4e8A2c6D9b0E3f7A1c5D8e2B4F96" },
  { id: "faubourg", name: "Compagnie du Faubourg", address: "0x8B3e6D1a9C4f7E2b5A0d8C3e6F9a2B5d1E4c7A03" },
]

function events(now: number): EventItem[] {
  return [
    {
      id: "maree-basse",
      name: "Marée Basse",
      tagline: { en: "“Eaux calmes” tour, with Lou Pelletier opening", fr: "Tournée « Eaux calmes », avec Lou Pelletier en première partie" },
      category: "music",
      venue: "Salle Bellechasse",
      city: "Montréal",
      startsAt: at(now, 0, 20, 30),
      doorsAt: at(now, 0, 19, 0),
      organizerId: "bellechasse",
      tone: "ink",
      contract: "0x2F8a61cE4b0D93e7A5c2B8f1d6E0a4C9b3D7e512",
      rules: { resaleCapPct: 110, royaltyPct: 5, perWalletLimit: 4, souvenir: true },
      tiers: [
        { id: "floor", name: { en: "Floor, standing", fr: "Parterre debout" }, section: { en: "Floor", fr: "Parterre" }, price: 42_00, supply: 600, sold: 600 },
        { id: "balcony", name: { en: "Balcony, seated", fr: "Balcon assis" }, section: { en: "Balcony", fr: "Balcon" }, price: 58_00, supply: 250, sold: 211 },
      ],
    },
    {
      id: "hiboux-rapides",
      name: "Hiboux vs. Rapides",
      tagline: { en: "Montréal Hiboux host the Ottawa Rapides, regular season", fr: "Les Hiboux de Montréal reçoivent les Rapides d'Ottawa, saison régulière" },
      category: "sports",
      venue: "Aréna Saint-Michel",
      city: "Montréal",
      startsAt: at(now, 3, 19, 30),
      doorsAt: at(now, 3, 18, 15),
      organizerId: "hiboux",
      tone: "brick",
      contract: "0x6c0B2e9F4a1D7c3E8b5A2f6D0e9C4b1A7d3F8e26",
      rules: { resaleCapPct: 120, royaltyPct: 8, perWalletLimit: 6, souvenir: false },
      tiers: [
        { id: "courtside", name: { en: "Courtside", fr: "Bord de terrain" }, section: { en: "Courtside", fr: "Bord de terrain" }, price: 95_00, supply: 40, sold: 38 },
        { id: "lower", name: { en: "Lower bowl", fr: "Section basse" }, section: { en: "Lower", fr: "Basse" }, price: 38_00, supply: 900, sold: 512 },
        { id: "upper", name: { en: "Upper bowl", fr: "Section haute" }, section: { en: "Upper", fr: "Haute" }, price: 22_00, supply: 1200, sold: 430 },
      ],
    },
    {
      id: "northline-summit",
      name: "Northline Summit 2026",
      tagline: { en: "Two days on open infrastructure for cities", fr: "Deux jours sur les infrastructures ouvertes pour les villes" },
      category: "conference",
      venue: "Quai 4",
      city: "Montréal",
      startsAt: at(now, 9, 9, 0),
      doorsAt: at(now, 9, 8, 0),
      organizerId: "northline",
      tone: "teal",
      contract: "0x3D9f2A7c1E5b8D0a4F6c9E2b7A1d5C8f0B3e6A94",
      rules: { resaleCapPct: 100, royaltyPct: 3, perWalletLimit: 2, souvenir: true },
      tiers: [
        { id: "early", name: { en: "Early bird", fr: "Prévente" }, section: { en: "Pass", fr: "Laissez-passer" }, price: 89_00, supply: 150, sold: 150 },
        { id: "standard", name: { en: "Standard pass", fr: "Laissez-passer standard" }, section: { en: "Pass", fr: "Laissez-passer" }, price: 129_00, supply: 400, sold: 188 },
        { id: "student", name: { en: "Student pass", fr: "Laissez-passer étudiant" }, section: { en: "Pass", fr: "Laissez-passer" }, price: 35_00, supply: 120, sold: 97 },
      ],
    },
    {
      id: "delia-ferrante",
      name: "Delia Ferrante",
      tagline: { en: "“Pas de filtre”, stand-up, new hour", fr: "« Pas de filtre », nouveau spectacle d'humour" },
      category: "comedy",
      venue: "Le Petit Impérial",
      city: { en: "Québec City", fr: "Québec" },
      startsAt: at(now, 16, 20, 0),
      doorsAt: at(now, 16, 19, 0),
      organizerId: "rire",
      tone: "stock",
      contract: "0x9A4c7E1f3B6d0A8e2C5b9F1d4E7a0C3f6B8d2E57",
      rules: { resaleCapPct: 110, royaltyPct: 5, perWalletLimit: 4, souvenir: true },
      tiers: [
        { id: "ga", name: { en: "General admission", fr: "Admission générale" }, section: { en: "Hall", fr: "Salle" }, price: 34_00, supply: 320, sold: 140 },
      ],
    },
    {
      id: "nuit-muets",
      name: "Nuit des films muets",
      tagline: { en: "Three silent shorts, live piano score", fr: "Trois courts métrages muets, piano en direct" },
      category: "film",
      venue: "Ciné-Belvédère",
      city: "Montréal",
      startsAt: at(now, 24, 21, 0),
      doorsAt: at(now, 24, 20, 15),
      organizerId: "bellechasse",
      tone: "cream",
      contract: "0x4E8b1D5a9C2f6E0b3A7d1F4c8B2e5A9d0C6f3B71",
      rules: { resaleCapPct: 100, royaltyPct: 5, perWalletLimit: 4, souvenir: true },
      tiers: [{ id: "seat", name: { en: "Reserved seat", fr: "Place réservée" }, section: { en: "Row", fr: "Rang" }, price: 18_00, supply: 180, sold: 64 }],
    },
    {
      id: "oiseaux-de-passage",
      name: "Les Oiseaux de passage",
      tagline: { en: "A new play by the Compagnie du Faubourg (in French)", fr: "Création de la Compagnie du Faubourg" },
      category: "theatre",
      venue: "Théâtre du Faubourg",
      city: { en: "Québec City", fr: "Québec" },
      startsAt: at(now, 38, 19, 30),
      doorsAt: at(now, 38, 18, 45),
      organizerId: "faubourg",
      tone: "teal",
      contract: "0x7F2c5A8e1D4b9C3f6A0e2D7b5C1a8F4e9B3d6C20",
      rules: { resaleCapPct: 110, royaltyPct: 6, perWalletLimit: 4, souvenir: false },
      tiers: [
        { id: "orchestra", name: { en: "Orchestra", fr: "Parterre" }, section: { en: "Orchestra", fr: "Parterre" }, price: 48_00, supply: 310, sold: 280 },
        { id: "mezzanine", name: { en: "Mezzanine", fr: "Mezzanine" }, section: { en: "Mezzanine", fr: "Mezzanine" }, price: 36_00, supply: 140, sold: 60 },
      ],
    },
  ]
}

function ticket(
  id: string,
  serial: string,
  eventId: string,
  tierId: string,
  seat: string,
  owner: Address,
  paid: number,
  mintedAt: number,
  extra: Partial<Ticket> = {}
): Ticket {
  return { id, serial, eventId, tierId, seat, owner, previousOwners: [], paid, status: "held", mintedAt, ...extra }
}

export function createSeed(now = Date.now()): DemoState {
  const evs = events(now)
  const maree = evs[0] as EventItem
  const others: Address[] = Array.from({ length: 12 }, () => randomAddress())
  const addr = (i: number) => others[i] as Address

  const tickets: Ticket[] = [
    // Already in your wallet (visible once it is connected).
    ticket("t-0388", "0388", "maree-basse", "balcony", "C·14", YOUR_ADDRESS, 58_00, now - 19 * DAY),
    ticket("t-0389", "0389", "maree-basse", "balcony", "C·15", YOUR_ADDRESS, 58_00, now - 19 * DAY),
    ticket("t-1022", "1022", "hiboux-rapides", "lower", "112·F·7", YOUR_ADDRESS, 38_00, now - 6 * DAY),

    // Resale listings held by other fans.
    ticket("t-0107", "0107", "maree-basse", "floor", "GA", addr(0), 42_00, now - 30 * DAY, { status: "listed" }),
    ticket("t-0233", "0233", "maree-basse", "floor", "GA", addr(1), 42_00, now - 28 * DAY, { status: "listed" }),
    ticket("t-0451", "0451", "maree-basse", "floor", "GA", addr(2), 42_00, now - 25 * DAY, { status: "listed" }),
    ticket("t-1310", "1310", "hiboux-rapides", "courtside", "CS·4", addr(3), 95_00, now - 12 * DAY, { status: "listed" }),
    ticket("t-1188", "1188", "hiboux-rapides", "lower", "108·K·2", addr(4), 38_00, now - 9 * DAY, { status: "listed" }),
    ticket("t-2044", "2044", "northline-summit", "early", "EB", addr(5), 89_00, now - 40 * DAY, { status: "listed" }),

    // Guests at tonight's door.
    ticket("t-0512", "0512", "maree-basse", "floor", "GA", addr(6), 42_00, now - 21 * DAY),
    ticket("t-0694", "0694", "maree-basse", "balcony", "A·3", addr(7), 58_00, now - 17 * DAY),
    ticket("t-0145", "0145", "maree-basse", "floor", "GA", addr(8), 42_00, now - 26 * DAY, {
      status: "used",
      usedAt: Math.min(now - 9 * 60_000, maree.doorsAt + 14 * 60_000),
    }),
    ticket("t-0277", "0277", "maree-basse", "floor", "GA", addr(9), 44_10, now - 23 * DAY, { previousOwners: [addr(10)] }),
    ticket("t-1455", "1455", "hiboux-rapides", "upper", "305·B·11", addr(11), 22_00, now - 4 * DAY),
  ]

  const listings: Listing[] = [
    { id: "l-0107", ticketId: "t-0107", seller: addr(0), price: 44_00, listedAt: now - 3 * DAY },
    { id: "l-0233", ticketId: "t-0233", seller: addr(1), price: 46_20, listedAt: now - 2 * DAY },
    { id: "l-0451", ticketId: "t-0451", seller: addr(2), price: 42_00, listedAt: now - 6 * HOUR },
    { id: "l-1310", ticketId: "t-1310", seller: addr(3), price: 110_00, listedAt: now - DAY },
    { id: "l-1188", ticketId: "t-1188", seller: addr(4), price: 40_00, listedAt: now - 2 * DAY },
    { id: "l-2044", ticketId: "t-2044", seller: addr(5), price: 89_00, listedAt: now - 5 * DAY },
  ]

  const guests: Guest[] = [
    { id: "g1", name: "Camille R.", eventId: "maree-basse", scenario: "valid", ticketId: "t-0512", scanned: false },
    { id: "g2", name: "Jonah P.", eventId: "maree-basse", scenario: "expired", ticketId: "t-0694", scanned: false },
    { id: "g3", name: "Inès B.", eventId: "maree-basse", scenario: "valid", ticketId: "t-0694", scanned: false },
    { id: "g4", name: "Mathis L.", eventId: "maree-basse", scenario: "used", ticketId: "t-0145", scanned: false },
    { id: "g5", name: "Priya S.", eventId: "maree-basse", scenario: "notHolder", ticketId: "t-0277", scanned: false },
    { id: "g6", name: "Olivier D.", eventId: "maree-basse", scenario: "wrongEvent", ticketId: "t-1455", scanned: false },
    { id: "g7", name: "Noor H.", eventId: "maree-basse", scenario: "forged", ticketId: "t-0512", scanned: false },
  ]

  const royalty = (i: number, serial: string, price: number, daysAgo: number): LedgerLine => ({
    id: `r-${i}`,
    eventId: "maree-basse",
    kind: "royalty",
    amount: Math.round(price * 0.05),
    hash: txHash(),
    at: now - daysAgo * DAY,
    serial,
  })
  const ledger: LedgerLine[] = [
    royalty(1, "0061", 46_20, 12),
    royalty(2, "0318", 44_00, 9),
    royalty(3, "0655", 63_80, 7),
    royalty(4, "0092", 45_00, 4),
    royalty(5, "0540", 46_20, 2),
    { id: "r-6", eventId: "nuit-muets", kind: "royalty", amount: 90, hash: txHash(), at: now - DAY, serial: "3012" },
  ]

  const souvenirs: Souvenir[] = [
    {
      id: "s-past",
      eventId: "lou-pelletier-solo",
      eventName: "Lou Pelletier, solo",
      venue: "Salle Bellechasse",
      date: at(now, -41, 20, 0),
      serial: "0077",
      tone: "stock",
      mintedAt: at(now, -41, 20, 12),
    },
  ]

  return {
    version: 1,
    seededAt: now,
    wallet: { status: "disconnected", address: YOUR_ADDRESS, balance: STARTING_BALANCE },
    organizers: ORGANIZERS,
    youOrganize: "bellechasse",
    events: evs,
    tickets,
    listings,
    souvenirs,
    txs: [],
    ledger,
    guests,
    doorLog: [],
    settings: { failNext: false, slow: false },
    nextSerial: 2401,
  }
}
