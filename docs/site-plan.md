# NFTokenPass: site plan

This plan describes the NFTokenPass demo site that ships on `develop`. It replaces the Lovable prototype on `main`. It is kept in sync with what was built; where the build changed course, this document was updated.

- Product: **NFTokenPass**, an independent ticketing product incubated by Monark (not Monark-branded).
- Authoritative description: https://www.monark.io/en/project/nft-ticketing-platform
- Target host: https://nftokenpass.monark.io
- Stack: Next.js (App Router, TypeScript strict, `src/`), Tailwind CSS v4, shadcn/ui on the Monark UI registry (re-themed), `lucide-react`. No backend, no environment variables.

---

## 1. Product brief

**Target users.** Three people meet around one ticket:

1. **Organizers**: independent promoters, small and mid-size venues, festivals and conference teams (500 to 5,000 seats) who watch their tickets resold at three to five times face value on sites they don't control, and who never see a cent of that markup.
2. **Fans**: people who want a real ticket at a fair price, and want to be able to pass it on at a fair price if plans change.
3. **Door staff**: the person with a phone at the entrance who has two seconds per guest to decide "in" or "not in", often with bad signal.

**Core job to be done.** "Sell my tickets to real fans, keep resale fair and paid back to me, and get everyone through the door without fakes." For the fan: "Buy a ticket I know is real, and resell it at a fair price if I can't go."

**Domain concepts.**

| Concept | What it means in NFTokenPass |
|-|-|
| Event | Created by an organizer: name, venue, city, date, doors time, cover style. Deployed as a ticket contract. |
| Tier | A kind of ticket within an event (Floor, Balcony, Early bird…) with a face price and a supply. |
| Ticket | A token (NFT) minted into the buyer's wallet. Carries its serial, tier, seat or section, and the event's rules. |
| Rules | Set once by the organizer, enforced by the contract on every transfer: **resale cap** (max % of face), **royalty** (% of every resale back to the organizer), **per-wallet limit** (anti-bot), **souvenir** (a keepsake collectible after check-in). |
| Resale listing | A ticket listed by its holder, at or below the cap. The contract pays the organizer's royalty and the seller in the same transaction. |
| Entry code | A code shown by the fan's wallet that rotates every 20 seconds and is signed by the holder, so a screenshot or a forwarded image stops working. |
| Check-in | The door verifies the code: signature, current holder, right event, not already used. On success the ticket is marked used and a souvenir is minted. |
| Souvenir | A collectible (POAP-style) that proves attendance; the used ticket becomes a keepsake stub. |

**What the Lovable version got wrong or left out.**

- It was a generic purple-to-blue gradient landing page with feature cards; nothing looked or felt like a ticket, a venue or a door.
- Resale control, the central promise, was only a "Resale" badge on a card. No cap, no royalty, no split, nothing a visitor could try.
- Verification was a coin flip (`Math.random() > 0.3`), with no notion of *why* a ticket fails (screenshot, already used, wrong event, not the holder).
- No wallet connection, no transaction states (pending, confirmed, failed), no balances, no per-wallet limits.
- Organizer creation had no rules at all (no royalty, no cap, no perks), and "Manage" and "Buy now" buttons did nothing.
- No souvenir or dynamic ticket, which the project documentation lists as a bonus feature.
- English only, no dark mode, placeholder images, 2024 dates.

## 2. Value proposition

**For independent organizers and their fans, NFTokenPass issues every ticket as a token whose rules travel with it, so resale stays fair and pays the organizer, fakes don't get in, and the door keeps moving, unlike classic ticketing, where the organizer loses control the moment a ticket leaves the box office.**

Supporting benefits (outcomes):

1. **Fans pay a fair price, even on resale.** Resale is capped by the organizer, so a sold-out show doesn't turn into a bidding war.
2. **Organizers earn from every resale, not just the first sale.** A royalty set once is paid automatically each time a ticket changes hands.
3. **The door says yes or no in two seconds.** A rotating, signed entry code means screenshots and copies are refused, and real guests walk straight in.

## 3. Hero

| | English | Français |
|-|-|-|
| Headline | Fair tickets. Honest resale. No fakes at the door. | Billets justes. Revente honnête. Aucun faux à l'entrée. |
| Subheadline | Each ticket is a token in the fan's wallet, carrying the organizer's rules: capped resale, royalties, and a code screenshots can't pass. | Chaque billet est un jeton dans le portefeuille du fan, avec les règles de l'organisateur : revente plafonnée, redevances et un code qu'aucune capture ne déjoue. |
| Primary CTA | Open the box office → `/app` | Ouvrir la billetterie → `/app` |
| Secondary CTA | How a ticket works → `/how-it-works` | Comment fonctionne un billet → `/how-it-works` |

The headline is 8 words in English (under 10).

**Hero visual.** The product itself: a large, live **ticket** built in code, in the brand's yellow card-stock colour, with its perforated stub, serial number, tier and seat, and the rules printed on the stub ("Resale cap 110 %", "Royalty 5 %", "4 per wallet"). Its entry code rotates in place with a 20-second countdown, and every few seconds the ticket cycles through its life in a small strip beneath it: **Minted → In wallet → Resold at cap → Admitted**, with the matching rubber stamp. It shows the product's point of view (rules that travel with the ticket) better than any photo could, and it is the object visitors will then handle in the demo.

## 4. Page map

All routes live under `/en/…` and `/fr/…`; `/` redirects to the visitor's preferred language (fallback English).

| Route | Purpose | Sections, in order |
|-|-|-|
| `/` (home) | Explain the product in one scroll and send people into the box office. Four sections after the hero (restraint rules). | 1. Hero with the live ticket and its life strip. 2. "One ticket, three people": Fan / Organizer / Door, each a one-line card with a product vignette (wallet ticket, royalty ledger lines, door stamps) and a link into that part of the demo. 3. The resale rail: an interactive price rail capped at 110 % with the live receipt split (the signature moment, reused from the app). 4. For organizers: marquee photo, one line, link to create an event. 5. Closing call to action on marquee yellow, with the crowd photo. |
| `/app` | Box office: the interactive demo's home. Upcoming events, search and category filter, wallet connection, role tabs (Fan, Door, Organizer). | App bar (connect wallet, balance, network, demo controls), role tabs, events grid, empty and loading states. |
| `/app/events/[id]` | An event: buy a primary ticket, or buy a capped resale listing. | Event header (cover, date, venue, rules), tier picker with quantity and per-wallet limit, checkout panel with totals and the testnet notice, resale listings, transaction feedback. |
| `/app/wallet` | The fan's wallet: tickets, entry codes, resale listings, souvenirs, activity. | Tickets (with "Show entry code", "Resell", "Cancel listing"), listing panel with the price rail and receipt, souvenirs grid, activity list with pending, confirmed and failed transactions. |
| `/app/door` | Door scanner for tonight's show. | Event selector, viewfinder, arrivals queue (simulated guests), "Scan my own ticket", manual code entry, result stamp, admitted and refused counters and log. |
| `/app/organizer` | Organizer console: your events, sales and royalties; create a new event. | Event list with sold/supply, primary revenue and resale royalties; "Create event" form (details, tiers, rules) with a live ticket preview; deploy transaction feedback. |
| `/how-it-works` | For organizers and developers weighing the trust model: what the contract enforces, what is on-chain versus off-chain, and why the entry code can't be copied. **Justified** because the rules are the product; the home page can only state them. | 1. The life of a ticket (5 perforated stubs). 2. The four rules, each with a worked example. 3. Why a screenshot fails (20-second window diagram + four refusal cases). 4. On-chain vs off-chain table. 5. FAQ (5 questions; the site's only FAQ). 6. Call to action. |
| `/credits` | Photo credits required by the asset rules. Linked from the footer. | Photo list with photographer links, type and icon credits. |
| `/pricing` | Internal strategy review only. **Never linked**, excluded from the sitemap, `noindex, nofollow`. | Model summary, three plans, reasoning, comparison with incumbents. |
| 404 | Not found, per locale. | A "VOID" stub with links back. |

**Header** (sticky, the only top bar on marketing pages): NFTokenPass wordmark · links: Box office (`/app`), How it works (`/how-it-works`) · "Demo · simulated data" chip · EN/FR switch · theme toggle · primary action "Open the box office" (on marketing pages). Mobile: wordmark + menu button opening a sheet with the links, switches and action. Inside `/app`, the page adds an app bar with the connect-wallet control, the "Demo · simulated data" badge and demo controls.

**Footer**: one-line description; links: Box office, How it works, Credits; project page on monark.io and GitHub repo; "Demo · simulated data"; "Built with Monark" credit (muted, 12–13px, links to monark.io). No `/pricing` link anywhere.

## 5. Feature highlights

| Feature | User benefit | Where it appears | Demo flow that proves it |
|-|-|-|-|
| Capped, royalty-paying resale | Fans never pay more than the cap; organizers earn on every resale | Home (resale rail), `/how-it-works`, `/app/wallet`, event pages | Flow 2 |
| Rotating signed entry code | Screenshots, copies and sold-on tickets are refused at the door | Home hero ticket, `/app/wallet`, `/app/door`, `/how-it-works` | Flow 3 |
| Door verdict with a reason | Staff know *why* a ticket is refused (expired code, already used, wrong event, not the holder) | `/app/door`, home vignette | Flow 3 |
| Per-wallet limit | Bots can't sweep a whole tier | Event pages, create-event form | Flow 1 (failure state) |
| Rules set once by the organizer | One form sets cap, royalty, limit and souvenir; the contract enforces them for good | `/app/organizer`, home "For organizers", `/how-it-works` | Flow 4 |
| Souvenir after check-in | The used ticket becomes a keepsake collectible that proves you were there | `/app/wallet` souvenirs, `/how-it-works` | Flow 3 (after admission) |

## 6. Key flows

Every transaction goes through the simulated wallet prompt (Confirm or Reject), then **pending** (hash shown, "Waiting for the network…", 1.2 to 2.6 s), then **confirmed** or **failed**. Demo controls can force the next transaction to fail and slow the network.

### Flow 1: Buy a ticket (primary sale)

1. Box office → pick an event (e.g. *Marée Basse*, Salle Bellechasse).
2. Choose a tier and quantity (1–4; the per-wallet limit is shown).
3. If not connected: "Connect wallet" → wallet prompt → connected (Reject → "You declined the connection request").
4. Review: face price × quantity, network fee, total in tUSDC, the rules the ticket carries, and the testnet notice.
5. "Buy" → wallet prompt → **pending** ("Minting ticket 0412…", tx hash) → **confirmed**: the ticket appears with a stamp and a "See it in your wallet" link.
6. Failed states: signature rejected; insufficient tUSDC (offers "Get test tUSDC" faucet); tier sold out; per-wallet limit reached ("This wallet already holds 4 tickets for this event"); forced network failure ("The network didn't confirm the transaction. Nothing was charged.").

### Flow 2: Resell at a fair price

1. Wallet → a ticket → "Resell".
2. The price rail: drag or type a price; it stops hard at the cap (110 % of face by default). The receipt splits it live: buyer pays → organizer royalty → you receive.
3. "List for resale" → prompt → **pending** → **confirmed**: the ticket shows "Listed" and appears on the event page's resale list.
4. A simulated fan buys it after a few seconds (or "Simulate a buyer now"): **sold**, proceeds credited, activity shows the royalty paid to the organizer, and the organizer console shows the royalty line.
5. Failed states: "Try to list above the cap (demo)" → the contract reverts ("Price above the resale cap set by the organizer"); rejected signature; cancel listing (its own transaction).
6. Buying a resale ticket on an event page works like Flow 1, with the seller's price, never above cap.

### Flow 3: Get in at the door

1. Wallet → tonight's ticket → "Show entry code": the code rotates every 20 s with a countdown.
2. Door → tonight's event → the arrivals queue lists guests. "Scan next" loads a guest's code into the viewfinder; "Scan my ticket" loads the visitor's own live code; a manual field accepts a pasted code.
3. **Verifying** (≈1.2 s): signature → current holder → right event → not yet used.
4. **Admitted**: the stub tears along the perforation, the ADMITTED stamp lands, the counter goes up, and (for the visitor's own ticket) a souvenir is minted into the wallet.
5. **Refused**, with the reason and the VOID stamp: code expired (a screenshot), already used (with the time), wrong event, not held by this wallet (sold on after the screenshot), unreadable or forged code.

### Flow 4: Create an event (organizer)

1. Organizer → "Create event".
2. Details: name, venue, city, date and doors time, category, cover colour.
3. Tiers: name, face price, supply (add up to 4).
4. Rules: resale cap (100–150 %), royalty (0–10 %), per-wallet limit (1–8), souvenir on/off.
5. A live ticket preview updates as you type.
6. "Deploy event" → prompt → **pending** ("Deploying ticket contract…") → **confirmed**: the event is on sale in the box office and listed in the console with 0 sold.
7. Failed states: inline validation (missing name, date in the past, zero supply), rejected signature, forced network failure (the form keeps its values).

### Flow 5: Watch the money move (organizer view)

1. Organizer console lists each event: sold/supply bar, primary revenue, resale royalties earned, admitted count.
2. After Flow 2's sale, the royalty appears in that event's ledger with the transaction hash; after Flow 3, the admitted count rises.

## 7. Content (English and French)

Tone: plain, confident and a little warm, like a good box-office clerk. Short sentences. We talk to organizers as professionals and to fans as people going out. We never hype "the blockchain"; we say what it does for them. French is written for Québec and France readers alike (portefeuille, billet, revente, redevance, « on-chain » kept where it's used).

All visible strings live in `src/i18n/dictionaries/en.ts` and `fr.ts`; the tables below are the main copy.

### Home

| Section | English | Français |
|-|-|-|
| Three people heading | One ticket. Three people it has to work for. | Un billet. Trois personnes à satisfaire. |
| Fan | **The fan** buys a real ticket, keeps it in a wallet, and can pass it on at a fair price. · Buy a ticket | **Le fan** achète un vrai billet, le garde dans son portefeuille et peut le céder à un prix juste. · Acheter un billet |
| Organizer | **The organizer** sets the rules once. Every resale pays a royalty back, automatically. · Open the organizer console | **L'organisateur** fixe les règles une fois. Chaque revente lui verse une redevance, automatiquement. · Ouvrir la console organisateur |
| Door | **The door** scans a code that changes every 20 seconds. Copies fail; real guests walk in. · Work the door | **L'entrée** scanne un code qui change toutes les 20 secondes. Les copies échouent, les vrais invités passent. · Tenir la porte |
| Resale rail | **Resale, with a ceiling.** Drag the price. It stops at the cap the organizer set, and the receipt shows who gets what. | **La revente, avec un plafond.** Faites glisser le prix. Il s'arrête au plafond fixé par l'organisateur, et le reçu montre qui touche quoi. |
| Organizers | **Set your rules once. The contract keeps them.** Resale cap, royalty, per-wallet limit, souvenir: chosen once, enforced on every sale. · Create an event in the demo | **Fixez vos règles une fois. Le contrat s'en charge.** Plafond, redevance, limite par portefeuille, souvenir : choisis une fois, appliqués à chaque vente. · Créer un événement dans la démo |
| Closing | **The night is for the crowd, not the resellers.** Buy a ticket, resell it, scan it in. Nothing is charged. · Open the box office | **La soirée appartient au public, pas aux revendeurs.** Achetez un billet, revendez-le, scannez-le. Rien n'est facturé. · Ouvrir la billetterie |

### How it works (excerpt)

| Section | English | Français |
|-|-|-|
| Title | The rules are the product. What the ticket contract enforces, and why a copied code is refused at the door. | Les règles sont le produit. Ce que le contrat des billets applique, et pourquoi un code copié est refusé à l'entrée. |
| Code | **Why a screenshot fails.** Every 20 seconds the wallet signs a new code. The door accepts only the current one, signed by today's holder. | **Pourquoi une capture d'écran échoue.** Toutes les 20 secondes, le portefeuille signe un nouveau code. La porte n'accepte que le code en cours, signé par le détenteur actuel. |

**FAQ (on /how-it-works only, 5 questions)**

| English | Français |
|-|-|
| **Do fans need to know anything about crypto?** No. In a real launch a wallet is created at checkout with an email. This demo simulates it in one click. | **Les fans doivent-ils connaître la crypto?** Non. Lors d'un vrai lancement, un portefeuille est créé au paiement avec un courriel. Cette démo le simule en un clic. |
| **What if the door has no signal?** The check needs only the code and the event's public data, kept offline. Used tickets sync when the signal returns. | **Et si l'entrée n'a pas de réseau?** La vérification n'a besoin que du code et des données publiques de l'événement, gardées hors ligne. Les billets utilisés se synchronisent ensuite. |
| **Can a fan get around the cap?** Paid transfers go through the capped marketplace. Off-platform deals leave the buyer with a code only the seller can sign. | **Un fan peut-il contourner le plafond?** Les transferts payants passent par le marché plafonné. Un arrangement hors plateforme laisse l'acheteur avec un code que seul le vendeur peut signer. |
| **What if a fan loses their phone?** They sign in on another device and the ticket is there. The old phone's codes stop working when they rotate. | **Et si un fan perd son téléphone?** Il se connecte sur un autre appareil et retrouve son billet. Les codes de l'ancien téléphone cessent de fonctionner dès qu'ils changent. |
| **Which standard do tickets use?** One ERC-721 collection per event, with transfer hooks for the cap and the royalty. Here it is simulated; nothing is deployed. | **Quelle norme les billets utilisent-ils?** Une collection ERC-721 par événement, avec des crochets de transfert pour le plafond et la redevance. Ici, tout est simulé. |

### App (main strings)

| Key | English | Français |
|-|-|-|
| Box office title | Box office | Billetterie |
| Box office intro | Upcoming shows on the demo network. Pick one to buy a ticket or a capped resale. | Spectacles à venir sur le réseau de démo. Choisissez-en un pour acheter un billet ou une revente plafonnée. |
| Search | Search shows, venues or cities | Chercher un spectacle, une salle ou une ville |
| Empty (search) | No show matches "{q}". Try another city or clear the filters. | Aucun spectacle ne correspond à « {q} ». Essayez une autre ville ou effacez les filtres. |
| Empty (wallet) | No tickets yet. Your tickets land here as soon as a purchase is confirmed. · Browse shows | Aucun billet pour l'instant. Vos billets arrivent ici dès qu'un achat est confirmé. · Voir les spectacles |
| Wallet not connected | Connect a wallet to see your tickets. In this demo it takes one click and no real wallet. | Connectez un portefeuille pour voir vos billets. Dans cette démo, un clic suffit, sans vrai portefeuille. |
| Pending | Waiting for the network… | En attente du réseau… |
| Buy confirmed | Ticket {serial} is in your wallet. | Le billet {serial} est dans votre portefeuille. |
| Insufficient | Not enough tUSDC. You need {need}, you have {have}. | Pas assez de tUSDC. Il vous faut {need}, vous avez {have}. |
| Limit | This wallet already holds {n} tickets for this show (limit {max}). | Ce portefeuille détient déjà {n} billets pour ce spectacle (limite {max}). |
| Sold out | Sold out. Check the resale list below. | Complet. Consultez les reventes ci-dessous. |
| Network fail | The network didn't confirm the transaction. Nothing was charged. Try again. | Le réseau n'a pas confirmé la transaction. Rien n'a été débité. Réessayez. |
| Rejected | You rejected the request in your wallet. Nothing was sent. | Vous avez refusé la demande dans votre portefeuille. Rien n'a été envoyé. |
| Above cap | Price above the resale cap set by the organizer ({cap}). The contract refused the listing. | Prix au-dessus du plafond de revente fixé par l'organisateur ({cap}). Le contrat a refusé la mise en vente. |
| Door admitted | Admitted. Enjoy the show. | Entrée validée. Bon spectacle. |
| Door expired | Refused: this code expired {s} s ago. Likely a screenshot. | Refusé : ce code a expiré il y a {s} s. Probablement une capture d'écran. |
| Door used | Refused: already used at {time}. | Refusé : déjà utilisé à {time}. |
| Door wrong event | Refused: this ticket is for {event}. | Refusé : ce billet est pour {event}. |
| Door not holder | Refused: the signing wallet no longer holds this ticket. | Refusé : le portefeuille signataire ne détient plus ce billet. |
| Door forged | Refused: unreadable or forged code. | Refusé : code illisible ou falsifié. |
| Testnet notice | Testnet demo · not financial advice · no real funds | Démo sur testnet · pas un conseil financier · aucun fonds réel |
| Demo badge | Demo · simulated data | Démo · données simulées |
| Reset | Reset demo | Réinitialiser la démo |
| Error page | Something went wrong on our side. Your demo data is safe in this browser. · Try again | Un problème est survenu de notre côté. Vos données de démo sont intactes dans ce navigateur. · Réessayer |
| 404 | This page isn't on the programme. The link may be old, or the show moved. · Back to home · Open the box office | Cette page n'est pas au programme. Le lien est peut-être ancien, ou le spectacle a déménagé. · Retour à l'accueil · Ouvrir la billetterie |
| Storage unavailable | Your browser is blocking storage, so the demo will reset when you leave. | Votre navigateur bloque le stockage : la démo sera réinitialisée à votre départ. |

The full set of strings (form labels, aria labels, validation, activity) is in the dictionaries.

## 8. Aesthetics

**Concept: "Box-office card stock, house lights."** NFTokenPass should feel like the best thing about going out: a thick printed ticket in your hand, a lit marquee, a rubber stamp at the door. Organizers and fans already trust that physical language; it tells them in one glance that this is about *tickets*, not about crypto. The digital twist is that the paper now keeps its own rules. So the site is printed-looking and tactile (card stock, ink, perforations, serial numbers, stamps), and the dark theme is "house lights down": velvet-black with the marquee yellow glowing only where you act.

**Palette.** Two inks and a card stock. Primary actions are **press ink** on paper in light mode, and **marquee yellow** in dark mode. The yellow is the ticket itself (classic "ADMIT ONE" stock) and our signature. Status colours are reserved for the door: green = admitted, red = void, amber = pending, always with a text label and a stamp shape. Red and green are never used for branding, so they keep their meaning.

Light theme ("card stock"):

| Role | Value | Pair checked | Ratio |
|-|-|-|-|
| `background` | `#F5EFE3` | `foreground` on it | 15.41 |
| `foreground` | `#1C1814` | | |
| `card` | `#FFFCF5` | `foreground` on it | 17.22 |
| `primary` | `#1C1814` (press ink) | `primary-foreground` `#FFF8EA` on it | 16.69 |
| `muted` | `#EAE2D2` | `muted-foreground` `#5C5347` on it | 5.86 (6.59 on background, 7.36 on card) |
| `accent` | `#F4C542` (marquee yellow) | `accent-foreground` `#1C1814` on it | 10.85 |
| `border` | `#D8CCB6` | decorative (inputs also use `#B9AB92`) | n/a |
| `ring` | `#1C1814` | vs background (non-text, ≥ 3:1) | 15.41 |
| `destructive` | `#B3261E` | on background / card; white on it | 5.71 / 6.38 / 6.54 |
| `success` (extra) | `#1E6B43` | on card; white on it | 6.33 / 6.48 |
| `warning` (extra) | `#8A5300` | on card | 6.18 |
| `chart-1…5` | `#1C1814`, `#C08A1E`, `#2F6B62`, `#9C4A3A`, `#8C8171` | fills with text labels | n/a |

Dark theme ("house lights down"):

| Role | Value | Pair checked | Ratio |
|-|-|-|-|
| `background` | `#14110E` | `foreground` `#F2EADB` on it | 15.74 |
| `card` | `#1E1A16` | `foreground` on it | 14.46 |
| `primary` | `#F4C542` (marquee yellow) | `primary-foreground` `#1C1814` on it | 10.85 |
| `muted` | `#2A2520` | `muted-foreground` `#B3A792` on it | 6.40 (7.94 on background) |
| `accent` | `#3A3128` | `accent-foreground` `#F2EADB` on it | 10.65 |
| `border` | `#3A332A` | decorative | n/a |
| `ring` | `#F4C542` | vs background | 11.57 |
| `destructive` | `#F2766B` | on background / card; ink on it | 6.79 / 6.24 / 6.79 |
| `success` | `#6CCB94` | on card; ink on it | 8.73 / 9.50 |
| `warning` | `#E8B04A` | on card | 8.84 |
| `chart-1…5` | `#F4C542`, `#F2EADB`, `#6FB3A6`, `#D98B73`, `#9C917F` | fills with labels | n/a |

The ticket object keeps its yellow card stock in both themes (ink `#1C1814` on `#F4C542`: 10.85; secondary ink `#4A3F2C`: 6.33).

**Type.** Two families via `next/font/google`:

- **Big Shoulders** (variable, optical size set to display): a condensed face drawn from Chicago's signage and marquees. Headlines, ticket serials, stamps, big numbers. Uppercase for stamps and eyebrows, tight tracking.
- **Instrument Sans** (400, 500, 600, 700): a clear, slightly warm grotesk for body, UI and forms.

Scale (rem, mobile → desktop): display 3.0 → 5.25 (Big Shoulders 800, line-height 0.92); h1 2.5 → 3.75; h2 2.0 → 2.75; h3 1.375 → 1.625; body 1.0 (line-height 1.6); small 0.875; micro/labels 0.75 uppercase with 0.08em tracking. Numbers use tabular figures.

**Logo.** A wordmark "NFTokenPass" in Big Shoulders 800, preceded by a mark: a small ticket outline with two punched notches and a dashed perforation, the stub holding a solid square (the token). SVG in `src/components/brand/logo.tsx`; favicon `src/app/icon.svg` is the mark in ink on yellow.

**Shape.** Small radius (`--radius: 0.375rem`) for controls; tickets have punched semicircle notches on the perforation line and a dashed tear line. Borders do the work: 1px `border` everywhere, 1.5px ink borders on tickets. Depth is flat print: no blur, no glass; a single hard "stacked paper" offset (`0 2px 0` of the border colour) on tickets and cards that can be picked up. Motion is mechanical and short: stamps land with a quick scale-and-settle (180 ms), the stub tears with a 400 ms rotate-and-drop, codes rotate with a countdown bar. All motion is disabled under `prefers-reduced-motion`.

**Imagery.** Photography only where the product can't show it: the crowd and the venue, shot at night under warm tungsten and red marquee light, grainy and candid, never posed stock. Two photos with the same warm red and amber grade. Everything else is drawn in code: tickets, stubs, stamps, the door viewfinder, entry codes, the ticket-life diagram and the code-rotation diagram, all flat ink line work on card stock.

**Signature moments.**

1. **The tear.** At the door, an admitted ticket's stub tears along the perforation and drops, and an ADMITTED stamp thunks onto it. A refused ticket gets a red VOID stamp and a short shake, with the reason printed underneath.
2. **The resale rail.** A price rail with a hard stop at the organizer's cap; push past it and the handle bumps against the stop. Under it, a printed receipt splits the price live: buyer pays, organizer royalty, seller receives.
3. **The living code.** The entry code in the wallet re-draws every 20 seconds with a draining bar; a screenshot taken earlier fails at the door with "expired". After check-in, the ticket flips into a souvenir stub.

**What we deliberately avoid, and why.** Purple/blue "Web3" gradients (the Lovable site's look, and every other crypto site), frosted glass, neon/cyber glows, glowing coins, 3D blobs, and the stock shadcn look (grey cards, default radius, Inter-like type). Also no confetti and no "NFT" art aesthetic (apes, holograms): fans don't buy NFTs, they buy tickets. Red and green stay out of the brand so the door's verdict is unambiguous. We avoid Monark orange entirely; Monark appears only in the footer credit.

## 9. Assets

**Photos** (Unsplash, free license; details and credits in `docs/assets.md` and on `/credits`):

| File | Purpose | Placement |
|-|-|-|
| `public/images/crowd.jpg` | The night itself: hands up under warm stage light (Tijs van Leur) | Home, closing call to action ("The night is for the crowd…") |
| `public/images/marquee.jpg` | The venue: a lit theatre marquee at night (Artur Ament) | Home, "For organizers" section |

**Built in code:** the ticket component (hero, wallet, previews, Open Graph), stamps (ADMITTED, VOID, LISTED, SOLD, SOUVENIR), the entry-code matrix (deterministic, not a real QR), the door viewfinder, the resale rail and receipt, the ticket-life diagram and the code-rotation diagram on `/how-it-works`, event cover "posters" (typographic, per-event colour), the 404 VOID stub.

**Icons:** `lucide-react`. **Logo and favicon:** SVG built in code. **Open Graph image:** generated per locale with `next/og` (ticket on card stock).

## 10. Pricing strategy

NFTokenPass is an independent product, so it needs a real model. **Organizers pay; fans see the face price plus the network fee, and nothing else.** Incumbents make most of their money from fan-side service fees (often 15–30 % on top of face value), which is exactly what makes fans distrust ticketing. We price on the organizer side, well below that, and we add a revenue line organizers have never had (resale royalties), which more than pays for the fee on a busy show.

| Plan | Price | For |
|-|-|-|
| **Free events** | 0 $ | Free-entry events up to 1,000 tickets: community shows, meetups. Builds the fan-wallet base. |
| **Pay as you sell** | 1.5 % of face value + 0.25 $ per paid ticket; 2 % of each resale (taken from the resale, next to the organizer's royalty) | Independent promoters and small venues. No monthly fee; costs scale with sales. |
| **Venue** | 249 $ / month + 0.9 % per paid ticket; resale fee 1.5 % | Venues and festivals with regular programming: unlimited door devices, offline door mode, multi-event console, team roles, payout exports. |

Why these numbers: on a 45 $ ticket, Pay as you sell costs the organizer 0.93 $ (about 2 %), versus the 8–12 $ fan fees common today. A single resale at 49.50 $ with a 5 % royalty pays the organizer 2.48 $, more than the ticket's fee. Venue breaks even against Pay as you sell at roughly 1,000 paid tickets per month.

`/pricing` is built as a designed page for internal review only: never linked (header, footer, CTAs, FAQ, sitemap), excluded from `sitemap.xml`, `robots: { index: false, follow: false }`. No other page mentions prices or fees of NFTokenPass itself.

## 11. Out of scope

- No real chain, wallet, signatures, payments or email wallets; all simulated in `src/lib/demo/`.
- No real QR codes or camera scanning; the entry code is a deterministic drawing and the door "scans" by selecting a guest or pasting a code.
- No seat maps (tiers are sections, with a seat or section label on the ticket).
- No accounts, KYC, refunds, chargebacks, taxes or payouts to bank accounts.
- No marketplace beyond capped resale of a show's own tickets (no auctions, no bids, no cross-event trading).
- No dynamic artwork beyond the ticket's own states (on sale → in wallet → listed → used → souvenir).
- No analytics, cookies or tracking.

## Restraint pass (owner feedback)

After the first build, the owner asked every site to carry less text. What was cut:

- Home: the "three things classic ticketing gets wrong" band, the separate photo band, the four rule cards under "For organizers", the home FAQ and the hero eyebrow and caption. The home page now has four sections after the hero, the closing call to action included.
- How it works: every body cut to one short line; the FAQ lives only here (5 questions).
- App: the testnet notice appears once per transaction, in the wallet prompt, and no longer under every button; removed the roles hint, the entry-code explainer, the resell explainer and fee line, the "bypass" hint, and the hints under every rule slider. The app bar keeps one Testnet chip and the demo controls; the "Demo · simulated data" chip sits in the header, and the footer keeps the notice.
- Toasts sit bottom-left on desktop and just under the header on phones, so they never cover the inline result they duplicate.

## Decisions made while working unattended

- **Currency.** Prices are in **tUSDC**, a test stablecoin, so ticket prices read like real prices (45.00) rather than ETH decimals. Network fees are shown in tUSDC too, for clarity.
- **Network.** The demo network is labelled "Testnet" in the network badge; no specific public testnet is implied.
- **Fictional events and venues.** All artists, venues and teams are invented (Montréal and Québec City settings, fitting the bilingual audience), to avoid implying real partnerships.
- **Relative dates.** Event dates are generated relative to the moment the demo is seeded, so the demo never shows past events as upcoming. "Tonight's show" is always tonight.
- **Seeded wallet.** On first connection the wallet holds 250.00 tUSDC, one ticket for tonight's show and one souvenir from a past show, so the door flow can be tried immediately.
- **No separate activity page.** Activity lives inside the wallet and organizer views, where it's read.
