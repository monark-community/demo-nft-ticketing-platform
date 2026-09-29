"use client"

import { useState } from "react"

import { ResaleRail, type RailLabels } from "@/components/ticket/resale-rail"
import type { Locale } from "@/i18n/config"

/** Home-page version of the resale rail on a sample floor ticket. */
export function RailDemo({ locale, labels }: { locale: Locale; labels: RailLabels }) {
  const [price, setPrice] = useState(44_00)
  return <ResaleRail face={42_00} capPct={110} royaltyPct={5} value={price} onChange={setPrice} locale={locale} labels={labels} />
}
