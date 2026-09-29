"use client"

import { AlertTriangleIcon, CheckCircle2Icon, Loader2Icon, ShieldAlertIcon } from "lucide-react"
import { toast } from "sonner"

import { TxStatus } from "@/components/ui/tx-status"
import { t } from "@/i18n/t"
import { connectWallet } from "@/lib/demo/ops"
import type { DemoState, Tx, TxError } from "@/lib/demo/types"
import { money } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useApp, type AppCopy } from "./app-context"

export type FlowState =
  | { phase: "idle" }
  | { phase: "signing" }
  | { phase: "pending"; tx?: Tx }
  | { phase: "done"; tx?: Tx; message: string }
  | { phase: "error"; tx?: Tx; message: string }

export function errorText(
  copy: AppCopy,
  error: TxError,
  vars: { need?: number; have?: number; n?: number; max?: number; cap?: number } = {}
): string {
  const e = copy.d.tx.errors
  const L = copy.locale
  switch (error) {
    case "insufficient":
      return t(e.insufficient, { need: money(vars.need ?? 0, L), have: money(vars.have ?? 0, L) })
    case "limit":
      return t(e.limit, { n: vars.n ?? 0, max: vars.max ?? 0 })
    case "aboveCap":
      return t(e.aboveCap, { cap: money(vars.cap ?? 0, L) })
    default:
      return e[error]
  }
}

/** Human label for an activity row. */
export function txLabel(copy: AppCopy, tx: Tx): string {
  const vars = { ...tx.vars }
  if (typeof vars.price === "number") vars.price = money(vars.price, copy.locale)
  return t(copy.d.tx.kinds[tx.kind], vars)
}

/** Connect the demo wallet through the simulated prompt. */
export function useConnect() {
  const copy = useApp()
  return async () => {
    const ok = await connectWallet({ kind: "connect", title: copy.d.prompt.connectTitle, lines: [], movesValue: false })
    if (ok) toast.success(copy.d.wallet.connected)
    else toast.error(copy.d.wallet.rejected)
    return ok
  }
}

/** Inline status for a flow: pending with the hash, then the outcome in words. Announced politely. */
export function FlowFeedback({ state, className }: { state: FlowState; className?: string }) {
  const { d } = useApp()
  if (state.phase === "idle") return <div aria-live="polite" className="sr-only" />
  return (
    <div aria-live="polite" className={cn("space-y-2", className)}>
      {state.phase === "signing" && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldAlertIcon className="size-4" aria-hidden="true" />
          {d.prompt.signing}
        </p>
      )}
      {state.phase === "pending" && (
        <div className="space-y-1.5">
          {state.tx ? (
            <TxStatus status="pending" hash={state.tx.hash} label={d.tx.pending} className="w-full bg-background" />
          ) : (
            <p className="flex items-center gap-2 text-sm">
              <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
              {d.tx.pending}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{d.tx.pendingDetail}</p>
        </div>
      )}
      {state.phase === "done" && (
        <div className="space-y-1.5">
          {state.tx && <TxStatus status="confirmed" hash={state.tx.hash} label={d.tx.confirmed} className="w-full bg-background" />}
          <p className="flex items-start gap-2 text-sm font-medium text-success">
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {state.message}
          </p>
        </div>
      )}
      {state.phase === "error" && (
        <div className="space-y-1.5">
          {state.tx && state.tx.error !== "rejected" && (
            <TxStatus status="failed" hash={state.tx.hash} label={d.tx.failed} className="w-full bg-background" />
          )}
          <p role="alert" className="flex items-start gap-2 text-sm font-medium text-destructive">
            <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {state.message}
          </p>
        </div>
      )}
    </div>
  )
}

/** Subscribe a flow to its pending tx: while pending, show the live tx from the store. */
export function livePending(state: FlowState, demo: DemoState | null): FlowState {
  if (state.phase !== "pending" || !demo) return state
  const latest = demo.txs[0]
  return latest && latest.state === "pending" ? { phase: "pending", tx: latest } : state
}

export function TestnetNotice({ className }: { className?: string }) {
  const { common } = useApp()
  return (
    <p className={cn("flex items-start gap-1.5 text-xs text-muted-foreground", className)}>
      <ShieldAlertIcon className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      {common.testnet}
    </p>
  )
}
