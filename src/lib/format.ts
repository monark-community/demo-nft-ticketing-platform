import { intlLocale, type Locale } from "@/i18n/config"
import type { L10n } from "@/lib/demo/types"

export function loc(value: L10n, locale: Locale): string {
  return typeof value === "string" ? value : value[locale]
}

/** 4200 → "42.00 tUSDC" / "42,00 tUSDC". */
export function money(cents: number, locale: Locale, withSymbol = true): string {
  const n = new Intl.NumberFormat(intlLocale[locale], { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100)
  return withSymbol ? `${n} tUSDC` : n
}

export function number(n: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale]).format(n)
}

export function percent(n: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], { style: "percent", maximumFractionDigits: 0 }).format(n / 100)
}

export function eventDate(time: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(time)
}

export function longDate(time: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(time)
}

export function clock(time: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { hour: "numeric", minute: "2-digit" }).format(time)
}

/** Relative time for activity rows: "3 min ago" / "il y a 3 min". */
export function ago(time: number, now: number, locale: Locale): string {
  const rtf = new Intl.RelativeTimeFormat(intlLocale[locale], { numeric: "auto", style: "short" })
  const s = Math.round((time - now) / 1000)
  if (Math.abs(s) < 45) return rtf.format(Math.round(s / 1) === 0 ? 0 : s, "second")
  const m = Math.round(s / 60)
  if (Math.abs(m) < 60) return rtf.format(m, "minute")
  const h = Math.round(m / 60)
  if (Math.abs(h) < 24) return rtf.format(h, "hour")
  return rtf.format(Math.round(h / 24), "day")
}

export function shortAddress(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}
