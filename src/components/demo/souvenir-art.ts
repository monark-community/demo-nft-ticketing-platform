import type { Souvenir } from "@/lib/demo/types"

import { TONES } from "./poster"

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** Souvenir artwork: a torn stub on the event's poster colour, as an SVG data URI for the nft-card image. */
export function souvenirArt(s: Souvenir, dateLabel: string): string {
  const c = TONES[s.tone]
  const name = esc(s.eventName.toUpperCase())
  const words = name.split(" ")
  const lines: string[] = []
  for (const w of words) {
    const last = lines[lines.length - 1]
    if (last && (last + " " + w).length <= 12) lines[lines.length - 1] = `${last} ${w}`
    else lines.push(w)
  }
  const text = lines
    .slice(0, 3)
    .map((l, i) => `<text x="28" y="${150 + i * 44}" font-size="44" font-weight="800">${l}</text>`)
    .join("")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
<rect width="320" height="320" fill="${c.bg}"/>
<g fill="${c.accent}">${Array.from({ length: 14 }, (_, i) => `<circle cx="${34 + i * 18}" cy="40" r="3" opacity="${i % 3 === 0 ? 1 : 0.45}"/>`).join("")}</g>
<g font-family="'Arial Narrow','Roboto Condensed',Arial,sans-serif" fill="${c.fg}">
<text x="28" y="84" font-size="15" font-weight="700" letter-spacing="2" opacity="0.8">SOUVENIR · Nº ${esc(s.serial)}</text>
${text}
<text x="28" y="292" font-size="16" font-weight="700" opacity="0.85">${esc(s.venue)} · ${esc(dateLabel)}</text>
</g>
<path d="M0 262 l12 -6 l12 6 l12 -6 l12 6 l12 -6 l12 6 l12 -6 l12 6 l12 -6 l12 6 l12 -6 l12 6 l12 -6 l12 6 l12 -6 l12 6 l12 -6 l12 6 l12 -6 l12 6 l12 -6 l12 6 l12 -6 l12 6 l12 -6 l12 6 l8 -4" fill="none" stroke="${c.fg}" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.5"/>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
