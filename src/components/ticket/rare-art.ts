import type { RareArt } from "@/lib/demo/types"

/** Ink colours for a foil ticket: they replace the yellow stock's ink so the type sits on the art. */
export interface RareInk {
  stock: string
  ink: string
  inkSoft: string
  line: string
}

/** Small deterministic PRNG so the star fields are the same on server and client. */
function rand(seed: number) {
  let x = seed
  return () => {
    x = (x * 1664525 + 1013904223) % 4294967296
    return x / 4294967296
  }
}

function stars(seed: number, n: number, fill: string) {
  const r = rand(seed)
  return Array.from({ length: n }, () => {
    const cx = Math.round(r() * 600)
    const cy = Math.round(r() * 300)
    const rad = (0.6 + r() * 1.6).toFixed(1)
    return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}" opacity="${(0.35 + r() * 0.6).toFixed(2)}"/>`
  }).join("")
}

const svg = (body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice">${body}</svg>`
  )}`

/** Retro sunset: a striped sun sinking behind the venue's skyline. */
function afterglow() {
  const bands = [196, 214, 230, 244, 256, 266]
    .map((y, i) => `<rect x="330" y="${y}" width="300" height="${3 + i * 1.6}" fill="url(#sky)"/>`)
    .join("")
  const rays = Array.from({ length: 18 }, (_, i) => {
    const a = (Math.PI * (i + 0.5)) / 18
    const x = 470 - Math.cos(a) * 600
    const y = 250 - Math.sin(a) * 600
    return `<line x1="470" y1="250" x2="${x.toFixed(0)}" y2="${y.toFixed(0)}" stroke="#ffd27a" stroke-width="${i % 2 ? 1 : 2}" opacity="0.12"/>`
  }).join("")
  return svg(`<defs>
<linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="300"><stop offset="0" stop-color="#1b0b3a"/><stop offset="0.55" stop-color="#5b1a5e"/><stop offset="1" stop-color="#b8432f"/></linearGradient>
<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#f2694a"/></linearGradient>
</defs>
<rect width="600" height="300" fill="url(#sky)"/>
${stars(7, 46, "#fff3d6")}
${rays}
<circle cx="470" cy="250" r="118" fill="url(#sun)"/>
${bands}
<path d="M0 300 V262 h40 v-18 h26 v26 h30 v-40 h22 v40 h34 v-22 h28 v30 h40 v-50 h18 v50 h36 v-28 h30 v36 h44 v-20 h30 v24 h46 v-34 h20 v34 h40 v-16 h56 v300 z" fill="#14081f" opacity="0.92"/>`)
}

/** House lights: rows of marquee bulbs and two spotlights crossing the stage. */
function marquee() {
  const bulbs: string[] = []
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 26; col++) {
      const lit = (row * 7 + col * 3) % 5 !== 0
      const x = 12 + col * 23 + (row % 2) * 11
      const y = 18 + row * 52
      bulbs.push(
        `<circle cx="${x}" cy="${y}" r="9" fill="url(#glow)" opacity="${lit ? 0.55 : 0.12}"/><circle cx="${x}" cy="${y}" r="2.6" fill="${lit ? "#ffe9a8" : "#5c4a2a"}"/>`
      )
    }
  }
  return svg(`<defs>
<radialGradient id="glow"><stop offset="0" stop-color="#ffd25e"/><stop offset="1" stop-color="#ffd25e" stop-opacity="0"/></radialGradient>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#120c06"/><stop offset="1" stop-color="#3a1408"/></linearGradient>
<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d8" stop-opacity="0.32"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></linearGradient>
</defs>
<rect width="600" height="300" fill="url(#bg)"/>
${bulbs.join("")}
<polygon points="40,0 90,0 420,300 250,300" fill="url(#beam)"/>
<polygon points="560,0 600,0 600,40 380,300 230,300" fill="url(#beam)" opacity="0.7"/>`)
}

/** Northern lights over the river: ribbons of teal and violet. */
function aurora() {
  const ribbon = (d: string, color: string, op: number, w: number) =>
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${op}" filter="url(#blur)"/>`
  return svg(`<defs>
<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#041824"/><stop offset="1" stop-color="#0b3a3f"/></linearGradient>
<filter id="blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
</defs>
<rect width="600" height="300" fill="url(#night)"/>
${stars(31, 60, "#e8fff6")}
${ribbon("M-20 150 C 100 60, 220 210, 340 110 S 560 40, 640 120", "#3ee6b0", 0.75, 34)}
${ribbon("M-20 190 C 120 120, 260 240, 380 160 S 560 110, 640 170", "#7c5cff", 0.55, 28)}
${ribbon("M-20 100 C 140 40, 240 140, 380 70 S 540 20, 640 60", "#9bffd9", 0.45, 18)}
<path d="M0 300 V258 C 90 246, 160 266, 250 254 S 430 244, 600 258 V300 z" fill="#03121a"/>
<path d="M0 274 C 120 266, 240 282, 360 272 S 520 266, 600 274" fill="none" stroke="#3ee6b0" stroke-width="1.5" opacity="0.35"/>`)
}

/** Side B: a record spinning out of its sleeve, grooves catching the light. */
function vinyl() {
  const grooves = Array.from({ length: 22 }, (_, i) => {
    const r = 60 + i * 6
    return `<circle cx="470" cy="150" r="${r}" fill="none" stroke="#ffffff" stroke-width="${i % 4 === 0 ? 1.2 : 0.6}" opacity="${i % 4 === 0 ? 0.14 : 0.07}"/>`
  }).join("")
  return svg(`<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a0a24"/><stop offset="1" stop-color="#3d0f3a"/></linearGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0.35" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.16"/><stop offset="0.65" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<rect width="600" height="300" fill="url(#bg)"/>
<rect x="250" y="-20" width="190" height="340" fill="#e0457b" opacity="0.22" transform="rotate(-8 345 150)"/>
<circle cx="470" cy="150" r="200" fill="#0b0610"/>
${grooves}
<circle cx="470" cy="150" r="200" fill="url(#sheen)"/>
<circle cx="470" cy="150" r="52" fill="#e0457b"/>
<circle cx="470" cy="150" r="36" fill="none" stroke="#ffd6e4" stroke-width="1" opacity="0.6"/>
<circle cx="470" cy="150" r="5" fill="#0b0610"/>`)
}

/** Last song: confetti cannons over the crowd. */
function confetti() {
  const r = rand(53)
  const colors = ["#f4c542", "#ff6b8b", "#4fd1c5", "#ffffff", "#9b7bff"]
  const bits = Array.from({ length: 90 }, () => {
    const x = Math.round(r() * 600)
    const y = Math.round(r() * 300)
    const w = (3 + r() * 6).toFixed(1)
    const h = (6 + r() * 10).toFixed(1)
    const c = colors[Math.floor(r() * colors.length)]
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="${c}" opacity="${(0.55 + r() * 0.45).toFixed(2)}" transform="rotate(${Math.round(r() * 180)} ${x} ${y})"/>`
  }).join("")
  const streamer = (d: string, c: string) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity="0.7"/>`
  return svg(`<defs>
<radialGradient id="burst" cx="0.8" cy="0.1" r="0.9"><stop offset="0" stop-color="#3b2f8f"/><stop offset="1" stop-color="#0c1238"/></radialGradient>
</defs>
<rect width="600" height="300" fill="url(#burst)"/>
${streamer("M330 -10 C 360 60, 300 110, 350 170 S 330 270, 380 320", "#f4c542")}
${streamer("M520 -10 C 480 70, 560 120, 500 190 S 540 260, 510 320", "#ff6b8b")}
${streamer("M610 60 C 540 90, 600 160, 520 210", "#4fd1c5")}
${bits}`)
}

/** Night drive: a neon sun over a synthwave grid. */
function neon() {
  const vlines = Array.from({ length: 21 }, (_, i) => {
    const x = -300 + i * 60
    return `<line x1="300" y1="190" x2="${x + 300}" y2="320" stroke="#ff2fd1" stroke-width="1.2" opacity="0.55"/>`
  }).join("")
  const hlines = [196, 204, 216, 232, 254, 282].map((y) => `<line x1="0" y1="${y}" x2="600" y2="${y}" stroke="#ff2fd1" stroke-width="1.2" opacity="0.55"/>`).join("")
  return svg(`<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0221"/><stop offset="0.63" stop-color="#3a0a5e"/><stop offset="0.63" stop-color="#14001f"/><stop offset="1" stop-color="#14001f"/></linearGradient>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>
<rect width="600" height="300" fill="url(#sky)"/>
${stars(71, 40, "#ffe8ff")}
<circle cx="440" cy="150" r="70" fill="none" stroke="#3cf2ff" stroke-width="6" filter="url(#glow)"/>
<circle cx="440" cy="150" r="70" fill="none" stroke="#c8fbff" stroke-width="2"/>
<polygon points="440,96 488,176 392,176" fill="none" stroke="#ff2fd1" stroke-width="6" filter="url(#glow)"/>
<polygon points="440,96 488,176 392,176" fill="none" stroke="#ffd0f4" stroke-width="2"/>
<rect x="0" y="186" width="600" height="6" fill="#ff2fd1" filter="url(#glow)"/>
${vlines}${hlines}`)
}

const ARTS: Record<RareArt, { image: () => string; ink: RareInk }> = {
  afterglow: { image: afterglow, ink: { stock: "#3a1240", ink: "#fff4e0", inkSoft: "#f5c9a6", line: "#f5c9a6" } },
  marquee: { image: marquee, ink: { stock: "#1d1208", ink: "#fff1cc", inkSoft: "#e8c46a", line: "#e8c46a" } },
  aurora: { image: aurora, ink: { stock: "#06222c", ink: "#eafff6", inkSoft: "#9fe3cc", line: "#9fe3cc" } },
  vinyl: { image: vinyl, ink: { stock: "#1c0b22", ink: "#fff0f5", inkSoft: "#f2a3c0", line: "#f2a3c0" } },
  confetti: { image: confetti, ink: { stock: "#0f1645", ink: "#ffffff", inkSoft: "#ffd98a", line: "#ffd98a" } },
  neon: { image: neon, ink: { stock: "#12021f", ink: "#fdf0ff", inkSoft: "#7ff6ff", line: "#ff8be6" } },
}

const cache = new Map<RareArt, string>()

/** The art (an SVG data URI) and ink for a foil ticket. */
export function rareArt(art: RareArt): { image: string; ink: RareInk } {
  const a = ARTS[art] ?? ARTS.afterglow
  let image = cache.get(art)
  if (!image) {
    image = a.image()
    cache.set(art, image)
  }
  return { image, ink: a.ink }
}
