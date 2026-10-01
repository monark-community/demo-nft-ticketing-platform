"use client"

import { useEffect, useRef } from "react"

import type { FoilPattern } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

const clamp = (n: number) => Math.min(1, Math.max(0, n))

/**
 * Art, foil film, zig-zag texture and glare for one piece of a two-piece card.
 * Every layer is sized to the whole card (`--card-w`/`--card-h`, set by FoilTilt)
 * and pinned to the piece's outer corner, so the two pieces show one continuous
 * sheet; each piece's notch mask clips its share. The first piece sits top-left
 * in both layouts, the second (`end`) bottom-right.
 */
export function FoilPiece({
  end,
  art,
  pattern = "zigzag",
  glare = true,
  sweep,
}: {
  end?: boolean
  /** Embossed foil pattern (a `.foil-<pattern>` class in globals.css). */
  pattern?: FoilPattern
  /** Background of the card's art layer (painted under the piece's content). */
  art?: React.CSSProperties
  glare?: boolean
  /** One bright pass across the card (just revealed). */
  sweep?: boolean
}) {
  const box = cn(
    "pointer-events-none absolute h-[var(--card-h,100%)] w-[var(--card-w,100%)]",
    end ? "right-0 bottom-0" : "top-0 left-0"
  )
  return (
    <>
      {art && <span aria-hidden="true" className={cn(box, "-z-10")} style={art} />}
      <span aria-hidden="true" className={cn(box, "foil-sheen")} />
      <span aria-hidden="true" className={cn(box, "foil-texture", `foil-${pattern}`)} />
      {glare && <span aria-hidden="true" className={cn(box, "foil-glare")} />}
      {sweep && <span aria-hidden="true" className={cn(box, "animate-foil-sweep")} />}
    </>
  )
}

/**
 * Tilts its content toward the pointer and feeds the pointer position to the
 * foil layers inside (`--foil-x`, `--foil-y`). Idle, the foil drifts on its own.
 * Also publishes the card's size (`--card-w`, `--card-h`) for FoilPiece.
 * Writes styles directly so tracking never re-renders the ticket.
 */
export function FoilTilt({
  children,
  className,
  max = 9,
  captureTouch = false,
  paused = false,
}: {
  children: React.ReactNode
  className?: string
  /** Maximum tilt in degrees on each axis. */
  max?: number
  /** Claim touch drags for the tilt (only where the page doesn't need to scroll under it). */
  captureTouch?: boolean
  /** Hold still (e.g. while the card is being spun by something else). */
  paused?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Paused: drop any tilt in progress so the card is square to whatever moves it.
    const el = ref.current
    if (!paused || !el) return
    delete el.dataset.tracking
    el.style.removeProperty("--foil-x")
    el.style.removeProperty("--foil-y")
    el.style.transform = ""
  }, [paused])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      // Layout size, unaffected by the tilt transform.
      el.style.setProperty("--card-w", `${el.offsetWidth}px`)
      el.style.setProperty("--card-h", `${el.offsetHeight}px`)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el || paused) return
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
