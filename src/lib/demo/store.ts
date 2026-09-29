"use client"

import { useSyncExternalStore } from "react"

import { createSeed } from "./seed"
import type { DemoSettings, DemoState, Tx, TxSummary, WalletState } from "./types"

/**
 * The demo's single source of truth: a tiny external store persisted to
 * localStorage (every access in try/catch). Swapping to a real chain means
 * replacing this module, chain.ts and ops.ts; the UI only uses hooks and actions.
 */

const STORAGE_KEY = "nftokenpass-demo-v1"

let state: DemoState | null = null
let storageOk = true
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function persist() {
  if (!state) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    storageOk = true
  } catch {
    storageOk = false
  }
}

function load(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DemoState
    if (parsed?.version !== 1 || !Array.isArray(parsed.events) || !Array.isArray(parsed.tickets)) return null
    // Reseed a stale world (older than 12 hours) so "tonight" stays tonight.
    if (Date.now() - parsed.seededAt > 12 * 3_600_000) return null
    // A reload never resumes a half-finished connection or transaction.
    if (parsed.wallet.status === "connecting") parsed.wallet.status = "disconnected"
    parsed.txs = parsed.txs.map((tx) => (tx.state === "pending" ? { ...tx, state: "failed", error: "network" } : tx))
    return parsed
  } catch {
    storageOk = false
    return null
  }
}

/** Load saved state, or seed the starting world. Idempotent. */
export function initDemo() {
  if (state) return
  state = load() ?? createSeed()
  persist()
  emit()
}

/** Back to the starting world; keeps the wallet connection and the settings. */
export function resetDemo() {
  const prev = state
  state = createSeed()
  if (prev) {
    state.wallet = { ...state.wallet, status: prev.wallet.status === "connected" ? "connected" : "disconnected" }
    state.settings = { ...prev.settings, failNext: false }
  }
  persist()
  emit()
}

export function update(fn: (s: DemoState) => DemoState) {
  if (!state) return
  state = fn(state)
  persist()
  emit()
}

export function setWallet(patch: Partial<WalletState>) {
  update((s) => ({ ...s, wallet: { ...s.wallet, ...patch } }))
}

export function setSettings(patch: Partial<DemoSettings>) {
  update((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
}

export function patchTx(id: string, patch: Partial<Tx>) {
  update((s) => ({ ...s, txs: s.txs.map((tx) => (tx.id === id ? { ...tx, ...patch } : tx)) }))
}

export function getDemo() {
  return state
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Current demo state, or null until it has loaded on the client. */
export function useDemo(): DemoState | null {
  return useSyncExternalStore(subscribe, () => state, () => null)
}

export function useStorageOk(): boolean {
  return useSyncExternalStore(subscribe, () => storageOk, () => true)
}

/* ---------------------------------------------------------------------------
 * Simulated wallet prompt: a promise resolved by the WalletPrompt dialog.
 * ------------------------------------------------------------------------ */

export interface PromptRequest {
  summary: TxSummary
  resolve: (approved: boolean) => void
}

let prompt: PromptRequest | null = null
const promptListeners = new Set<() => void>()

export function requestSignature(summary: TxSummary): Promise<boolean> {
  return new Promise((resolve) => {
    prompt?.resolve(false)
    prompt = {
      summary,
      resolve: (ok) => {
        prompt = null
        for (const l of promptListeners) l()
        resolve(ok)
      },
    }
    for (const l of promptListeners) l()
  })
}

export function usePrompt(): PromptRequest | null {
  return useSyncExternalStore(
    (l) => {
      promptListeners.add(l)
      return () => promptListeners.delete(l)
    },
    () => prompt,
    () => null
  )
}
