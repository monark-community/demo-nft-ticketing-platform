"use client"

import { useSyncExternalStore } from "react"

/** Whether a media query matches, kept live. False on the server and during hydration. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query)
      m.addEventListener("change", cb)
      return () => m.removeEventListener("change", cb)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

/** The app's desktop layout: inline checkout, top tabs, resale popover (Tailwind `lg`). */
export const DESKTOP = "(min-width: 1024px)"
