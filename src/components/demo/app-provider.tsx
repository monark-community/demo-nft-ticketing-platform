"use client"

import { useEffect } from "react"

import { Toaster } from "@/components/ui/sonner"
import { initDemo } from "@/lib/demo/store"

import { AppCtx, type AppCopy } from "./app-context"
import { WalletPrompt } from "./wallet-prompt"

export function AppProvider({ copy, children }: { copy: AppCopy; children: React.ReactNode }) {
  useEffect(() => {
    initDemo()
  }, [])
  return (
    <AppCtx.Provider value={copy}>
      {children}
      <WalletPrompt />
      <Toaster position="bottom-left" offset={{ bottom: 24, left: 24 }} mobileOffset={{ bottom: 16, left: 12, right: 12 }} />
    </AppCtx.Provider>
  )
}
