"use client"

import { ShieldAlertIcon } from "lucide-react"
import { useContext } from "react"

import { LogoMark } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"
import { usePrompt, useDemo } from "@/lib/demo/store"

import { AppCtx } from "./app-context"

/** The simulated wallet's signature request, answered with Confirm or Reject. */
export function WalletPrompt() {
  const prompt = usePrompt()
  const state = useDemo()
  const copy = useContext(AppCtx)
  if (!copy) return null
  const p = copy.d.prompt
  const s = prompt?.summary

  return (
    <Dialog open={!!prompt} onOpenChange={(open) => !open && prompt?.resolve(false)}>
      <DialogContent hideClose className="max-w-md gap-0 overflow-hidden p-0 sm:rounded-lg">
        <div className="flex items-center justify-between gap-3 border-b bg-muted px-5 py-3">
          <span className="label-caps text-muted-foreground">{p.title}</span>
          {state && (
            <div className="flex items-center gap-2 text-xs">
              <WalletAvatar address={state.wallet.address} size={20} />
              <WalletAddress address={state.wallet.address} className="text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="space-y-5 px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-md border bg-background">
              <LogoMark className="h-5 w-7 text-foreground" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{p.site}</p>
              <DialogTitle className="text-lg leading-tight font-semibold">{s?.kind === "connect" ? p.connectTitle : s?.title}</DialogTitle>
            </div>
          </div>
          {s?.kind === "connect" ? (
            <DialogDescription className="text-sm text-muted-foreground">{p.connectBody}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{p.signing}</DialogDescription>
          )}
          {s && s.lines.length > 0 && (
            <dl className="divide-y divide-dashed rounded-md border bg-background text-sm">
              {s.lines.map((l) => (
                <div key={l.label} className="flex items-baseline justify-between gap-4 px-3.5 py-2.5">
                  <dt className="text-muted-foreground">{l.label}</dt>
                  <dd className={l.strong ? "text-right font-semibold tabular-nums" : "text-right tabular-nums"}>{l.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {s?.movesValue && (
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldAlertIcon className="mt-px size-3.5 shrink-0" aria-hidden="true" />
              {copy.common.testnet}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 border-t px-5 py-4">
          <Button variant="outline" className="h-11 border-input" onClick={() => prompt?.resolve(false)}>
            {p.reject}
          </Button>
          <Button className="h-11" onClick={() => prompt?.resolve(true)} autoFocus>
            {p.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
