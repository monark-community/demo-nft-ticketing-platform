"use client"

import { createContext, useContext } from "react"

import type { Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

export interface AppCopy {
  locale: Locale
  d: Dictionary["app"]
  tk: Dictionary["ticket"]
  rail: Dictionary["rail"]
  categories: Dictionary["categories"]
  common: Pick<Dictionary["common"], "testnet" | "demoBadge" | "menuClose">
}

export const AppCtx = createContext<AppCopy | null>(null)

export function useApp(): AppCopy {
  const v = useContext(AppCtx)
  if (!v) throw new Error("useApp outside AppProvider")
  return v
}
