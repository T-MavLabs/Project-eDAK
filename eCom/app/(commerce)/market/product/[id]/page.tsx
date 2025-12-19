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
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3 vyapar-fade-in">
        <Button asChild variant="outline" className="vyapar-gentle-transition">
          <Link href="/market" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Marketplace
          </Link>
        </Button>
        <Button asChild variant="secondary" className="vyapar-gentle-transition">
          <Link href="/market/cart" className="inline-flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Cart
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 vyapar-slide-up">
        <Card className="overflow-hidden vyapar-card">
          <div className="relative h-96 w-full bg-muted/30 overflow-hidden">
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

        <div className="space-y-6">
          {/* Product details */}
          <Card className="vyapar-card">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl leading-snug">{product.name}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="vyapar-chip vyapar-gentle-transition">{product.category}</Badge>
                <Badge variant="secondary" className="vyapar-chip vyapar-gentle-transition">
                  <span className="inline-flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" /> Delivered by India Post
                  </span>
                </Badge>
                <Badge variant="secondary" className="vyapar-chip vyapar-gentle-transition">Cash on Delivery</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Price</div>
                  <div className="mt-1 text-3xl font-semibold">₹{Number(product.price).toLocaleString("en-IN")}</div>
                </div>
                <div className="rounded-xl border bg-background/80 px-4 py-2 text-xs text-muted-foreground vyapar-soft-shadow">
                  Sold by <span className="font-medium text-foreground">{product.seller_name}</span>
                </div>
              </div>

              {product.description ? (
                <div className="text-sm text-muted-foreground leading-relaxed">{product.description}</div>
              ) : null}
            </CardContent>
          </Card>

          {/* Seller story (first in vertical flow) */}
          <Card className="vyapar-card bg-gradient-to-br from-secondary/30 to-background">
            <CardHeader>
              <div className="vyapar-kicker">Seller story</div>
              <CardTitle className="text-lg">{product.seller_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                A small Indian seller building a sustainable livelihood through local craft and honest pricing.
                Every purchase supports an MSME journey—one order at a time.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-white/80 p-3 vyapar-soft-shadow">
                  <div className="vyapar-kicker">Made in</div>
                  <div className="mt-1 text-sm font-semibold">India</div>
                </div>
                <div className="rounded-xl border bg-white/80 p-3 vyapar-soft-shadow">
                  <div className="vyapar-kicker">Ships via</div>
                  <div className="mt-1 text-sm font-semibold">India Post</div>
                </div>
                <div className="rounded-xl border bg-white/80 p-3 vyapar-soft-shadow">
                  <div className="vyapar-kicker">Support</div>
                  <div className="mt-1 text-sm font-semibold">MSME-first</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery trust strip */}
          <Card className="vyapar-trust-badge vyapar-soft-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary vyapar-gentle-transition">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-base font-semibold">Handled by India Post</div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    Track your delivery easily. You'll receive an India Post tracking ID at checkout to follow your parcel from dispatch to delivery.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 vyapar-gentle-transition"
              onClick={() => {
                addToCart(product.id, 1);
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1400);
              }}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
            <Button asChild variant="outline" className="flex-1 vyapar-gentle-transition">
              <Link href="/market/checkout">Buy now</Link>
            </Button>
          </div>

          {added ? (
            <div className="rounded-xl border bg-green-50 p-3 text-sm text-green-700 vyapar-success">
              ✓ Added to cart. You're supporting a local seller—ready when you are.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
