import type { PosterTone } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

export const TONES: Record<PosterTone, { bg: string; fg: string; accent: string }> = {
  ink: { bg: "#1c1814", fg: "#f2eadb", accent: "#f4c542" },
  stock: { bg: "#f4c542", fg: "#1c1814", accent: "#1c1814" },
  brick: { bg: "#8a3a2c", fg: "#fbefe0", accent: "#f4c542" },
  teal: { bg: "#264f49", fg: "#eef3ea", accent: "#f4c542" },
  cream: { bg: "#efe4cc", fg: "#1c1814", accent: "#8a3a2c" },
}

/** A typographic show poster: the event name set big, the date as a marquee number. Decorative (aria-hidden). */
export function Poster({
  name,
  kicker,
  day,
  month,
  tone,
  className,
}: {
  name: string
  kicker: string
  day: string
  month: string
  tone: PosterTone
  className?: string
}) {
  const c = TONES[tone]
  return (
    <div
      aria-hidden="true"
      className={cn("relative flex flex-col justify-between overflow-hidden p-4", className)}
      style={{ background: c.bg, color: c.fg }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="label-caps opacity-80">{kicker}</span>
        <span className="text-right font-display leading-none font-extrabold" style={{ color: c.accent }}>
          <span className="block text-4xl tabular-nums">{day}</span>
          <span className="block text-sm uppercase">{month}</span>
        </span>
      </div>
      <div className="flex gap-1 py-2" style={{ color: c.accent }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="size-1.5 rounded-full bg-current" style={{ opacity: i % 3 === 0 ? 1 : 0.45 }} />
        ))}
      </div>
      <p className="line-clamp-3 font-display text-[2rem] leading-[0.95] font-extrabold tracking-tight break-words uppercase">{name}</p>
    </div>
  )
}
