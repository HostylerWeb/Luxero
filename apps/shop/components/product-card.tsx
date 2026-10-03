"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ShopProductData } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ShopProductData;
  preload?: boolean;
}

export function ProductCard({ product, preload = false }: ProductCardProps) {
  const [loaded, setLoaded] = useState(false);
  const priceFormatted = `£${(product.price / 100).toFixed(2)}`;
  const isFounder = product.slug.startsWith("founder");
  const blurDataUrl = product.metadata?.imageBlurs?.[product.images[0]];

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300",
          "hover:border-gold/30 hover:shadow-[0_0_20px_rgb(var(--gold-rgb)/0.12)]"
        )}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={cn(
                "object-cover object-center transition-transform duration-500 group-hover:scale-105",
                loaded ? "" : "animate-blur-in"
              )}
              onLoad={() => setLoaded(true)}
              placeholder={blurDataUrl ? "blur" : "empty"}
              blurDataURL={blurDataUrl}
              {...(preload ? { preload: true } : { loading: "lazy" })}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-border" />
                <p className="text-xs text-muted-foreground">No image</p>
              </div>
            </div>
          )}
        </div>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium leading-tight text-foreground line-clamp-2">
              {product.name}
            </h3>
            <span className="shrink-0 text-sm font-semibold text-gold">{priceFormatted}</span>
          </div>
          {product.shortDescription && (
            <p className="text-xs text-muted-foreground line-clamp-1">{product.shortDescription}</p>
          )}
          <div className="flex items-center gap-2 pt-1">
            {isFounder && (
              <Badge variant="default" className="text-[10px]">
                Limited
              </Badge>
            )}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <Badge variant="destructive" className="text-[10px]">
                Sale
              </Badge>
            )}
            {product.inventoryTracked && product.inventory <= 5 && product.inventory > 0 && (
              <Badge variant="warning" className="text-[10px]">
                Low stock
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
