import Image from "next/image"
import { notFound } from "next/navigation"

import { Container } from "@/components/site/section"
import { isLocale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).credits
  return pageMetadata(locale, "/credits", d.metaTitle, d.metaDescription)
}

export default async function CreditsPage({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const c = dict.credits
  return (
    <Container className="py-14 sm:py-20">
      <h1 className="font-display text-6xl leading-none font-extrabold tracking-tight uppercase sm:text-7xl">{c.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{c.intro}</p>

      <h2 className="mt-12 font-display text-3xl font-extrabold uppercase">{c.photosTitle}</h2>
      <ul className="mt-5 grid gap-6 sm:grid-cols-2">
        {PHOTOS.map((p) => (
          <li key={p.key} className="flex gap-4 rounded-lg border bg-card p-4">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-md">
              <Image src={p.file} alt={c.photos[p.key].alt} fill sizes="96px" className="object-cover" />
            </div>
            <div className="min-w-0 text-sm">
              <p className="font-semibold">
                <a href={p.page} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:no-underline">
                  {t(c.by, { name: p.photographer })}
                  <span className="sr-only"> {dict.common.externalNew}</span>
                </a>
              </p>
              <p className="mt-1">
                <a href={p.profile} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline underline-offset-4 hover:no-underline">
                  {p.profile.replace("https://", "")}
                  <span className="sr-only"> {dict.common.externalNew}</span>
                </a>
              </p>
              <p className="mt-2 text-muted-foreground">
                {c.usedOn}: {c.photos[p.key].usedOn} ·{" "}
                <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  {c.license}
                  <span className="sr-only"> {dict.common.externalNew}</span>
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-display text-3xl font-extrabold uppercase">{c.typeTitle}</h2>
      <p className="mt-3 text-muted-foreground">{c.type}</p>
    </Container>
  )
}
