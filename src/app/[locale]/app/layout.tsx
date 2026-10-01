import { notFound } from "next/navigation"

import { AppBar } from "@/components/demo/app-bar"
import { AppProvider } from "@/components/demo/app-provider"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export default async function AppLayout({ children, params }: LayoutProps<"/[locale]/app">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  return (
    <AppProvider
      copy={{
        locale,
        d: dict.app,
        tk: dict.ticket,
        rail: dict.rail,
        categories: dict.categories,
        common: { testnet: dict.common.testnet, demoBadge: dict.common.demoBadge, menuClose: dict.common.menuClose },
      }}
    >
      <AppBar />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</div>
    </AppProvider>
  )
}
