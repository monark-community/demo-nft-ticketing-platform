import { cn } from "@/lib/utils"

/** The ticket path shared by the mark, the favicon and the OG image: two punched notches at x = 21. */
export const TICKET_PATH =
  "M4 4H18.5A2.5 2.5 0 0 0 23.5 4H28a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H23.5A2.5 2.5 0 0 0 18.5 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"

/** NFTokenPass mark: a ticket with its perforation, the stub holding the token. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 24"
      className={cn("h-6 w-8 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={TICKET_PATH} fill="var(--color-stock)" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M21 8.2V15.8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1.6 1.6" />
      <rect x="23.6" y="9.6" width="4.8" height="4.8" rx="0.6" fill="currentColor" />
      <path d="M6 9.5H15M6 12.5H13M6 15.5H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-foreground", className)}>
      <LogoMark />
      <span className="font-display text-[1.45rem] leading-none font-extrabold tracking-tight uppercase">
        NFToken<span className="text-muted-foreground dark:text-primary">Pass</span>
      </span>
    </span>
  )
}
