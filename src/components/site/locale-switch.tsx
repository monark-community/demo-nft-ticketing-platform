"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { locales, switchLocalePath, type Locale } from "@/i18n/config"
import { cn } from "@/lib/utils"

interface Props {
  locale: Locale
  label: string
  names: Record<Locale, string>
  short: Record<Locale, string>
  className?: string
}

/** Compact EN/FR switch that keeps the current page. Styled like two ticket stubs. */
export function LocaleSwitch({ locale, label, names, short, className }: Props) {
  const pathname = usePathname() ?? `/${locale}`
  return (
    <nav aria-label={label} className={cn("flex items-center rounded-md border border-input p-0.5", className)}>
      {locales.map((l) => {
        const active = l === locale
        return (
          <Link
            key={l}
            href={switchLocalePath(pathname, l)}
            hrefLang={l}
            lang={l}
            aria-current={active ? "true" : undefined}
            aria-label={names[l]}
            prefetch={false}
            className={cn(
              "inline-flex h-7 min-w-8 items-center justify-center rounded-sm px-2 font-display text-sm font-bold tracking-wide transition-colors pointer-coarse:h-10 pointer-coarse:min-w-10",
              active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {short[l]}
          </Link>
        )
      })}
    </nav>
  )
}
