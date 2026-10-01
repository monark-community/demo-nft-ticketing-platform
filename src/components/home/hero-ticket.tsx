"use client"

import { useEffect, useState } from "react"

import { EntryCode } from "@/components/ticket/entry-code"
import { Ticket, type TicketLabels, type TicketRuleValues } from "@/components/ticket/ticket"
import type { StampTone } from "@/components/ticket/stamp"
import { cn } from "@/lib/utils"

const HERO_SIGNER = "0x4B2f9c3E71A0d58B6e2F1c9D04a7E3b85C61d9F2" as const

interface Props {
  ticket: {
    event: string
    tagline: string
    venue: string
    section: string
    seat: string
    date: string
    doors: string
  }
  labels: TicketLabels & { entryCode: string; codeRotates: string; life: string }
  rules: TicketRuleValues
  steps: { label: string; tone: StampTone }[]
  caption?: string
}

/** The hero's live ticket: the entry code rotates, and the ticket walks through its life every few seconds. */
export function HeroTicket({ ticket, labels, rules, steps, caption }: Props) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return
    const id = window.setInterval(() => setStep((s) => (s + 1) % steps.length), 2600)
    return () => window.clearInterval(id)
  }, [steps.length])

  const current = steps[step]
  const last = step === steps.length - 1

  return (
    <figure className="w-full">
      <div className="relative">
        <Ticket
          eventName={ticket.event}
          tagline={ticket.tagline}
          venue={ticket.venue}
          date={ticket.date}
          doors={ticket.doors}
          section={ticket.section}
          seat={ticket.seat}
          serial="0388"
          labels={labels}
          rules={rules}
          headingLevel="p"
          stamp={current ? { label: current.label, tone: current.tone, animate: true } : undefined}
          tearing={last}
          stub={<EntryCode ticket={{ id: "t-0388", serial: "0388" }} signer={HERO_SIGNER} labels={labels} size="sm" />}
        />
      </div>
      <figcaption className="mt-5 space-y-3">
        <p className="label-caps text-muted-foreground">{labels.life}</p>
        <ol className="grid grid-cols-4 gap-1.5">
          {steps.map((s, i) => (
            <li key={s.label}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={i === step ? "step" : undefined}
                className={cn(
                  "w-full border-t-[3px] pt-1.5 text-left text-xs leading-tight font-semibold transition-colors pointer-coarse:min-h-11",
                  i === step ? "border-foreground text-foreground dark:border-primary" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ol>
        {caption && <p className="text-sm text-muted-foreground">{caption}</p>}
      </figcaption>
    </figure>
  )
}
