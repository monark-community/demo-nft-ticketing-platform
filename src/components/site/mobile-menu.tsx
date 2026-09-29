"use client"

import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Locale } from "@/i18n/config"

import { LocaleSwitch } from "./locale-switch"
import { NavLinks, type NavItem } from "./nav-links"
import { ThemeToggle } from "./theme"

interface Props {
  locale: Locale
  items: NavItem[]
  labels: {
    open: string
    close: string
    title: string
    nav: string
    language: string
    theme: string
    action: string
    demo: string
    names: Record<Locale, string>
    short: Record<Locale, string>
  }
  actionHref: string
}

export function MobileMenu({ locale, items, labels, actionHref }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  // Close when navigating.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    if (open) setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={labels.open} className="size-11 md:hidden">
          <MenuIcon className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={labels.close} className="flex w-full flex-col gap-6 pt-[max(1.5rem,env(safe-area-inset-top))] sm:max-w-sm">
        <SheetTitle className="font-display text-2xl font-extrabold uppercase">{labels.title}</SheetTitle>
        <SheetDescription className="sr-only">{labels.nav}</SheetDescription>
        <NavLinks items={items} label={labels.nav} vertical />
        <div className="flex items-center gap-3 border-t pt-5">
          <LocaleSwitch locale={locale} label={labels.language} names={labels.names} short={labels.short} />
          <ThemeToggle label={labels.theme} />
        </div>
        <Button asChild size="lg" className="h-12 w-full text-base">
          <Link href={actionHref}>{labels.action}</Link>
        </Button>
        <p className="mt-auto pb-[env(safe-area-inset-bottom)] text-xs text-muted-foreground">{labels.demo}</p>
      </SheetContent>
    </Sheet>
  )
}
