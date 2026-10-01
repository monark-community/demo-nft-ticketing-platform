import { cn } from "@/lib/utils"

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("label-caps inline-flex items-center gap-2 text-muted-foreground", className)}>
      <span aria-hidden="true" className="h-[3px] w-5 bg-foreground dark:bg-primary" />
      {children}
    </p>
  )
}

/** A dashed perforation rule between sections. */
export function Perforation({ className }: { className?: string }) {
  return <hr aria-hidden="true" className={cn("border-0 border-t-2 border-dashed border-border", className)} />
}
