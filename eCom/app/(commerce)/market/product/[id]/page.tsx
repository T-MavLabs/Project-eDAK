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
    // Load on client to keep existing client-side UX (cart interactions unchanged).
    queueMicrotask(() => setLoading(true));
    fetchProductById(id)
      .then((p) => setProduct(p))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
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
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground vyapar-fade-in">
        <Link href="/market" className="hover:text-foreground vyapar-gentle-transition">Marketplace</Link>
        <span>•</span>
        <Link href={`/market?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground vyapar-gentle-transition">{product.category}</Link>
        <span>•</span>
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 vyapar-slide-up">
        {/* Product Image - Amazon Style */}
        <div className="space-y-4">
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
        <div className="space-y-6">
          {/* Title and Category */}
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold leading-tight mb-3">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary" className="vyapar-chip">{product.category}</Badge>
              <Badge variant="secondary" className="vyapar-chip gap-1.5">
                <Truck className="h-3.5 w-3.5 text-primary" />
                India Post Delivery
              </Badge>
            </div>
          </div>

          {/* Price Section - Prominent */}
          <Card className="vyapar-card border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Price</div>
                  <div className="text-4xl font-bold text-primary">₹{Number(product.price).toLocaleString("en-IN")}</div>
                </div>
                <div className="pt-3 border-t">
                  <div className="text-sm text-muted-foreground">Sold by</div>
                  <div className="mt-1 font-semibold">{product.seller_name}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {product.description && (
            <Card className="vyapar-card">
              <CardHeader>
                <CardTitle className="text-lg">Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Delivery Info */}
          <Card className="vyapar-trust-badge vyapar-soft-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-base font-semibold mb-1">Delivered by India Post</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Track your order in real-time. You'll receive an India Post tracking ID at checkout to follow your parcel from dispatch to delivery.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card className="vyapar-card bg-gradient-to-br from-secondary/30 to-background">
            <CardHeader>
              <div className="vyapar-kicker">About the Seller</div>
              <CardTitle className="text-lg">{product.seller_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                A verified Indian MSME seller building a sustainable livelihood through local craft and honest pricing.
                Every purchase supports an MSME journey—one order at a time.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-white/80 p-3 vyapar-soft-shadow">
                  <div className="vyapar-kicker text-xs">Made in</div>
                  <div className="mt-1 text-sm font-semibold">India</div>
                </div>
                <div className="rounded-lg border bg-white/80 p-3 vyapar-soft-shadow">
                  <div className="vyapar-kicker text-xs">Ships via</div>
                  <div className="mt-1 text-sm font-semibold">India Post</div>
                </div>
                <div className="rounded-lg border bg-white/80 p-3 vyapar-soft-shadow">
                  <div className="vyapar-kicker text-xs">Support</div>
                  <div className="mt-1 text-sm font-semibold">MSME-first</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Sticky on mobile */}
          <div className="sticky bottom-4 lg:static space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 h-12 text-base vyapar-gentle-transition"
                onClick={() => {
                  addToCart(product.id, 1);
                  setAdded(true);
                  window.setTimeout(() => setAdded(false), 1400);
                }}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button asChild variant="outline" className="flex-1 h-12 text-base vyapar-gentle-transition">
                <Link href="/market/checkout">Buy Now</Link>
              </Button>
            </div>
            {added && (
              <div className="rounded-lg border bg-green-50 border-green-200 p-3 text-sm text-green-700 vyapar-success">
                ✓ Added to cart. You're supporting a local seller—ready when you are.
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" />
                <span>Free delivery on orders ₹999+</span>
              </div>
              <div>•</div>
              <div>Cash on Delivery available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
