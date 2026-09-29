import { ImageResponse } from "next/og"

import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "NFTokenPass"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)
  const lines = d.home.title.split(/(?<=\.)\s+/)
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f5efe3", padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, paddingRight: 48 }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, letterSpacing: -1, color: "#1c1814" }}>NFTOKENPASS</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {lines.map((l) => (
              <div key={l} style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.02, color: "#1c1814", letterSpacing: -2, textTransform: "uppercase" }}>
                {l}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#5c5347" }}>{d.common.demoBadge}</div>
        </div>
        <div style={{ display: "flex", width: 380, height: "100%", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "#f4c542",
              borderRadius: 16,
              padding: 32,
              height: 330,
              color: "#1c1814",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>
              <span>ADMIT ONE</span>
              <span>No. 0388</span>
            </div>
            <div style={{ display: "flex", fontSize: 54, fontWeight: 800, letterSpacing: -2 }}>MARÉE BASSE</div>
            <div style={{ display: "flex", fontSize: 20, borderTop: "2px solid #1c1814", paddingTop: 12 }}>Salle Bellechasse · Montréal</div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f4c542",
              borderRadius: 16,
              borderTop: "3px dashed #c9a032",
              padding: 32,
              height: 170,
              color: "#1c1814",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", fontSize: 20 }}>
              <span>{d.ticket.cap} 110 %</span>
              <span>{d.ticket.royalty} 5 %</span>
            </div>
            <div style={{ display: "flex", width: 72, height: 72, background: "#1c1814", borderRadius: 6 }} />
          </div>
        </div>
      </div>
    ),
    size
  )
}
