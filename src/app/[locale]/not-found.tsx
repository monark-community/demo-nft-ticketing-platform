"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

import { Container } from "@/components/site/section"
import { Stamp } from "@/components/ticket/stamp"
import { Button } from "@/components/ui/button"
import { boundaries } from "@/i18n/dictionaries/boundaries"
import { href, isLocale } from "@/i18n/config"

/** A void stub. Client component so it can read the locale segment. */
export default function NotFound() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale && isLocale(params.locale) ? params.locale : "en"
  const d = boundaries[locale].notFound

  return (
    <Container className="flex flex-1 flex-col items-center justify-center py-20 text-center">
      <title>{`${d.metaTitle} · NFTokenPass`}</title>
      <div className="paper-drop">
        <div className="relative w-72 rounded-lg bg-stock px-6 pt-8 pb-10 text-stock-ink notch-b">
          <p className="label-caps">NFTokenPass</p>
          <p className="mt-2 font-display text-7xl leading-none font-extrabold tabular-nums">404</p>
          <div className="mt-4 flex justify-center">
            <Stamp tone="void" size="lg" surface="stock" animate rotate={-10}>
              {d.stamp}
            </Stamp>
          </div>
        </div>
      </div>
      <h1 className="mt-10 max-w-xl font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">{d.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{d.body}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="h-12">
          <Link href={href(locale, "/")}>{d.home}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12 border-input">
          <Link href={href(locale, "/app")}>{d.app}</Link>
        </Button>
      </div>
    </Container>
  )
}
