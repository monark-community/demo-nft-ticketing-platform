import { rareArt } from "@/components/ticket/rare-art"
import type { TicketProps } from "@/components/ticket/ticket"
import { t } from "@/i18n/t"
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
      ? { ...rareArt(ticket.rare.art), label: t(tk.rare, { n: ticket.rare.edition, of: ticket.rare.of }) }
      : undefined,
    rules: ev
      ? {
          cap: t(tk.capValue, { pct: percent(ev.rules.resaleCapPct, locale) }),
          royalty: percent(ev.rules.royaltyPct, locale),
          limit: t(tk.limitValue, { n: ev.rules.perWalletLimit }),
          souvenir: ev.rules.souvenir ? tk.souvenirYes : tk.souvenirNo,
        }
      : undefined,
  }
}
