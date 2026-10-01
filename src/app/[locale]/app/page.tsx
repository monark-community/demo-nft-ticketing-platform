import { notFound } from "next/navigation"

import { BoxOffice } from "@/components/demo/box-office"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).app
  return pageMetadata(locale, "/app", d.metaTitle, d.metaDescription)
}

export default async function AppPage({ params }: PageProps<"/[locale]/app">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <BoxOffice />
}
