"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, ShoppingCart, Truck } from "lucide-react";

import { addToCart } from "@/lib/mockOrders";
import { fetchProductById } from "@/supabase/queries";
import { getProductImageUrl } from "@/supabase/storage";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Awaited<ReturnType<typeof fetchProductById>>>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    // Start loading immediately without queueMicrotask delay
    let cancelled = false;
    setLoading(true);
    
    fetchProductById(id)
      .then((p) => {
        if (!cancelled) {
          setProduct(p);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProduct(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="h-10 w-32 rounded-md vyapar-skeleton" />
          <div className="h-10 w-24 rounded-md vyapar-skeleton" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 w-full rounded-xl vyapar-skeleton" />
          <div className="space-y-4 rounded-xl border bg-background p-6">
            <div className="h-7 w-3/4 rounded-md vyapar-skeleton" />
            <div className="h-5 w-1/2 rounded-md vyapar-skeleton" />
            <div className="h-24 w-full rounded-md vyapar-skeleton" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-10 w-full rounded-md vyapar-skeleton" />
              <div className="h-10 w-full rounded-md vyapar-skeleton" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="rounded-md border bg-background p-6">
          <div className="text-lg font-semibold">Product not found</div>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn&apos;t find this product. Go back to the marketplace and try another item.
          </p>
          <div className="mt-4">
            <Button asChild variant="secondary">
              <Link href="/market">Back to Marketplace</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-4 sm:py-8 overflow-x-hidden">
      {/* Breadcrumbs */}
      <nav className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 ux4g-body-small text-muted-foreground vyapar-fade-in overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide" aria-label="Breadcrumb">
        <Link href="/market" className="hover:text-foreground vyapar-gentle-transition ux4g-label inline-flex items-center whitespace-nowrap flex-shrink-0">Marketplace</Link>
        <span className="text-muted-foreground/60 inline-flex items-center justify-center leading-none flex-shrink-0" aria-hidden="true">•</span>
        <Link href={`/market?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground vyapar-gentle-transition ux4g-label inline-flex items-center whitespace-nowrap flex-shrink-0 break-words">{product.category}</Link>
        <span className="text-muted-foreground/60 inline-flex items-center justify-center leading-none flex-shrink-0" aria-hidden="true">•</span>
        <span className="text-foreground font-medium ux4g-label inline-flex items-center min-w-0 break-words">{product.name}</span>
      </nav>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 vyapar-slide-up items-start">
        {/* Product Image - Amazon Style */}
        <div className="space-y-4 min-w-0 w-full">
          <Card className="overflow-hidden vyapar-card">
            <div className="relative aspect-square w-full bg-muted/30 overflow-hidden">
              <Image
                src={getProductImageUrl(product.id, product.image_path)}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover vyapar-gentle-transition"
                priority
                loading="eager"
                unoptimized
              />
            </div>
          </Card>
        </div>

        {/* Product Info - Right Side */}
        <div className="space-y-4 sm:space-y-6 min-w-0 w-full">
          {/* Title and Category */}
          <div className="min-w-0">
            <h1 className="ux4g-headline mb-3 break-words pr-2">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4 min-w-0">
              <Badge variant="secondary" className="vyapar-chip ux4g-label flex-shrink-0">{product.category}</Badge>
              <Badge variant="secondary" className="vyapar-chip gap-1.5 ux4g-label flex-shrink-0 max-w-full">
                <Truck className="h-3.5 w-3.5 text-primary flex-shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">India Post Delivery</span>
              </Badge>
            </div>
          </div>

          {/* Price Section - Prominent */}
          <Card className="vyapar-card border-primary/20">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <div>
                  <div className="ux4g-label text-muted-foreground mb-1">Price</div>
                  <div className="ux4g-display text-primary break-words">₹{Number(product.price).toLocaleString("en-IN")}</div>
                </div>
                <div className="pt-3 border-t">
                  <div className="ux4g-label text-muted-foreground">Sold by</div>
                  <div className="mt-1 ux4g-label font-semibold break-words">{product.seller_name}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {product.description && (
            <Card className="vyapar-card">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="ux4g-title">Product description</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="ux4g-body text-muted-foreground leading-relaxed whitespace-pre-line break-words overflow-wrap-anywhere">{product.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Delivery Info */}
          <Card className="vyapar-trust-badge vyapar-soft-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl bg-primary/10 text-primary flex-shrink-0" aria-hidden="true">
                  <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="ux4g-title mb-1 break-words">Delivered by India Post</div>
                  <p className="ux4g-body text-muted-foreground leading-relaxed break-words overflow-wrap-anywhere">
                    Track your order in real-time. You'll receive an India Post tracking ID at checkout to follow your parcel from dispatch to delivery.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card className="vyapar-card bg-gradient-to-br from-secondary/30 to-background">
            <CardHeader className="p-4 sm:p-6">
              <div className="vyapar-kicker ux4g-label">About the seller</div>
              <CardTitle className="ux4g-title break-words">{product.seller_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <p className="ux4g-body text-muted-foreground leading-relaxed break-words overflow-wrap-anywhere">
                A verified Indian MSME seller building a sustainable livelihood through local craft and honest pricing.
                Every purchase supports an MSME journey—one order at a time.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-white/80 p-3 vyapar-soft-shadow">
                  <div className="vyapar-kicker ux4g-body-small">Made in</div>
                  <div className="mt-1 ux4g-label font-semibold">India</div>
                </div>
                <div className="rounded-lg border bg-white/80 p-3 vyapar-soft-shadow">
                  <div className="vyapar-kicker ux4g-body-small">Ships via</div>
                  <div className="mt-1 ux4g-label font-semibold">India Post</div>
                </div>
                <div className="rounded-lg border bg-white/80 p-3 vyapar-soft-shadow">
                  <div className="vyapar-kicker ux4g-body-small">Support</div>
                  <div className="mt-1 ux4g-label font-semibold">MSME-first</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Sticky on mobile */}
          <div className="sticky bottom-0 left-0 right-0 lg:static space-y-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 lg:bg-transparent p-4 -mx-4 sm:mx-0 sm:p-0 border-t lg:border-t-0 lg:pt-0">
            <div className="flex flex-col gap-3 sm:flex-row w-full">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 min-h-[44px] ux4g-label vyapar-gentle-transition w-full sm:w-auto"
                onClick={() => {
                  addToCart(product.id, 1);
                  setAdded(true);
                  window.setTimeout(() => setAdded(false), 1400);
                }}
              >
                <ShoppingCart className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden="true" /> Add to cart
              </Button>
              <Button asChild variant="outline" className="flex-1 min-h-[44px] ux4g-label vyapar-gentle-transition w-full sm:w-auto">
                <Link href="/market/checkout">Buy now</Link>
              </Button>
            </div>
            {added && (
              <div className="rounded-lg border bg-green-50 border-green-200 p-3 ux4g-body-small text-green-700 vyapar-success break-words" role="alert">
                ✓ Added to cart. You're supporting a local seller—ready when you are.
              </div>
            )}
            <div className="flex items-center gap-2 sm:gap-4 ux4g-body-small text-muted-foreground pt-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Truck className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">Free delivery on orders ₹999+</span>
              </div>
              <span className="text-muted-foreground/60 flex-shrink-0" aria-hidden="true">•</span>
              <div className="break-words min-w-0">Cash on delivery available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
