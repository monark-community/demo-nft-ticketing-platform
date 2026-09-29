import { cn } from "@/lib/utils"

export type StampTone = "admitted" | "void" | "ink" | "pending"

/** Theme-aware colours, for stamps on page surfaces. */
const themeTones: Record<StampTone, string> = {
  admitted: "text-success",
  void: "text-destructive",
  ink: "text-foreground",
  pending: "text-warning",
}

/** Fixed dark inks for stamps printed on the yellow ticket stock (same in both themes). */
const stockTones: Record<StampTone, string> = {
  admitted: "text-[#17573a]",
  void: "text-[#a1201a]",
  ink: "text-stock-ink",
  pending: "text-[#6b4000]",
}

/** A rubber stamp: double-ruled, condensed caps, slightly rotated. Always carries its text. */
export function Stamp({
  children,
  tone = "ink",
  surface = "theme",
  animate = false,
  rotate = -8,
  size = "md",
  className,
}: {
  children: React.ReactNode
  tone?: StampTone
  surface?: "theme" | "stock"
  animate?: boolean
  rotate?: number
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  return (
    <span
      style={{ "--stamp-rot": `${rotate}deg`, transform: `rotate(${rotate}deg)` } as React.CSSProperties}
      className={cn(
        "inline-flex items-center justify-center rounded-[3px] border-current bg-transparent font-display leading-none font-extrabold tracking-wider whitespace-nowrap uppercase outline-current",
        size === "sm" && "border-2 px-1.5 py-0.5 text-sm",
        size === "md" && "border-[3px] px-2.5 py-1 text-xl outline-1 outline-offset-2",
        size === "lg" && "border-4 px-4 py-1.5 text-4xl outline-2 outline-offset-3 sm:text-5xl",
        (surface === "stock" ? stockTones : themeTones)[tone],
        animate && "animate-stamp",
        className
      )}
    >
      {children}
    </span>
  )
}
