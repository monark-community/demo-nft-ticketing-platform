# NFTokenPass

Event tickets as tokens, with the organizer's rules built in: a resale cap, a royalty on every resale, and an entry code that a screenshot can't pass.

This repository is the **interactive demo** of NFTokenPass, an independent ticketing product incubated by [Monark](https://www.monark.io). Everything runs in the browser on simulated testnet data: no chain, no wallet, no backend, no environment variables.

- Project documentation: https://www.monark.io/en/project/nft-ticketing-platform
- Target host: https://nftokenpass.monark.io
- Site plan (product brief, identity, flows, copy): [`docs/site-plan.md`](docs/site-plan.md)
- Assets and credits: [`docs/assets.md`](docs/assets.md)
- Screenshots: [`docs/screenshots/`](docs/screenshots)

## What you can do in the demo

| Flow | Where |
|-|-|
| Buy a ticket (with per-wallet limit, sold-out tiers, rejected and failed transactions) | `/app`, `/app/events/[id]` |
| Open a rare drop: every purchase in the demo drops a numbered foil ticket in one of six random artworks, revealed in a popup, that tilts and catches the light under your pointer. Foil raises the resale cap by 25 points and comes with perks (early entry plus one per artwork) | `/app/events/[id]`, `/app/wallet` |
| Resell within the organizer's cap, watch the royalty split, try to list above the cap | `/app/wallet` |
| Show the rotating entry code, then scan guests at the door (admitted, expired screenshot, already used, wrong event, not the holder, forged) | `/app/wallet`, `/app/door` |
| Create an event with tiers and rules, and follow sales and resale royalties | `/app/organizer` |

The site is bilingual (`/en/…`, `/fr/…`; `/` redirects by `Accept-Language`) and has light and dark themes.

## Run it locally

Requirements: Node.js 22 and pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:3149
```

Checks:

```bash
pnpm lint
pnpm typecheck
pnpm build && pnpm start   # production build on port 3149
pnpm screenshots           # Playwright screenshots of every page and flow into docs/screenshots/
```

`pnpm screenshots` expects the production server on port 3149 and a Playwright Chromium install (`pnpm exec playwright install chromium`). Pass a variant filter to run part of it, for example `node scripts/screenshots.mjs en-390-light`.

## How the simulation works

All demo logic lives behind a small typed layer in `src/lib/demo/`, so it could be swapped for wagmi/viem without touching the UI:

| File | Role |
|-|-|
| `types.ts` | Events, tiers, rules, tickets, listings, souvenirs, transactions, door verdicts. Amounts are integer cents of tUSDC. |
| `seed.ts` | The starting world: six invented shows in Montréal and Québec City, dated relative to now (one is always tonight), a demo wallet with 250.00 tUSDC and three tickets, resale listings, and guests queuing at tonight's door. |
| `store.ts` | An external store persisted to `localStorage` (every access in try/catch), plus the promise behind the simulated wallet prompt. |
| `chain.ts` | Every write: wallet prompt → pending with a hash and 1.2–2.6 s latency → confirmed or failed. Honours the demo controls (fail the next transaction, slow network). |
| `ops.ts` | The rules: buying within supply and the per-wallet limit, rare foil drops (`RARE_ODDS`, `RARE_EDITION`, `RARE_CAP_BONUS` and `RARE_PERKS` in `seed.ts`; the demo sets the odds to 1), listing at or under the cap, royalty on every resale, deploying events, door check-in and souvenirs. |
| `code.ts` | Rotating entry codes: a signature over ticket, holder and 20-second window, and the door's verification (expired, used, wrong event, not the holder, forged). |

The "Demo controls" button in the app bar can force the next transaction to fail, slow the network, or **reset the demo**. State older than 12 hours is reseeded so "tonight" stays tonight.

## Project structure

```
src/
  app/[locale]/          pages: home, how-it-works, credits, pricing (unlinked), app/*, 404, OG image
  components/brand/      logo mark and wordmark
  components/ticket/     ticket (and its foil variant: art, tilt), stamp, entry code, resale rail
  components/demo/       box office, event, wallet, door, organizer, wallet prompt, demo controls
  components/site/       header, footer, locale switch, theme
  components/ui/         shadcn/ui and Monark registry components (re-themed)
  i18n/                  typed EN/FR dictionaries
  lib/demo/              simulated chain, wallet and rules
scripts/screenshots.mjs  visual check with Playwright
```

UI is built on shadcn/ui with the [Monark UI registry](https://ui.monark.io) (`wallet`, `connect-wallet`, `token-amount`, `network-badge`, `tx-status`, `nft-card`), re-themed to NFTokenPass's own identity.

## Deploy to Vercel

Import the repository in Vercel and keep the framework defaults (Next.js, `pnpm install`, `pnpm build`). No environment variables are needed. Optionally set `NEXT_PUBLIC_SITE_URL` if the site is served from a host other than `https://nftokenpass.monark.io` (used for canonical URLs, the sitemap and Open Graph).

## Notes

- `/pricing` is an internal strategy page: it is not linked anywhere, not in the sitemap, and marked `noindex, nofollow`.
- Demo · simulated data. Testnet demo · not financial advice · no real funds.

Built with Monark.
