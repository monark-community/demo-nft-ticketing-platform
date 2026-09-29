"use client"

import { txHash, uid } from "./ids"
import { getDemo, patchTx, requestSignature, update } from "./store"
import type { DemoState, Tx, TxError, TxKind, TxSummary } from "./types"

/**
 * The simulated chain: every write goes wallet prompt → pending (with a hash
 * and realistic latency) → confirmed or failed. Swap this module for
 * wagmi/viem calls to talk to a real network.
 */

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export function latency(): number {
  const slow = getDemo()?.settings.slow ?? false
  return Math.round((1200 + Math.random() * 1400) * (slow ? 2.5 : 1))
}

export interface RunOptions {
  kind: TxKind
  summary: TxSummary | null
  vars: Record<string, string | number>
  /** Signed amount for your wallet, in cents (negative = spent). */
  amount?: number
  /** Re-checked when the block lands (e.g. the tier sold out meanwhile). */
  check?: (s: DemoState) => TxError | null
  /** A contract revert that will happen regardless (e.g. listing above the cap). */
  revert?: TxError
  apply: (s: DemoState, tx: Tx) => DemoState
}

export interface RunResult {
  ok: boolean
  tx: Tx
}

function addTx(tx: Tx) {
  update((s) => ({ ...s, txs: [tx, ...s.txs].slice(0, 60) }))
}

export async function runTx(o: RunOptions): Promise<RunResult> {
  const base: Tx = { id: uid("tx"), hash: txHash(), kind: o.kind, state: "pending", vars: o.vars, amount: o.amount, at: Date.now() }

  if (o.summary) {
    const approved = await requestSignature(o.summary)
    if (!approved) {
      const tx: Tx = { ...base, state: "failed", error: "rejected" }
      addTx(tx)
      return { ok: false, tx }
    }
  }

  addTx(base)
  await sleep(latency())

  const s = getDemo()
  if (!s) return { ok: false, tx: base }

  let error: TxError | null = null
  if (s.settings.failNext) {
    error = "network"
    update((st) => ({ ...st, settings: { ...st.settings, failNext: false } }))
  } else if (o.revert) {
    error = o.revert
  } else if (o.check) {
    error = o.check(s)
  }

  if (error) {
    const patch = { state: "failed" as const, error, at: Date.now() }
    patchTx(base.id, patch)
    return { ok: false, tx: { ...base, ...patch } }
  }

  const done: Tx = { ...base, state: "confirmed", at: Date.now() }
  update((st) => o.apply({ ...st, txs: st.txs.map((t) => (t.id === base.id ? done : t)) }, done))
  return { ok: true, tx: done }
}
