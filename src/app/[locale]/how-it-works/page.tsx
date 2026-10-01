import { ArrowRightIcon, CheckIcon, PlusIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Container } from "@/components/site/section"
import { Stamp } from "@/components/ticket/stamp"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).how
  return pageMetadata(locale, "/how-it-works", d.metaTitle, d.metaDescription)
}

const H2 = "font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl"

export default async function HowPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.how
  const tk = dict.ticket

  return (
    <>
      <section className="border-b">
        <Container className="py-14 sm:py-20">
          <h1 className="font-display text-6xl leading-[0.9] font-extrabold tracking-tight uppercase sm:text-8xl">{h.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{h.intro}</p>
        </Container>
      </section>

      {/* Life of a ticket */}
      <section>
        <Container className="py-14 sm:py-20">
          <h2 className={H2}>{h.life.title}</h2>
          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
            {h.life.steps.map((s, i) => (
              <li key={s.title} className="paper-drop">
                <div
                  className={cn(
                    "relative h-full bg-stock p-5 text-stock-ink",
                    "rounded-lg lg:rounded-none",
                    i === 0 && "lg:rounded-l-lg",
                    i === h.life.steps.length - 1 && "lg:rounded-r-lg",
                    i > 0 && "lg:border-l-2 lg:border-dashed lg:border-stock-line"
                  )}
                >
                  <span className="font-display text-5xl leading-none font-extrabold tabular-nums">0{i + 1}</span>
                  <h3 className="mt-3 font-display text-2xl font-extrabold uppercase">{s.title}</h3>
                  <p className="mt-2 text-sm text-stock-ink-soft">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Rules */}
      <section className="border-y bg-card">
        <Container className="py-14 sm:py-20">
          <h2 className={H2}>{h.rules.title}</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {h.rules.items.map((r) => (
              <article key={r.title} className="flex flex-col rounded-lg border bg-background p-5">
                <h3 className="font-display text-2xl font-extrabold uppercase">{r.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.body}</p>
                <p className="mt-4 border-t border-dashed pt-3 font-mono text-sm font-semibold">{r.example}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Rotating code */}
      <section>
        <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <h2 className={H2}>{h.code.title}</h2>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">{h.code.body}</p>
          </div>
          <div className="space-y-6">
            <figure>
              <figcaption className="label-caps mb-3 text-muted-foreground">{h.code.windowLabel}</figcaption>
              <div className="grid grid-cols-6 gap-1.5" role="img" aria-label={`${h.code.windowLabel}: ${h.code.now} ${h.code.accepted}, ${h.code.refused}`}>
                {[-5, -4, -3, -2, -1, 0].map((w) => {
                  const now = w === 0
                  return (
                    <div key={w} className="flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          "flex aspect-square w-full items-center justify-center rounded-md border-2",
                          now ? "border-success bg-success/10 text-success" : "border-dashed border-input text-muted-foreground"
                        )}
                      >
                        {now ? <CheckIcon className="size-6" aria-hidden="true" /> : <XIcon className="size-5" aria-hidden="true" />}
                      </div>
                      <span className={cn("font-mono text-[11px] tabular-nums", now ? "font-bold text-foreground" : "text-muted-foreground")}>
                        {now ? h.code.now : `${w * 20}s`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </figure>
            <ul className="grid gap-3 sm:grid-cols-2">
              {h.code.cases.map((c) => (
                <li key={c.title} className="flex items-start justify-between gap-3 rounded-md border bg-card p-4">
                  <div>
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.body}</p>
                  </div>
                  <Stamp size="sm" tone="void" rotate={-6}>
                    {tk.stamps.void}
                  </Stamp>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* On-chain vs off-chain */}
      <section className="border-y bg-card">
        <Container className="py-14 sm:py-20">
          <h2 className={H2}>{h.split.title}</h2>
          <div className="mt-8 overflow-x-auto rounded-lg border bg-background">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead>
                <tr className="border-b">
                  {h.split.headers.map((x, i) => (
                    <th key={i} scope="col" className="label-caps px-4 py-3 text-muted-foreground">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {h.split.rows.map((r) => (
                  <tr key={r[0]}>
                    <th scope="row" className="px-4 py-3 font-semibold">
                      {r[0]}
                    </th>
                    <td className="px-4 py-3">{r[1] || <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3">{r[2] || <span className="text-muted-foreground">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section>
        <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_1.8fr]">
          <h2 className={H2}>{h.faq.title}</h2>
          <div className="divide-y border-y">
            {h.faq.items.map((item) => (
              <details key={item.q} className="group py-1">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <PlusIcon className="size-5 shrink-0 transition-transform group-open:rotate-45" aria-hidden="true" />
                </summary>
                <p className="pb-5 leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-stock text-stock-ink">
        <Container className="flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-4xl leading-none font-extrabold uppercase sm:text-5xl">{h.cta.title}</h2>
            <p className="mt-3 text-lg text-stock-ink-soft">{h.cta.body}</p>
          </div>
          <Button asChild size="lg" className="h-12 bg-stock-ink px-6 text-base text-[#fff8ea] hover:bg-stock-ink/90 dark:bg-stock-ink dark:text-[#fff8ea]">
            <Link href={href(locale, "/app")}>
              {h.cta.button}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </Container>
      </section>
    </>
  )
}
