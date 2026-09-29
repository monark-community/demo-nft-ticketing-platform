import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { href, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

import { HeaderAction } from "./header-action"
import { LocaleSwitch } from "./locale-switch"
import { MobileMenu } from "./mobile-menu"
import { NavLinks } from "./nav-links"
import { ThemeToggle } from "./theme"

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const c = dict.common
  const items = [
    { href: href(locale, "/app"), label: dict.nav.boxOffice },
    { href: href(locale, "/how-it-works"), label: dict.nav.howItWorks },
  ]
  return (
    <header className="sticky top-0 z-40 border-b bg-background pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={href(locale)} aria-label={c.brandHome} className="rounded-sm">
          <Logo />
        </Link>
        <div className="ml-6 hidden md:block">
          <NavLinks items={items} label={dict.nav.label} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <span className="hidden items-center gap-1.5 rounded-sm border border-dashed border-input px-2 py-1 text-xs font-medium text-muted-foreground lg:inline-flex">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-warning" />
              {c.demoBadge}
            </span>
            <LocaleSwitch locale={locale} label={c.languageLabel} names={c.languageNames} short={c.languageShort} />
            <ThemeToggle label={c.themeToggle} />
          </div>
          <HeaderAction href={href(locale, "/app")} label={c.openBoxOffice} />
          <MobileMenu
            locale={locale}
            items={items}
            actionHref={href(locale, "/app")}
            labels={{
              open: c.menuOpen,
              close: c.menuClose,
              title: c.menuTitle,
              nav: dict.nav.label,
              language: c.languageLabel,
              theme: c.themeToggle,
              action: c.openBoxOffice,
              demo: c.demoBadge,
              names: c.languageNames,
              short: c.languageShort,
            }}
          />
        </div>
      </div>
    </header>
  )
}
