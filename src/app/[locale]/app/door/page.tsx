import { notFound } from "next/navigation"

import { DoorView } from "@/components/demo/door-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/door">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).app
  return pageMetadata(locale, "/app/door", d.door.title, d.door.intro)
}

export default async function DoorPage({ params }: PageProps<"/[locale]/app/door">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <DoorView />
}
