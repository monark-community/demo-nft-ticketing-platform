// Visual check of every page and key flow with Playwright, against the production build.
// Usage: pnpm build && pnpm start          (serves on port 3149)
//        pnpm screenshots                  (or BASE_URL=... ONLY=en-390 pnpm screenshots)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3149"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY ?? process.argv[2]
const SKIP_MARKETING = process.env.SKIP_MARKETING ?? (process.argv[3] === "app" ? "1" : "")
const KEY = "nftokenpass-demo-v1"

const sizes = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme })
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light" })

const T = {
  en: {
    connect: "Connect wallet",
    confirm: "Confirm",
    reject: "Reject",
    buyOne: "Buy 1 ticket",
    bought: /is in your wallet/,
    rareReveal: "Reveal your rare drop",
    rareDone: "Put the foil ticket in your wallet",
    showCode: "Show entry code",
    scanNext: "Scan next guest",
    scanMine: "Scan my ticket",
    admitted: "Admitted. Enjoy the show.",
    refused: /^Refused:/,
  },
  fr: {
    connect: "Connecter le portefeuille",
    confirm: "Confirmer",
    reject: "Refuser",
    buyOne: "Acheter 1 billet",
    bought: /est dans votre portefeuille/,
    rareReveal: "Découvrir votre billet rare",
    rareDone: "Ranger le billet métallisé dans votre portefeuille",
    showCode: "Afficher le code d'entrée",
    scanNext: "Scanner l'invité suivant",
    scanMine: "Scanner mon billet",
    admitted: "Entrée validée. Bon spectacle.",
    refused: /^Refusé :/,
  },
}

async function newPage(browser, v) {
  const context = await browser.newContext({
    viewport: sizes[v.w],
    colorScheme: v.theme,
    locale: v.locale === "fr" ? "fr-CA" : "en-CA",
    reducedMotion: "no-preference",
    hasTouch: v.w < 768,
    isMobile: v.w < 768,
  })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, v.theme)
  const page = await context.newPage()
  page.on("pageerror", (e) => console.log("  ! page error:", e.message))
  return { context, page }
}

const tag = (v) => `${v.locale}-${v.w}-${v.theme}`

async function shot(page, v, name, fullPage = false) {
  if (fullPage) {
    const y = await page.evaluate(() => window.scrollY)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(400)
    await page.evaluate((top) => window.scrollTo(0, top), y)
  }
  await page.waitForTimeout(350)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  if (overflow > 0) console.log(`  ! horizontal overflow ${overflow}px on ${name}`)
  await page.screenshot({ path: `${OUT}${tag(v)}-${name}.png`, fullPage })
  console.log("  ✓", `${tag(v)}-${name}`)
}

async function freshDemo(page, v) {
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  await page.evaluate((key) => localStorage.removeItem(key), KEY)
  await page.reload({ waitUntil: "networkidle" })
  await page.waitForTimeout(300)
}

async function setSetting(page, patch) {
  await page.evaluate(
    ([key, p]) => {
      const s = JSON.parse(localStorage.getItem(key))
      Object.assign(s.settings, p)
      localStorage.setItem(key, JSON.stringify(s))
    },
    [KEY, patch]
  )
  await page.reload({ waitUntil: "networkidle" })
}

const dialog = (page) => page.getByRole("dialog")

async function confirm(page, v) {
  await dialog(page).getByRole("button", { name: T[v.locale].confirm, exact: true }).click()
}

async function connect(page, v, capture) {
  await page.getByRole("button", { name: T[v.locale].connect }).first().click()
  await dialog(page).waitFor()
  if (capture) await shot(page, v, "flow1-connect-prompt")
  await confirm(page, v)
  await page.getByRole("button", { name: T[v.locale].connect }).first().waitFor({ state: "detached", timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(500)
}

/** Every purchase drops a rare foil ticket in the demo: reveal it, tilt it, put it away. */
async function rareDrop(page, v, capture) {
  const t = T[v.locale]
  const card = dialog(page).getByRole("button", { name: t.rareReveal })
  await card.waitFor({ timeout: 12000 })
  if (capture) await shot(page, v, "flow1-rare-sealed")
  await card.click()
  const done = dialog(page).getByRole("button", { name: t.rareDone })
  await done.waitFor()
  await page.waitForTimeout(2400)
  const box = await done.boundingBox()
  if (box) await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.2, { steps: 8 })
  if (capture) await shot(page, v, "flow1-rare-revealed")
  await done.click()
  await dialog(page).waitFor({ state: "detached" })
  await page.waitForTimeout(1600)
}

async function marketing(page, v) {
  for (const [name, path] of [
    ["home", ""],
    ["how-it-works", "/how-it-works"],
    ["credits", "/credits"],
    ["pricing", "/pricing"],
    ["404", "/this-page-does-not-exist"],
  ]) {
    await page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(600)
    await shot(page, v, `page-${name}`, true)
  }
  if (v.w < 768) {
    await page.goto(`${BASE}/${v.locale}`, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: "Open menu" }).click()
    await dialog(page).waitFor()
    await shot(page, v, "page-mobile-menu")
  }
}

async function appFlows(page, v) {
  const t = T[v.locale]
  await freshDemo(page, v)
  await shot(page, v, "app-01-box-office", true)

  // Flow 1: buy a primary ticket (rejected connect first, then connect, buy, confirm)
  await page.goto(`${BASE}/${v.locale}/app/events/maree-basse`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await shot(page, v, "flow1-event", true)
  await page.getByRole("button", { name: t.connect }).first().click()
  await dialog(page).getByRole("button", { name: t.reject, exact: true }).click()
  await page.waitForTimeout(600)
  await connect(page, v, true)
  await page.getByRole("button", { name: t.buyOne }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow1-buy-prompt")
  await confirm(page, v)
  await page.getByText("Waiting for the network…").first().waitFor()
  await page.getByText("Waiting for the network…").first().scrollIntoViewIfNeeded()
  await shot(page, v, "flow1-pending")
  await rareDrop(page, v, true)
  await page.getByText(t.bought).first().scrollIntoViewIfNeeded()
  await shot(page, v, "flow1-confirmed")

  // Flow 1 failure: the network drops the next transaction
  await setSetting(page, { failNext: true })
  await page.getByRole("button", { name: t.buyOne }).click()
  await confirm(page, v)
  await page.getByText(/didn't confirm the transaction/).first().waitFor({ timeout: 12000 })
  await page.getByText(/didn't confirm the transaction/).first().scrollIntoViewIfNeeded()
  await shot(page, v, "flow1-failed")

  // Flow 1 resale purchase blocked by the per-wallet limit (4 held: 0388, 0389, new one... then limit)
  // Flow 2: resell 0389 within the cap
  await page.goto(`${BASE}/${v.locale}/app/wallet`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await page.waitForTimeout(500)
  await shot(page, v, "flow2-wallet", true)
  const t0389 = page.locator("article", { has: page.getByText("0389").first() }).filter({ hasText: "Marée Basse" }).first()
  const item = page.getByRole("article", { name: /0389/ })
  await item.getByRole("button", { name: "Resell" }).click()
  await item.getByRole("button", { name: "Raise the price" }).click()
  await page.waitForTimeout(400)
  await item.getByRole("heading", { level: 3 }).scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-rail-at-cap")
  void t0389
  await item.getByRole("button", { name: /^List for/ }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow2-list-prompt")
  await confirm(page, v)
  await page.getByText(/is listed for/).first().waitFor({ timeout: 12000 })
  await item.scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-listed")
  await item.getByRole("button", { name: "A fan buys it (simulate)" }).click()
  await page.getByText(/sold for/).first().waitFor({ timeout: 12000 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow2-sold")

  // Flow 2 failure: try to list above the cap
  const item2 = page.getByRole("article", { name: /1022/ })
  await item2.getByRole("button", { name: "Resell" }).click()
  await item2.getByRole("button", { name: "Try to list above the cap (demo)" }).click()
  await confirm(page, v)
  await page.getByText(/Price above the resale cap/).first().waitFor({ timeout: 12000 })
  await page.getByText(/Price above the resale cap/).first().scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-above-cap-failed")

  // Flow 3: show the entry code, then the door
  const item3 = page.getByRole("article", { name: /0388/ })
  await item3.getByRole("button", { name: t.showCode }).click()
  await page.waitForTimeout(1200)
  await item3.scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-entry-code")

  await page.goto(`${BASE}/${v.locale}/app/door`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await shot(page, v, "flow3-door", true)
  const names = ["admitted", "expired", "admitted-2", "used", "not-holder", "wrong-event", "forged"]
  for (let i = 0; i < names.length; i++) {
    await page.getByRole("button", { name: t.scanNext }).click()
    if (i === 0) {
      await page.waitForTimeout(350)
      await shot(page, v, "flow3-verifying")
    }
    await page.locator("#vf-h").locator("xpath=../..").getByText(i === 0 || i === 2 ? t.admitted : t.refused).first().waitFor({ timeout: 12000 })
    await page.waitForTimeout(700)
    if (["admitted", "expired", "used", "not-holder", "wrong-event", "forged"].includes(names[i])) {
      await page.locator("#vf-h").scrollIntoViewIfNeeded()
      await shot(page, v, `flow3-${names[i]}`)
    }
  }
  await page.getByRole("button", { name: t.scanMine }).click()
  await page.getByText(/souvenir was minted/).first().waitFor({ timeout: 12000 })
  await page.waitForTimeout(700)
  await page.locator("#vf-h").scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-my-ticket-admitted")
  await page.getByRole("heading", { name: "Tonight's log" }).scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-log")

  // Wallet after: used ticket and the new souvenir, activity
  await page.goto(`${BASE}/${v.locale}/app/wallet`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { name: "Souvenirs" }).scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await shot(page, v, "flow3-souvenir")
  await page.getByRole("heading", { name: "Activity" }).scrollIntoViewIfNeeded()
  await shot(page, v, "app-02-activity")

  // Flow 4: create an event
  await page.goto(`${BASE}/${v.locale}/app/organizer`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await page.waitForTimeout(400)
  await shot(page, v, "flow5-organizer", true)
  await page.getByRole("button", { name: "Create event" }).click()
  await page.getByRole("button", { name: "Deploy event" }).click()
  await page.getByText("Give the event a name.").waitFor()
  await page.getByRole("heading", { name: "Create an event" }).scrollIntoViewIfNeeded()
  await shot(page, v, "flow4-validation")
  await page.getByLabel("Event name").fill("Les Soirées Bellechasse")
  await page.getByLabel("One line under the name").fill("Album launch, with guests")
  await page.getByRole("button", { name: "Deploy event" }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow4-deploy-prompt")
  await confirm(page, v)
  await page.getByText(/is on sale in the box office/).first().waitFor({ timeout: 12000 })
  await page.waitForTimeout(500)
  await page.getByText(/is on sale in the box office/).first().scrollIntoViewIfNeeded()
  await shot(page, v, "flow4-deployed")

  // Demo controls
  await page.getByRole("button", { name: "Demo controls" }).click()
  await dialog(page).waitFor()
  await shot(page, v, "app-03-demo-controls")
  await page.keyboard.press("Escape")
}

async function frenchFlow(page, v) {
  const t = T.fr
  await page.goto(`${BASE}/fr`, { waitUntil: "networkidle" })
  await page.waitForTimeout(600)
  await shot(page, v, "page-home", true)
  await freshDemo(page, v)
  await shot(page, v, "app-01-box-office", true)
  await page.goto(`${BASE}/fr/app/events/maree-basse`, { waitUntil: "networkidle" })
  await connect(page, v, false)
  await page.getByRole("button", { name: t.buyOne }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow1-buy-prompt")
  await confirm(page, v)
  await rareDrop(page, v, true)
  await page.getByText(t.bought).first().waitFor({ timeout: 12000 })
  await page.waitForTimeout(500)
  await page.getByText(t.bought).first().scrollIntoViewIfNeeded()
  await shot(page, v, "flow1-confirmed")
  await page.goto(`${BASE}/fr/app/door`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: t.scanNext }).click()
  await page.getByText(t.admitted).first().waitFor({ timeout: 12000 })
  await page.getByRole("button", { name: t.scanNext }).click()
  await page.locator("#vf-h").locator("xpath=../..").getByText(t.refused).first().waitFor({ timeout: 12000 })
  await page.waitForTimeout(700)
  await page.locator("#vf-h").scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-expired")
  await page.goto(`${BASE}/fr/app/wallet`, { waitUntil: "networkidle" })
  const item = page.getByRole("article", { name: /0389/ })
  await item.getByRole("button", { name: "Revendre" }).click()
  await page.waitForTimeout(400)
  await item.getByRole("heading", { level: 3 }).scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-rail")
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
for (const v of variants) {
  if (ONLY && !tag(v).includes(ONLY)) continue
  console.log(tag(v))
  const { context, page } = await newPage(browser, v)
  try {
    if (v.locale === "fr") await frenchFlow(page, v)
    else {
      if (!SKIP_MARKETING) await marketing(page, v)
      await appFlows(page, v)
    }
  } catch (e) {
    console.error("  ✗", tag(v), e.message.split("\n")[0])
    await page.screenshot({ path: `${OUT}_error-${tag(v)}.png` }).catch(() => {})
    process.exitCode = 1
  }
  await context.close()
}
await browser.close()
