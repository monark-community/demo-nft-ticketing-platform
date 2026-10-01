import { notFound } from "next/navigation"

import { WalletView } from "@/components/demo/wallet-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/wallet">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).app
  return pageMetadata(locale, "/app/wallet", d.walletView.title, d.walletView.intro)
}

export default async function WalletPage({ params }: PageProps<"/[locale]/app/wallet">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <WalletView />
}
