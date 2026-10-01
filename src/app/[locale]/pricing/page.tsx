import { CheckIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Container } from "@/components/site/section"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { cn } from "@/lib/utils"

/** Internal strategy review only: never linked, not in the sitemap, not indexed. */
export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return { title: getDictionary(locale).pricing.metaTitle, robots: { index: false, follow: false } }
}

export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const p = getDictionary(locale).pricing
  return (
    <Container className="py-14 sm:py-20">
      <p className="label-caps inline-flex rounded-sm border border-dashed border-input px-2 py-1 text-muted-foreground">{p.eyebrow}</p>
      <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.92] font-extrabold tracking-tight uppercase sm:text-7xl">{p.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{p.intro}</p>

      <ul className="mt-12 grid gap-5 lg:grid-cols-3">
        {p.plans.map((plan) => {
          const featured = "featured" in plan && plan.featured
          return (
            <li
              key={plan.name}
              className={cn("paper-edge flex flex-col rounded-lg border p-6", featured ? "border-stock-ink bg-stock text-stock-ink" : "bg-card")}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-extrabold uppercase">{plan.name}</h2>
                {featured && <span className="label-caps rounded-sm bg-stock-ink px-2 py-1 text-[#fff8ea]">{p.featured}</span>}
              </div>
              <p className="mt-4 font-display text-5xl leading-none font-extrabold">{plan.price}</p>
              <p className={cn("mt-1 min-h-5 text-sm", featured ? "text-stock-ink-soft" : "text-muted-foreground")}>{plan.unit}</p>
              <p className="mt-4 text-sm font-medium">{plan.for}</p>
              <ul className="mt-5 space-y-2 border-t border-dashed border-current/30 pt-4 text-sm">
                {plan.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {pt}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>

      <section className="mt-14 max-w-3xl">
        <h2 className="font-display text-3xl font-extrabold uppercase">{p.whyTitle}</h2>
        <ul className="mt-4 space-y-3">
          {p.why.map((w) => (
            <li key={w} className="flex gap-3 text-muted-foreground">
              <span aria-hidden="true" className="mt-2.5 h-[3px] w-4 shrink-0 bg-foreground dark:bg-primary" />
              {w}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted-foreground">{p.note}</p>
      </section>
    </Container>
  )
}
