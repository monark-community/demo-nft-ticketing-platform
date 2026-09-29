import type { Address } from "./types"

/**
 * Ids and hashes for the simulated chain. Math.random on purpose: crypto.randomUUID
 * throws on plain-http LAN origins (phones testing the dev server).
 */

const HEX = "0123456789abcdef"

export function randomHex(length: number): string {
  let out = ""
  for (let i = 0; i < length; i++) out += HEX[Math.floor(Math.random() * 16)]
  return out
}

export function txHash(): `0x${string}` {
  return `0x${randomHex(64)}`
}

export function randomAddress(): Address {
  // Mixed case, like a checksummed address.
  const raw = randomHex(40)
  let out = ""
  for (const ch of raw) out += /[a-f]/.test(ch) && Math.random() > 0.5 ? ch.toUpperCase() : ch
  return `0x${out}`
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${randomHex(6)}`
}

/** Small deterministic string hash (FNV-1a, 32-bit) used for signatures and code drawings. */
export function fnv1a(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Seeded pseudo-random generator (mulberry32) for stable drawings. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
