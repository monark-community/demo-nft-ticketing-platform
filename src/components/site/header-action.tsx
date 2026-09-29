"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"

/** The header's single primary action; hidden inside the demo, whose app bar has the wallet and the demo badge. */
export function HeaderAction({ href, label }: { href: string; label: string }) {
  const pathname = usePathname() ?? ""
  if (pathname.startsWith(href)) return null
  return (
    <Button asChild className="hidden md:inline-flex">
      <Link href={href}>{label}</Link>
    </Button>
  )
}
