"use client"

import { DoorOpenIcon, LayoutGridIcon, TicketIcon, TrendingUpIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { ConnectWallet } from "@/components/ui/connect-wallet"
import { NetworkBadge } from "@/components/ui/network-badge"
import { href } from "@/i18n/config"
import { disconnectWallet } from "@/lib/demo/ops"
import { useDemo, useStorageOk } from "@/lib/demo/store"
import { money } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useApp } from "./app-context"
import { DemoControls } from "./demo-controls"
import { useConnect } from "./feedback"

export function AppBar() {
  const { d, locale } = useApp()
  const state = useDemo()
  const storageOk = useStorageOk()
  const pathname = usePathname() ?? ""
  const connect = useConnect()
  const base = href(locale, "/app")
  const tabs = [
    { href: base, label: d.roles.boxOffice, icon: LayoutGridIcon, active: pathname === base || pathname.startsWith(`${base}/events`) },
    { href: `${base}/wallet`, label: d.roles.wallet, icon: TicketIcon, active: pathname.startsWith(`${base}/wallet`) },
    { href: `${base}/door`, label: d.roles.door, icon: DoorOpenIcon, active: pathname.startsWith(`${base}/door`) },
    { href: `${base}/organizer`, label: d.roles.organizer, icon: TrendingUpIcon, active: pathname.startsWith(`${base}/organizer`) },
  ]
  const w = state?.wallet

  return (
    <div className="border-b bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <nav aria-label={d.roles.label} className="-mx-1 overflow-x-auto max-lg:hidden">
          <ul className="flex min-w-max gap-1 px-1">
            {tabs.map((tab) => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={tab.active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors pointer-coarse:h-11",
                    tab.active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <tab.icon className="size-4" aria-hidden="true" />
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <NetworkBadge
            name={d.network}
            variant="outline"
            icon={<span className="block size-full rounded-full bg-warning" />}
            className="h-7 border-input"
          />
          <div className="ml-auto flex items-center gap-2">
            {w?.status === "connected" && (
              <span className="hidden text-right text-xs leading-tight sm:block">
                <span className="block text-muted-foreground">{d.balance}</span>
                <span className="font-semibold tabular-nums">{money(w.balance, locale)}</span>
              </span>
            )}
            {state ? (
              <ConnectWallet
                status={w?.status}
                address={w?.address}
                name={d.wallet.name}
                onConnect={() => void connect()}
                onDisconnect={disconnectWallet}
                connectLabel={d.wallet.connect}
                connectingLabel={d.wallet.connecting}
                disconnectLabel={d.wallet.disconnect}
                className="h-11 lg:h-10"
              />
            ) : (
              <span className="h-10 w-40 animate-pulse rounded-md bg-muted" aria-hidden="true" />
            )}
            <DemoControls />
          </div>
        </div>
      </div>
      {!storageOk && <p className="border-t bg-muted px-4 py-2 text-center text-xs text-muted-foreground">{d.storageOff}</p>}
      <BottomNav label={d.roles.label} tabs={tabs} />
    </div>
  )
}

/**
 * Phones and tablets: the demo's sections as a bottom bar within thumb reach.
 * Pages that need a primary action pin it just above (see BottomAction).
 */
function BottomNav({ label, tabs }: { label: string; tabs: { href: string; label: string; icon: React.ElementType; active: boolean }[] }) {
  return (
    <nav
      aria-label={label}
      data-bottom-nav=""
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-card/85 lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-xl grid-cols-4">
        {tabs.map((tab) => (
          <li key={tab.href} className="flex">
            <Link
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] leading-none font-semibold transition-colors",
                tab.active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition-colors", tab.active && "bg-foreground text-background")}>
                <tab.icon className="size-[18px]" aria-hidden="true" />
              </span>
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Height the bottom bar takes, for content padding and for actions pinned above it. */
export const BOTTOM_NAV_H = "calc(4rem + env(safe-area-inset-bottom))"
