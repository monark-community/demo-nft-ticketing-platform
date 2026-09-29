import { ArrowRightIcon, PlusIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { HeroTicket } from "@/components/home/hero-ticket"
import { RailDemo } from "@/components/home/rail-demo"
import { Container, Eyebrow } from "@/components/site/section"
import { Stamp } from "@/components/ticket/stamp"
import { Ticket } from "@/components/ticket/ticket"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { money, percent } from "@/lib/format"
import { pageMetadata } from "@/lib/metadata"

import crowd from "../../../public/images/crowd.jpg"
import marquee from "../../../public/images/marquee.jpg"

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/", d.home.metaTitle, d.meta.description)
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const d = getDictionary(locale)
  const h = d.home
  const tk = d.ticket
  const rules = {
    cap: t(tk.capValue, { pct: percent(110, locale) }),
    royalty: percent(5, locale),
    limit: t(tk.limitValue, { n: 4 }),
    souvenir: tk.souvenirYes,
  }

  return (
    <>
      {/* Hero */}
      <section className="border-b">
        <Container className="grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
          <div>
            <Eyebrow>{h.eyebrow}</Eyebrow>
            <h1 className="mt-5 font-display text-[3.1rem] leading-[0.9] font-extrabold tracking-tight text-balance uppercase sm:text-7xl lg:text-[5.4rem]">
              {h.title.split(/(?<=\.)\s+/).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{h.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link href={href(locale, "/app")}>
                  {h.ctaPrimary}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-input px-6 text-base">
                <Link href={href(locale, "/how-it-works")}>{h.ctaSecondary}</Link>
              </Button>
            </div>
          </div>
          <HeroTicket
            ticket={h.heroTicket}
            labels={{ ...tk, entryCode: tk.entryCode, codeRotates: tk.codeRotates, life: tk.life }}
            rules={rules}
            caption={h.heroCaption}
            steps={[
              { label: tk.stamps.minted, tone: "ink" },
              { label: tk.stamps.inWallet, tone: "ink" },
              { label: tk.stamps.resold, tone: "pending" },
              { label: tk.stamps.admitted, tone: "admitted" },
            ]}
          />
        </Container>
      </section>

      {/* What goes wrong today */}
      <section className="bg-stock-ink text-[#f2eadb] dark:border-b">
        <Container className="py-14 sm:py-20">
          <h2 className="max-w-2xl font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">{h.problem.title}</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            {h.problem.items.map((item, i) => (
              <li key={item.title} className="border-t-2 border-dashed border-[#f2eadb]/30 pt-5">
                <span className="font-display text-5xl font-extrabold text-stock tabular-nums">0{i + 1}</span>
                <p className="mt-3 text-lg leading-relaxed">
                  <strong className="font-semibold">{item.title}</strong> <span className="text-[#cfc4b1]">{item.body}</span>
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* One ticket, three people */}
      <section>
        <Container className="py-16 sm:py-24">
          <h2 className="max-w-3xl font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-6xl">{h.three.title}</h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {/* Fan */}
            <article className="paper flex min-w-0 flex-col rounded-lg border bg-card p-5 sm:p-6">
              <h3 className="font-display text-2xl font-extrabold uppercase">{h.three.fan.role}</h3>
              <p className="mt-2 text-muted-foreground">{h.three.fan.body}</p>
              <div className="mt-6 flex-1">
                <Ticket
                  compact
                  eventName="Marée Basse"
                  venue="Salle Bellechasse"
                  date={h.heroTicket.date}
                  doors={h.heroTicket.doors}
                  section={h.heroTicket.section}
                  seat="C·14"
                  serial="0388"
                  labels={tk}
                />
                <p className="mt-3 text-sm text-muted-foreground">{h.three.fan.vignette}</p>
              </div>
              <Link href={href(locale, "/app")} className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline">
                {h.three.fan.link}
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </article>
            {/* Organizer */}
            <article className="paper flex min-w-0 flex-col rounded-lg border bg-card p-5 sm:p-6">
              <h3 className="font-display text-2xl font-extrabold uppercase">{h.three.organizer.role}</h3>
              <p className="mt-2 text-muted-foreground">{h.three.organizer.body}</p>
              <div className="mt-6 flex flex-1 flex-col justify-center gap-3">
                {[2_31, 2_20, 2_10].map((amt, i) => (
                  <div
                    key={amt}
                    className="flex items-center justify-between gap-3 rounded-md border border-dashed bg-background px-4 py-3 font-mono text-sm"
                    style={{ opacity: 1 - i * 0.28 }}
                    aria-hidden={i > 0 ? true : undefined}
                  >
                    <span className="min-w-0">
                      <span className="block font-sans font-semibold">{h.three.organizer.vignetteLabel}</span>
                      <span className="block truncate font-sans text-xs text-muted-foreground">{h.three.organizer.vignetteDetail}</span>
                    </span>
                    <span className="shrink-0 font-bold text-success tabular-nums">
                      <PlusIcon className="mr-0.5 inline size-3" aria-hidden="true" />
                      {money(amt, locale)}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href={href(locale, "/app/organizer")}
                className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline"
              >
                {h.three.organizer.link}
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </article>
            {/* Door */}
            <article className="paper flex min-w-0 flex-col rounded-lg border bg-card p-5 sm:p-6">
              <h3 className="font-display text-2xl font-extrabold uppercase">{h.three.door.role}</h3>
              <p className="mt-2 text-muted-foreground">{h.three.door.body}</p>
              <div className="mt-6 grid flex-1 content-center gap-4">
                <div className="flex items-center justify-between gap-3 rounded-md bg-background px-4 py-4">
                  <span className="font-mono text-xs text-muted-foreground">NTP-0512-K7Q2MX</span>
                  <Stamp tone="admitted" rotate={-6}>
                    {h.three.door.admitted}
                  </Stamp>
                </div>
                <div className="rounded-md bg-background px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-muted-foreground">NTP-0694-3HWT8R</span>
                    <Stamp tone="void" rotate={5}>
                      {tk.stamps.void}
                    </Stamp>
                  </div>
                  <p className="mt-2 text-sm font-medium text-destructive">{h.three.door.refused}</p>
                </div>
              </div>
              <Link href={href(locale, "/app/door")} className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline">
                {h.three.door.link}
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </article>
          </div>
        </Container>
      </section>

      {/* Resale rail */}
      <section className="border-y bg-card">
        <Container className="grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>{h.rail.eyebrow}</Eyebrow>
            <h2 className="mt-4 font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-6xl">{h.rail.title}</h2>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">{h.rail.body}</p>
            <p className="mt-4 text-sm text-muted-foreground">{h.rail.note}</p>
          </div>
          <div className="rounded-lg border bg-background p-5 sm:p-7">
            <RailDemo locale={locale} labels={d.rail} />
          </div>
        </Container>
      </section>

      {/* Photo band */}
      <section>
        <Container className="grid items-center gap-8 py-16 sm:py-24 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg sm:aspect-[5/4] md:aspect-[4/5] lg:aspect-[5/4]">
            <Image src={crowd} alt={h.photo.alt} fill placeholder="blur" sizes="(min-width: 768px) 55vw, 100vw" className="object-cover object-[50%_30%]" />
          </div>
          <blockquote className="font-display text-4xl leading-[0.95] font-extrabold tracking-tight uppercase sm:text-6xl">
            <span aria-hidden="true" className="mb-4 block h-2 w-16 bg-stock" />
            {h.photo.line}
          </blockquote>
        </Container>
      </section>

      {/* For organizers */}
      <section className="border-t">
        <Container className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="relative order-last aspect-[4/5] overflow-hidden rounded-lg lg:order-first">
            <Image src={marquee} alt={h.organizers.alt} fill placeholder="blur" sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover object-[50%_40%]" />
          </div>
          <div className="flex flex-col justify-center">
            <Eyebrow>{h.organizers.eyebrow}</Eyebrow>
            <h2 className="mt-4 font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-6xl">{h.organizers.title}</h2>
            <p className="mt-5 text-lg text-muted-foreground">{h.organizers.body}</p>
            <dl className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {h.organizers.points.map((p) => (
                <div key={p.title} className="border-t-2 border-foreground pt-3 dark:border-primary">
                  <dt className="font-display text-xl font-extrabold uppercase">{p.title}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{p.body}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8">
              <Button asChild variant="outline" size="lg" className="h-12 border-input">
                <Link href={href(locale, "/app/organizer")}>
                  {h.organizers.cta}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t bg-card">
        <Container className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_1.6fr]">
          <h2 className="font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">{h.faq.title}</h2>
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

      {/* Closing */}
      <section className="bg-stock text-stock-ink">
        <Container className="flex flex-col items-start gap-6 py-16 sm:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="font-display text-4xl leading-[0.95] font-extrabold tracking-tight uppercase sm:text-6xl">{h.closing.title}</h2>
            <p className="mt-4 text-lg text-stock-ink-soft">{h.closing.body}</p>
          </div>
          <Link
            href={href(locale, "/app")}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-md bg-stock-ink px-6 text-base font-semibold text-[#fff8ea] hover:bg-stock-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stock-ink"
          >
            {h.closing.cta}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </Container>
      </section>
    </>
  )
}
