import { notFound } from "next/navigation"

import { OrganizerView } from "@/components/demo/organizer-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/organizer">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).app
  return pageMetadata(locale, "/app/organizer", d.organizer.title, d.metaDescription)
}

export default async function OrganizerPage({ params }: PageProps<"/[locale]/app/organizer">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <OrganizerView />
}
