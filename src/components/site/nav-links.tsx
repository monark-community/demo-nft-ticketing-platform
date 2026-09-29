"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export interface NavItem {
  href: string
  label: string
}

/** Header links; the active one gets an ink underline like a ruled ticket field. */
export function NavLinks({ items, label, vertical = false }: { items: NavItem[]; label: string; vertical?: boolean }) {
  const pathname = usePathname() ?? ""
  return (
    <nav aria-label={label}>
      <ul className={cn("flex", vertical ? "flex-col gap-1" : "items-center gap-1")}>
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center rounded-sm px-3 font-medium transition-colors",
                  vertical ? "h-12 w-full text-lg" : "h-9 text-sm",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {active && !vertical && (
                  <span aria-hidden="true" className="absolute inset-x-3 -bottom-[13px] h-[3px] bg-foreground dark:bg-primary" />
                )}
                {active && vertical && <span aria-hidden="true" className="ml-3 size-2 rounded-full bg-foreground dark:bg-primary" />}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
