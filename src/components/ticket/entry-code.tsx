"use client"

import { useMemo, useState } from "react"

import { codeMatrix, CODE_WINDOW_MS, entryCode, msUntilRotation, windowOf } from "@/lib/demo/code"
import type { Address } from "@/lib/demo/types"
import { t } from "@/i18n/t"
import { useNow } from "@/hooks/use-now"
import { cn } from "@/lib/utils"

/** The code drawn as a matrix. Deterministic from the code string; not a scannable QR. */
export function CodeMatrix({ code, className, label }: { code: string; className?: string; label?: string }) {
  const grid = useMemo(() => codeMatrix(code), [code])
  const n = grid.length
  return (
    <svg
      viewBox={`-1 -1 ${n + 2} ${n + 2}`}
      className={cn("block aspect-square bg-code-paper text-code-ink", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      shapeRendering="crispEdges"
    >
      {grid.map((row, r) =>
        row.map((on, c) => (on ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="currentColor" /> : null))
      )}
    </svg>
  )
}

/**
 * One code window's countdown. The start offset is fixed when the window's bar
 * mounts (keyed by window), so the once-a-second re-renders above never touch
 * the running animation and it drains smoothly.
 */
function DrainBar({ msLeft }: { msLeft: number }) {
  const [delay] = useState(() => CODE_WINDOW_MS - msLeft)
  return (
    <div
      className="h-full origin-left bg-stock-ink"
      style={{ animation: `drain ${CODE_WINDOW_MS}ms linear both`, animationDelay: `-${delay}ms` }}
    />
  )
}

/** Live rotating entry code for a ticket: matrix, text and a draining 20-second bar. */
export function EntryCode({
  ticket,
  signer,
  labels,
  size = "md",
  className,
}: {
  ticket: { id: string; serial: string }
  signer: Address
  labels: { entryCode: string; codeRotates: string }
  size?: "sm" | "md"
  className?: string
}) {
  const now = useNow(1000)
  const time = now ?? 0
  const code = now === null ? "" : entryCode(ticket, signer, time)
  const secs = now === null ? 20 : Math.ceil(msUntilRotation(time) / 1000)
  const win = windowOf(time)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className={cn("relative z-10 rounded-[3px] bg-code-paper p-1.5", size === "sm" ? "w-24" : "w-32")}>
        {code ? <CodeMatrix code={code} label={`${labels.entryCode}: ${code}`} /> : <div className="aspect-square animate-pulse bg-code-ink/10" />}
      </div>
      <p className="font-mono text-[11px] font-semibold whitespace-nowrap tabular-nums" aria-live="off">
        {code || "NTP-····-······"}
      </p>
      <div className="h-1 w-full overflow-hidden rounded-full bg-stock-ink/15" aria-hidden="true">
        {now !== null && <DrainBar key={win} msLeft={msUntilRotation(time)} />}
      </div>
      <p className="text-[11px] text-stock-ink-soft tabular-nums">{t(labels.codeRotates, { s: secs })}</p>
    </div>
  )
}
