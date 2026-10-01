import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { href, MONARK_URL, PROJECT_DOC_URL, PROJECT_DOC_URL_FR, REPO_URL, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const c = dict.common
  const links = [
    { href: href(locale, "/app"), label: dict.nav.boxOffice },
    { href: href(locale, "/how-it-works"), label: dict.nav.howItWorks },
    { href: href(locale, "/credits"), label: c.creditsLink },
  ]
  const external = [
    { href: locale === "fr" ? PROJECT_DOC_URL_FR : PROJECT_DOC_URL, label: c.projectPage },
    { href: REPO_URL, label: c.github },
  ]
  return (
    <footer className="border-t bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">{c.footerLine}</p>
        </div>
        <nav aria-label={c.footerNav}>
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-9 items-center text-sm hover:underline hover:underline-offset-4">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="space-y-1">
          {external.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center text-sm hover:underline hover:underline-offset-4"
              >
                {l.label}
                <span className="sr-only"> {c.externalNew}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-dashed">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© {new Date().getFullYear()} NFTokenPass</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-warning" />
              {c.demoBadge}
            </span>
          </p>
          <a href={MONARK_URL} target="_blank" rel="noopener noreferrer" className="text-[13px] text-muted-foreground hover:text-foreground hover:underline hover:underline-offset-4">
            {c.builtWith}
            <span className="sr-only"> {c.externalNew}</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
