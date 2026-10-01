"use client"

import { useRef } from "react"

import { cn } from "@/lib/utils"

const clamp = (n: number) => Math.min(1, Math.max(0, n))

/**
 * Tilts its content toward the pointer and feeds the pointer position to the
 * foil layers inside (`--foil-x`, `--foil-y`). Idle, the foil drifts on its own.
 * Writes styles directly so tracking never re-renders the ticket.
 */
export function FoilTilt({
  children,
  className,
  max = 9,
  captureTouch = false,
}: {
  children: React.ReactNode
  className?: string
  /** Maximum tilt in degrees on each axis. */
  max?: number
  /** Claim touch drags for the tilt (only where the page doesn't need to scroll under it). */
  captureTouch?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = clamp((e.clientX - r.left) / r.width)
    const y = clamp((e.clientY - r.top) / r.height)
    el.dataset.tracking = ""
    el.style.setProperty("--foil-x", `${(x * 100).toFixed(1)}%`)
    el.style.setProperty("--foil-y", `${(y * 100).toFixed(1)}%`)
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.transform = `perspective(900px) rotateX(${((0.5 - y) * max * 2).toFixed(2)}deg) rotateY(${((x - 0.5) * max * 2).toFixed(2)}deg) scale(1.02)`
    }
  }

  function leave() {
    const el = ref.current
    if (!el) return
    delete el.dataset.tracking
    el.style.removeProperty("--foil-x")
    el.style.removeProperty("--foil-y")
    el.style.transform = ""
  }

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      onPointerCancel={leave}
      className={cn("foil-tilt", captureTouch && "touch-none", className)}
    >
      {children}
    </div>
  )
}
