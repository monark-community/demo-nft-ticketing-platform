import { rareArt } from "@/components/ticket/rare-art"
import type { TicketProps } from "@/components/ticket/ticket"
import { t } from "@/i18n/t"
import { capPctOf, perksOf, rareConfigOf } from "@/lib/demo/ops"
import type { DemoState, Ticket } from "@/lib/demo/types"
import { clock, eventDate, loc, percent } from "@/lib/format"

import type { AppCopy } from "./app-context"

/** Everything the Ticket component needs for a ticket in the demo store. */
export function ticketProps(state: DemoState, ticket: Ticket, copy: AppCopy): TicketProps {
  const { tk, locale } = copy
  const ev = state.events.find((e) => e.id === ticket.eventId)
  const tier = ev?.tiers.find((x) => x.id === ticket.tierId)
  return {
    eventName: ev?.name ?? "",
    tagline: ev ? loc(ev.tagline, locale) : undefined,
    venue: ev ? `${ev.venue}, ${loc(ev.city, locale)}` : "",
    date: ev ? eventDate(ev.startsAt, locale) : "",
    doors: ev ? clock(ev.doorsAt, locale) : "",
    section: tier ? loc(tier.section, locale) : "",
    seat: ticket.seat,
    serial: ticket.serial,
    labels: tk,
    rare: ticket.rare
      ? {
          ...rareArt(ticket.rare.art),
          label: t(tk.rare, { n: ticket.rare.edition, of: ticket.rare.of }),
          perks: perksOf(ticket, ev).map((p) => tk.rarePerks[p]),
          perksLabel: tk.perks,
          pattern: ticket.rare.pattern,
          back: {
            title: tk.perks,
            perks: perksOf(ticket, ev).map((p) => tk.rarePerks[p]),
            stub: `${ticket.rare.edition}/${ticket.rare.of}`,
            facts: [
              ...(ev
                ? [{ label: tk.cap, value: t(tk.back.capBoost, { pct: percent(capPctOf(ev, ticket), locale), bonus: rareConfigOf(ev).capBonus }) }]
                : []),
              { label: tk.back.art, value: tk.rareArt[ticket.rare.art] },
              { label: tk.back.foil, value: tk.foilPatterns[ticket.rare.pattern ?? "zigzag"] },
            ],
          },
        }
      : undefined,
    rules: ev
      ? {
          cap: t(tk.capValue, { pct: percent(capPctOf(ev, ticket), locale) }),
          royalty: percent(ev.rules.royaltyPct, locale),
          limit: t(tk.limitValue, { n: ev.rules.perWalletLimit }),
          souvenir: ev.rules.souvenir ? tk.souvenirYes : tk.souvenirNo,
        }
      : undefined,
  }
}
