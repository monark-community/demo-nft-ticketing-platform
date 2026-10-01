"use client"

import { useEffect } from "react"

import { Toaster } from "@/components/ui/sonner"
import { useMediaQuery } from "@/hooks/use-media-query"
import { initDemo } from "@/lib/demo/store"

import { AppCtx, type AppCopy } from "./app-context"
import { WalletPrompt } from "./wallet-prompt"

/**
 * Toasts never sit on what they report: flow results appear inline in the
 * lower part of the screen, so toasts go bottom-left on desktop (away from
 * the right-hand checkout) and just under the header on phones.
 */
export function AppProvider({ copy, children }: { copy: AppCopy; children: React.ReactNode }) {
  const mobile = useMediaQuery("(max-width: 767px)")
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
