"use client"

import { RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { resetDemo, setSettings, useDemo } from "@/lib/demo/store"

import { useApp } from "./app-context"

export function DemoControls() {
  const { d, common } = useApp()
  const state = useDemo()
  const c = d.controls
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label={c.open} title={c.open} className="border-input pointer-coarse:size-11">
          <SlidersHorizontalIcon aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={common.menuClose} className="flex w-full flex-col gap-6 sm:max-w-sm">
        <SheetHeader className="space-y-1 text-left">
          <SheetTitle className="font-display text-2xl font-extrabold uppercase">{c.title}</SheetTitle>
          <SheetDescription>{c.description}</SheetDescription>
        </SheetHeader>
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="ctl-fail" className="text-sm font-semibold">
                {c.failNext}
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">{c.failNextHint}</p>
            </div>
            <Switch id="ctl-fail" checked={state?.settings.failNext ?? false} onCheckedChange={(v) => setSettings({ failNext: v })} />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="ctl-slow" className="text-sm font-semibold">
                {c.slow}
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">{c.slowHint}</p>
            </div>
            <Switch id="ctl-slow" checked={state?.settings.slow ?? false} onCheckedChange={(v) => setSettings({ slow: v })} />
          </div>
        </div>
        <div className="space-y-2 border-t border-dashed pt-5">
          <Button
            variant="outline"
            className="h-11 w-full border-input"
            onClick={() => {
              resetDemo()
              toast.success(c.resetDone)
            }}
          >
            <RotateCcwIcon aria-hidden="true" />
            {c.reset}
          </Button>
          <p className="text-xs text-muted-foreground">{c.resetHint}</p>
        </div>
        <p className="mt-auto text-xs text-muted-foreground">
          {common.demoBadge} · {c.storage}
        </p>
      </SheetContent>
    </Sheet>
  )
}
