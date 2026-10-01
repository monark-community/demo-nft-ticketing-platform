import { notFound } from "next/navigation"

import { EventView } from "@/components/demo/event-view"
import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { createSeed } from "@/lib/demo/seed"
import { pageMetadata } from "@/lib/metadata"

/** Seeded shows are prerendered; shows created in the demo render the same client shell on demand. */
export function generateStaticParams() {
  const ids = createSeed(0).events.map((e) => e.id)
  return locales.flatMap((locale) => ids.map((id) => ({ locale, id })))
}

export async function generateMetadata({ params }: PageProps<"/[locale]/app/events/[id]">) {
  const { locale, id } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).app
  const ev = createSeed(0).events.find((e) => e.id === id)
  return pageMetadata(locale, `/app/events/${id}`, ev ? ev.name : d.metaTitle, d.metaDescription)
}

export default async function EventPage({ params }: PageProps<"/[locale]/app/events/[id]">) {
  const { locale, id } = await params
  if (!isLocale(locale)) notFound()
  return <EventView id={id} />
}
