# Assets

## Photography

Both photos are from Unsplash under the free [Unsplash License](https://unsplash.com/license). Neither is Unsplash+; both were downloaded from `images.unsplash.com` through each photo's free download link, at 1,400 to 1,600 px wide and about 300 KB. They are served from `public/images/` with `next/image` and credited on `/credits`, which the footer links to. They share the same warm tungsten and red marquee grade.

| File | Unsplash page | Photographer | Profile | Used on |
|-|-|-|-|-|
| `public/images/crowd.jpg` | https://unsplash.com/photos/So6YckShOVA | Tijs van Leur | https://unsplash.com/@tijsvl | Home, closing call to action; `/credits` |
| `public/images/marquee.jpg` | https://unsplash.com/photos/bcxmhCX6RK4 | Artur Ament | https://unsplash.com/@atyr | Home, "For organizers"; `/credits` |

## Built in code

- **Logo and favicon:** the ticket mark (`src/components/brand/logo.tsx`) and `src/app/icon.svg`: a ticket with two punched notches, a dashed perforation and the token square on the stub, in ink on marquee yellow.
- **Ticket** (`src/components/ticket/ticket.tsx`): yellow card stock, main part and stub masked separately so the stub can tear away.
- **Stamps** (ADMITTED, VOID, LISTED, MINTED…), the **entry code** matrix (a deterministic drawing of the rotating code, not a scannable QR), the **resale rail** and receipt.
- **Event posters** (`src/components/demo/poster.tsx`): typographic, one colour per event.
- **Souvenir artwork** (`src/components/demo/souvenir-art.ts`): SVG data URIs shown in the registry `nft-card`.
- **Diagrams on `/how-it-works`:** the five-stub ticket life, the 20-second window strip and the on-chain table.
- **Open Graph image:** generated per locale with `next/og` (`src/app/[locale]/opengraph-image.tsx`).

## Type and icons

- Big Shoulders (display) and Instrument Sans (text), both via `next/font/google` (SIL Open Font License).
- Icons: [Lucide](https://lucide.dev) (ISC License).

No Monark logo is used anywhere except the "Built with Monark" text credit in the footer, as the brand guidelines require for independent products.
