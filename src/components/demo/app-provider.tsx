"use client"

import { useEffect, useSyncExternalStore } from "react"

import { Toaster } from "@/components/ui/sonner"
import { initDemo } from "@/lib/demo/store"

import { AppCtx, type AppCopy } from "./app-context"
import { WalletPrompt } from "./wallet-prompt"

const MOBILE = "(max-width: 767px)"

function useIsMobile(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(MOBILE)
      m.addEventListener("change", cb)
      return () => m.removeEventListener("change", cb)
    },
    () => window.matchMedia(MOBILE).matches,
    () => false
  )
}

/**
 * Toasts never sit on what they report: flow results appear inline in the
 * lower part of the screen, so toasts go bottom-left on desktop (away from
 * the right-hand checkout) and just under the header on phones.
 */
export function AppProvider({ copy, children }: { copy: AppCopy; children: React.ReactNode }) {
  const mobile = useIsMobile()
  useEffect(() => {
    initDemo()
  }, [])
  return (
    <AppCtx.Provider value={copy}>
      {children}
      <WalletPrompt />
      <Toaster
        position={mobile ? "top-center" : "bottom-left"}
        offset={{ bottom: 24, left: 24 }}
        mobileOffset={{ top: 72, left: 12, right: 12 }}
        duration={3500}
      />
    </AppCtx.Provider>
  )
}
