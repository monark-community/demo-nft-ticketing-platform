"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"

/** The header's single primary action; hidden inside the demo, which has its own app bar. */
export function HeaderAction({ href, label, demoLabel }: { href: string; label: string; demoLabel: string }) {
  const pathname = usePathname() ?? ""
  if (pathname.startsWith(href)) {
    return (
      <span className="hidden items-center gap-1.5 rounded-sm border border-dashed border-input px-2 py-1 text-xs font-medium text-muted-foreground lg:inline-flex">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-warning" />
        {demoLabel}
      </span>
    )
  }
  return (
    <Button asChild className="hidden md:inline-flex">
      <Link href={href}>{label}</Link>
    </Button>
  )
}
