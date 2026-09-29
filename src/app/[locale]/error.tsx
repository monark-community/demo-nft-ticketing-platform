"use client"

import { useParams } from "next/navigation"

import { Container } from "@/components/site/section"
import { Button } from "@/components/ui/button"
import { boundaries } from "@/i18n/dictionaries/boundaries"

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ locale?: string }>()
  const d = boundaries[params?.locale === "fr" ? "fr" : "en"].error
  return (
    <Container className="flex flex-1 flex-col items-center justify-center py-24 text-center">
      <h1 className="max-w-xl font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">{d.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{d.body}</p>
      <Button size="lg" className="mt-8 h-12" onClick={() => reset()}>
        {d.retry}
      </Button>
    </Container>
  )
}
