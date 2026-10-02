"use client"

import { ArrowRightIcon, PlusIcon, SparklesIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { rareArt } from "@/components/ticket/rare-art"
import { Ticket } from "@/components/ticket/ticket"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { deployEvent, type EventDraft } from "@/lib/demo/ops"
import { NETWORK_FEE } from "@/lib/demo/seed"
import { useDemo } from "@/lib/demo/store"
import type { Category, PosterTone, RarePerk } from "@/lib/demo/types"
import { clock, eventDate, money, percent } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useApp } from "./app-context"
import { errorText, FlowFeedback, livePending, useConnect, type FlowState } from "./feedback"
import { TONES } from "./poster"

const CATEGORIES: Category[] = ["music", "sports", "conference", "comedy", "film", "theatre"]
const TONE_KEYS: PosterTone[] = ["ink", "stock", "brick", "teal", "cream"]

function inDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

interface TierRow {
  key: number
  name: string
  price: string
  supply: string
}

type Errors = Partial<Record<"name" | "venue" | "city" | "date" | "tiers" | "foil", string>>

const PERKS: RarePerk[] = ["earlyEntry", "merch", "soundcheck", "lounge", "poster", "afterparty"]

export function CreateEvent({ onClose }: { onClose: () => void }) {
  const copy = useApp()
  const { d, locale, tk, categories } = copy
  const f = d.organizer.form
  const state = useDemo()
  const connect = useConnect()
  const [name, setName] = useState("")
  const [tagline, setTagline] = useState("")
  const [venue, setVenue] = useState("Salle Bellechasse")
  const [city, setCity] = useState("Montréal")
  const [category, setCategory] = useState<Category>("music")
  const [date, setDate] = useState(() => inDays(21))
  const [time, setTime] = useState("20:00")
  const [tone, setTone] = useState<PosterTone>("brick")
  const [tiers, setTiers] = useState<TierRow[]>([{ key: 1, name: f.defaultTier, price: "35", supply: "400" }])
  const [cap, setCap] = useState(110)
  const [royalty, setRoyalty] = useState(5)
  const [limit, setLimit] = useState(4)
  const [souvenir, setSouvenir] = useState(true)
  const [foilOn, setFoilOn] = useState(true)
  const [foilSize, setFoilSize] = useState(50)
  const [foilOdds, setFoilOdds] = useState(100)
  const [foilBonus, setFoilBonus] = useState(25)
  const [foilPerks, setFoilPerks] = useState<RarePerk[]>(["earlyEntry", "merch"])
  const [previewFoil, setPreviewFoil] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [flow, setFlow] = useState<FlowState>({ phase: "idle" })
  const [createdId, setCreatedId] = useState<string | null>(null)
  const busy = flow.phase === "pending"

  function validate(): Errors {
    const e: Errors = {}
    if (!name.trim()) e.name = f.errors.name
    if (!venue.trim()) e.venue = f.errors.venue
    if (!city.trim()) e.city = f.errors.city
    const when = new Date(`${date}T${time || "00:00"}:00`).getTime()
    if (!date || Number.isNaN(when) || when < Date.now()) e.date = f.errors.date
    for (const r of tiers) {
      const p = Number(r.price.replace(",", "."))
      const s = Number(r.supply)
      if (!r.name.trim()) e.tiers = f.errors.tierName
      else if (!Number.isFinite(p) || p < 0 || p > 10_000) e.tiers = f.errors.tierPrice
      else if (!Number.isInteger(s) || s < 1 || s > 50_000) e.tiers = f.errors.tierSupply
    }
    if (foilOn && foilPerks.length === 0) e.foil = f.foilPerksNone
    return e
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      setFlow({ phase: "error", message: f.errors.summary })
      const first = document.querySelector<HTMLElement>("[aria-invalid='true']")
      first?.focus()
      return
    }
    if (state?.wallet.status !== "connected") {
      const ok = await connect()
      if (!ok) return
    }
    const draft: EventDraft = {
      name,
      tagline,
      venue,
      city,
      category,
      date,
      time,
      tone,
      tiers: tiers.map((r) => ({ name: r.name, price: Math.round(Number(r.price.replace(",", ".")) * 100), supply: Number(r.supply) })),
      rules: { resaleCapPct: cap, royaltyPct: royalty, perWalletLimit: limit, souvenir },
      rare: { enabled: foilOn, edition: foilSize, oddsPct: foilOdds, capBonus: foilBonus, perks: foilPerks },
    }
    setFlow({ phase: "pending" })
    const res = await deployEvent(draft, {
      kind: "deploy",
      title: f.promptDeploy,
      movesValue: true,
      lines: [
        { label: f.name, value: name },
        { label: f.promptTiers, value: String(tiers.length) },
        {
          label: f.promptRules,
          value: `${tk.cap} ${percent(cap, locale)} · ${tk.royalty} ${percent(royalty, locale)} · ${t(tk.limitValue, { n: limit })}`,
        },
        {
          label: f.promptFoil,
          value: foilOn ? t(f.promptFoilValue, { n: foilSize, odds: percent(foilOdds, locale), bonus: foilBonus }) : tk.foilNone,
        },
        { label: d.prompt.fee, value: money(NETWORK_FEE, locale), strong: true },
      ],
    })
    if (res.ok) {
      const message = t(f.deployed, { event: name })
      setCreatedId(res.ids?.[0] ?? null)
      setFlow({ phase: "done", tx: res.result?.tx, message })
      toast.success(message)
    } else setFlow({ phase: "error", tx: res.result?.tx, message: errorText(copy, res.error) })
  }

  const previewTime = new Date(`${date}T${time || "20:00"}:00`).getTime()
  const firstTier = tiers[0]
  const input = "h-11 border-input bg-background"

  return (
    <section aria-labelledby="create-h" className="rounded-lg border bg-card">
      <div className="border-b px-5 py-4 sm:px-6">
        <h2 id="create-h" className="font-display text-3xl font-extrabold uppercase">
          {f.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{f.intro}</p>
      </div>
      <form noValidate onSubmit={submit} className="grid gap-8 p-5 sm:p-6 xl:grid-cols-[1fr_24rem]">
        <div className="min-w-0 space-y-8">
          <fieldset className="space-y-4" disabled={busy || !!createdId}>
            <legend className="label-caps mb-3 text-muted-foreground">{f.details}</legend>
            <Field id="ev-name" label={f.name} error={errors.name}>
              <Input id="ev-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={f.namePlaceholder} maxLength={60} aria-invalid={!!errors.name} aria-describedby={errors.name ? "ev-name-err" : undefined} className={input} />
            </Field>
            <Field id="ev-tag" label={f.tagline}>
              <Input id="ev-tag" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder={f.taglinePlaceholder} maxLength={90} className={input} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="ev-venue" label={f.venue} error={errors.venue}>
                <Input id="ev-venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder={f.venuePlaceholder} aria-invalid={!!errors.venue} aria-describedby={errors.venue ? "ev-venue-err" : undefined} className={input} />
              </Field>
              <Field id="ev-city" label={f.city} error={errors.city}>
                <Input id="ev-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder={f.cityPlaceholder} aria-invalid={!!errors.city} aria-describedby={errors.city ? "ev-city-err" : undefined} className={input} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="ev-cat" label={f.category}>
                <select id="ev-cat" value={category} onChange={(e) => setCategory(e.target.value as Category)} className={cn(input, "w-full rounded-md border px-3 text-sm")}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {categories[c]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="ev-date" label={f.date} error={errors.date}>
                <Input id="ev-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={!!errors.date} aria-describedby={errors.date ? "ev-date-err" : undefined} className={input} />
              </Field>
              <Field id="ev-time" label={f.time}>
                <Input id="ev-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className={input} />
              </Field>
            </div>
            <div role="radiogroup" aria-label={f.tone} className="space-y-2">
              <p className="text-sm font-medium">{f.tone}</p>
              <div className="flex flex-wrap gap-2">
                {TONE_KEYS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={tone === k}
                    onClick={() => setTone(k)}
                    className={cn(
                      "flex h-11 items-center gap-2 rounded-md border px-3 text-sm font-medium",
                      tone === k ? "border-foreground dark:border-primary" : "border-input text-muted-foreground"
                    )}
                  >
                    <span aria-hidden="true" className="size-4 rounded-sm border border-input" style={{ background: TONES[k].bg }} />
                    {f.tones[k]}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3" disabled={busy || !!createdId}>
            <legend className="label-caps mb-3 text-muted-foreground">{f.tiers}</legend>
            {tiers.map((r, i) => (
              <div key={r.key} className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-dashed p-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
                <Field id={`tier-name-${r.key}`} label={f.tierName} className="col-span-2 sm:col-span-1">
                  <Input id={`tier-name-${r.key}`} value={r.name} onChange={(e) => setTiers((ts) => ts.map((x) => (x.key === r.key ? { ...x, name: e.target.value } : x)))} className={input} />
                </Field>
                <Field id={`tier-price-${r.key}`} label={f.tierPrice}>
                  <Input id={`tier-price-${r.key}`} inputMode="decimal" value={r.price} onChange={(e) => setTiers((ts) => ts.map((x) => (x.key === r.key ? { ...x, price: e.target.value } : x)))} className={cn(input, "tabular-nums")} />
                </Field>
                <Field id={`tier-supply-${r.key}`} label={f.tierSupply}>
                  <Input id={`tier-supply-${r.key}`} inputMode="numeric" value={r.supply} onChange={(e) => setTiers((ts) => ts.map((x) => (x.key === r.key ? { ...x, supply: e.target.value } : x)))} className={cn(input, "tabular-nums")} />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-11 self-end"
                  aria-label={t(f.removeTier, { n: i + 1 })}
                  disabled={tiers.length === 1}
                  onClick={() => setTiers((ts) => ts.filter((x) => x.key !== r.key))}
                >
                  <Trash2Icon aria-hidden="true" />
                </Button>
              </div>
            ))}
            {errors.tiers && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {errors.tiers}
              </p>
            )}
            {tiers.length < 4 && (
              <Button
                type="button"
                variant="outline"
                className="h-11 border-input"
                onClick={() => setTiers((ts) => [...ts, { key: Math.max(...ts.map((x) => x.key)) + 1, name: "", price: "", supply: "" }])}
              >
                <PlusIcon aria-hidden="true" />
                {f.addTier}
              </Button>
            )}
          </fieldset>

          <fieldset className="space-y-5" disabled={busy || !!createdId}>
            <legend className="label-caps mb-3 text-muted-foreground">{f.rules}</legend>
            <RangeRow id="r-cap" label={f.cap} min={100} max={150} step={5} value={cap} onChange={setCap} display={percent(cap, locale)} />
            <RangeRow id="r-roy" label={f.royalty} min={0} max={10} step={1} value={royalty} onChange={setRoyalty} display={percent(royalty, locale)} />
            <RangeRow id="r-lim" label={f.limit} min={1} max={8} step={1} value={limit} onChange={setLimit} display={String(limit)} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <Label htmlFor="r-souv" className="text-sm font-semibold">
                  {f.souvenir}
                </Label>
              </div>
              <Switch id="r-souv" checked={souvenir} onCheckedChange={setSouvenir} />
            </div>
          </fieldset>

          <fieldset className="space-y-5" disabled={busy || !!createdId} aria-describedby="foil-intro">
            <legend className="label-caps mb-1 inline-flex items-center gap-1.5 text-muted-foreground">
              <SparklesIcon className="size-3.5" aria-hidden="true" />
              {f.foil}
            </legend>
            <p id="foil-intro" className="text-sm text-muted-foreground">
              {f.foilIntro}
            </p>
            <div className="flex items-start justify-between gap-4">
              <Label htmlFor="r-foil" className="text-sm font-semibold">
                {f.foilOn}
              </Label>
              <Switch
                id="r-foil"
                checked={foilOn}
                onCheckedChange={(on) => {
                  setFoilOn(on)
                  if (!on) setPreviewFoil(false)
                }}
              />
            </div>
            {foilOn && (
              <>
                <RangeRow id="r-foil-size" label={f.foilSize} min={10} max={200} step={10} value={foilSize} onChange={setFoilSize} display={String(foilSize)} />
                <div className="space-y-1">
                  <RangeRow id="r-foil-odds" label={f.foilOdds} min={5} max={100} step={5} value={foilOdds} onChange={setFoilOdds} display={percent(foilOdds, locale)} />
                  <p className="text-xs text-muted-foreground">{f.foilOddsHint}</p>
                </div>
                <RangeRow
                  id="r-foil-bonus"
                  label={f.foilBonus}
                  min={0}
                  max={50}
                  step={5}
                  value={foilBonus}
                  onChange={setFoilBonus}
                  display={t(f.foilBonusValue, { n: foilBonus, pct: percent(cap + foilBonus, locale) })}
                />
                <div role="group" aria-labelledby="foil-perks-l" aria-describedby={errors.foil ? "foil-perks-err" : undefined} className="space-y-2">
                  <p id="foil-perks-l" className="text-sm font-semibold">
                    {f.foilPerks}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {PERKS.map((perk) => {
                      const on = foilPerks.includes(perk)
                      return (
                        <label
                          key={perk}
                          className={cn(
                            "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                            on ? "border-foreground dark:border-primary" : "border-input text-muted-foreground"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => setFoilPerks((ps) => (on ? ps.filter((x) => x !== perk) : PERKS.filter((x) => x === perk || ps.includes(x))))}
                            className="size-4 accent-[var(--foreground)] dark:accent-[var(--primary)]"
                          />
                          {tk.rarePerks[perk]}
                        </label>
                      )
                    })}
                  </div>
                  {errors.foil && (
                    <p id="foil-perks-err" role="alert" className="text-sm font-medium text-destructive">
                      {errors.foil}
                    </p>
                  )}
                </div>
              </>
            )}
          </fieldset>
        </div>

        <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="label-caps text-muted-foreground">{f.preview}</p>
            {foilOn && (
              <div role="radiogroup" aria-label={f.previewAs} className="inline-flex rounded-md bg-muted p-1">
                {(
                  [
                    [false, f.previewStandard],
                    [true, f.previewFoil],
                  ] as const
                ).map(([foil, label]) => (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={previewFoil === foil}
                    onClick={() => setPreviewFoil(foil)}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-sm px-3 text-sm font-semibold pointer-coarse:h-10",
                      previewFoil === foil ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    {foil && <SparklesIcon className="size-3.5" aria-hidden="true" />}
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Ticket
            rare={
              foilOn && previewFoil
                ? {
                    ...rareArt("aurora"),
                    pattern: "waves",
                    label: t(tk.rare, { n: 1, of: foilSize }),
                    perks: foilPerks.map((x) => tk.rarePerks[x]),
                    perksLabel: tk.perks,
                  }
                : undefined
            }
            eventName={name || f.namePlaceholder}
            tagline={tagline || undefined}
            venue={`${venue}${city ? `, ${city}` : ""}`}
            date={Number.isNaN(previewTime) ? "—" : eventDate(previewTime, locale)}
            doors={Number.isNaN(previewTime) ? "—" : clock(previewTime - 3_600_000, locale)}
            section={firstTier?.name || "—"}
            seat="GA"
            serial="0001"
            labels={tk}
            rules={{
              cap: t(tk.capValue, { pct: percent(cap + (foilOn && previewFoil ? foilBonus : 0), locale) }),
              royalty: percent(royalty, locale),
              limit: t(tk.limitValue, { n: limit }),
              souvenir: souvenir ? tk.souvenirYes : tk.souvenirNo,
            }}
            stamp={createdId ? { label: tk.stamps.minted, tone: "ink", animate: true } : undefined}
          />
          <FlowFeedback state={livePending(flow, state)} />
          {createdId ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="h-12">
                <Link href={href(locale, `/app/events/${createdId}`)}>
                  {f.openEvent}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button type="button" variant="outline" className="h-12 border-input" onClick={onClose}>
                {f.cancel}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" className="h-12 flex-1" disabled={busy}>
                {busy ? f.deploying : f.deploy}
              </Button>
              <Button type="button" variant="outline" className="h-12 border-input" onClick={onClose} disabled={busy}>
                {f.cancel}
              </Button>
            </div>
          )}
        </div>
      </form>
    </section>
  )
}

function Field({ id, label, error, className, children }: { id: string; label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-err`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

function RangeRow({
  id,
  label,
  min,
  max,
  step,
  value,
  onChange,
  display,
}: {
  id: string
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  display: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-4">
        <Label htmlFor={id} className="text-sm font-semibold">
          {label}
        </Label>
        <output htmlFor={id} className="font-display text-2xl font-extrabold tabular-nums">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={display}
        className="h-11 w-full cursor-pointer accent-[var(--foreground)] dark:accent-[var(--primary)]"
      />
    </div>
  )
}
