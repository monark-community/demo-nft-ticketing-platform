"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"

export interface NftTrait {
  /** Trait category; e.g. "Background", "Body". */
  type: string
  /** Trait value; e.g. "Blue", "Cosmic". */
  value: string
  /** Optional rarity percentage (0-100) shown beneath the trait value. */
  rarity?: number
}

export interface NftCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** NFT display name. */
  name: string
  /** Image URL for the NFT. */
  image: string
  /** Alt text for the image. Defaults to `name`. */
  imageAlt?: string
  /** Collection name; rendered in muted text above the name. */
  collection?: string
  /** Optional collection badge shown as an overlay in the top-left of the image. */
  collectionBadge?: React.ReactNode
  /** Aspect ratio of the image; defaults to 1 (square). */
  aspectRatio?: number
  /** Price label (e.g. "0.42 ETH"). Rendered in the footer. */
  price?: React.ReactNode
  /** Secondary price label (e.g. "$1,234"). Rendered under `price` in muted text. */
  priceSecondary?: React.ReactNode
  /** Primary action button slot; e.g. <Button>Buy</Button>. */
  action?: React.ReactNode
  /** Trait list. Rendered in a 2-column grid between the header and footer. */
  traits?: NftTrait[]
  /** Cap on the number of traits shown before truncating with "+N more". Default: 4. */
  maxTraits?: number
}

function NftCard({
  name,
  image,
  imageAlt,
  collection,
  collectionBadge,
  aspectRatio = 1,
  price,
  priceSecondary,
  action,
  traits,
  maxTraits = 4,
  className,
  ...props
}: NftCardProps) {
  const visibleTraits = traits?.slice(0, maxTraits) ?? []
  const hiddenTraitCount = traits ? Math.max(0, traits.length - maxTraits) : 0

  return (
    <Card
      data-slot="nft-card"
      className={cn("overflow-hidden w-full max-w-sm", className)}
      {...props}
    >
      <div className="relative">
        <AspectRatio ratio={aspectRatio}>
          {/* Using a plain <img> instead of next/image so this block works
           *  outside a Next.js context. Consumers in Next apps can swap to
           *  next/image post-paste. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={imageAlt ?? name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </AspectRatio>
        {collectionBadge && (
          <div className="absolute top-2 left-2">
            {typeof collectionBadge === "string" ? (
              <Badge variant="secondary">{collectionBadge}</Badge>
            ) : (
              collectionBadge
            )}
          </div>
        )}
      </div>

      <CardHeader className="gap-1 p-4 pb-2">
        {collection && (
          <p className="text-xs text-muted-foreground truncate">{collection}</p>
        )}
        <h3 className="text-base font-semibold leading-tight truncate">{name}</h3>
      </CardHeader>

      {visibleTraits.length > 0 && (
        <CardContent className="grid grid-cols-2 gap-2 p-4 pt-0">
          {visibleTraits.map((t, i) => (
            <div
              key={`${t.type}-${i}`}
              className="rounded-md border border-border bg-muted/40 px-2 py-1.5"
            >
              <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                {t.type}
              </p>
              <p className="text-sm font-medium truncate">{t.value}</p>
              {typeof t.rarity === "number" && (
                <p className="text-[0.65rem] text-muted-foreground tabular-nums">
                  {t.rarity.toFixed(1)}% have this
                </p>
              )}
            </div>
          ))}
          {hiddenTraitCount > 0 && (
            <div className="col-span-2 text-center text-xs text-muted-foreground">
              +{hiddenTraitCount} more trait{hiddenTraitCount === 1 ? "" : "s"}
            </div>
          )}
        </CardContent>
      )}

      {(price || action) && (
        <CardFooter className="flex items-center justify-between gap-3 p-4 pt-2">
          {price && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tabular-nums">{price}</span>
              {priceSecondary && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {priceSecondary}
                </span>
              )}
            </div>
          )}
          {action && <div className="ml-auto">{action}</div>}
        </CardFooter>
      )}
    </Card>
  )
}

export { NftCard }
