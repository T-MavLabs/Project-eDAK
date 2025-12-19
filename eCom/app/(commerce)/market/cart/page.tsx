"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import {
  getCart,
  removeFromCart,
  updateCartQty,
} from "@/lib/mockOrders";
import { fetchProductsByIds } from "@/supabase/queries";
import { getProductImageUrl } from "@/supabase/storage";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CartPage() {
  const [cart, setCart] = useState(getCart());
  const [productsById, setProductsById] = useState<Record<string, Awaited<ReturnType<typeof fetchProductsByIds>>[number]>>({});

  useEffect(() => {
    // keep in sync if other pages update cart
    const onStorage = () => setCart(getCart());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const ids = Array.from(new Set(cart.map((c) => c.productId)));
    fetchProductsByIds(ids)
      .then((rows) => {
        const map: Record<string, (typeof rows)[number]> = {};
        rows.forEach((p) => (map[p.id] = p));
        setProductsById(map);
      })
      .catch(() => setProductsById({}));
  }, [cart]);

  const lines = useMemo(() => {
    return cart
      .map((c) => {
        const p = productsById[c.productId];
        if (!p) return null;
        return {
          ...c,
          product: p,
          lineTotal: Number(p.price) * c.quantity,
        };
      })
      .filter(Boolean) as Array<{
      productId: string;
      quantity: number;
      product: NonNullable<(typeof productsById)[string]>;
      lineTotal: number;
    }>;
  }, [cart, productsById]);

  const subtotal = lines.reduce((acc, l) => acc + l.lineTotal, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-3 vyapar-fade-in">
        <div className="vyapar-kicker">Your bag</div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Cart
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Minimal, distraction-free. Delivery is handled by India Post.
        </p>
      </div>

      {lines.length === 0 ? (
        <div className="mt-8 rounded-2xl border vyapar-card bg-background/80 p-8 vyapar-soft-shadow vyapar-fade-in text-center">
          <div className="text-xl font-semibold">Your cart is empty</div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Browse the marketplace and support an Indian seller today.
          </p>
          <div className="mt-6">
            <Button asChild className="bg-primary hover:bg-primary/90 vyapar-gentle-transition">
              <Link href="/market">Go to Marketplace</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3 vyapar-slide-up">
          <div className="space-y-4 lg:col-span-2">
            {lines.map((l, idx) => (
              <Card key={l.productId} className="vyapar-card vyapar-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="relative h-24 w-full overflow-hidden rounded-lg border bg-muted/30 sm:h-24 sm:w-36 vyapar-gentle-transition">
                    <Image
                      src={getProductImageUrl(l.product.id, l.product.image_path)}
                      alt={l.product.name}
                      fill
                      sizes="(min-width: 640px) 9rem, 100vw"
                      className="object-cover vyapar-gentle-transition"
                      unoptimized
                    />
                  </div>

                  <div className="flex-1">
                    <div className="text-base font-semibold">{l.product.name}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="vyapar-chip vyapar-gentle-transition">{l.product.category}</Badge>
                      <Badge variant="secondary" className="vyapar-chip vyapar-gentle-transition">₹{Number(l.product.price).toLocaleString("en-IN")}</Badge>
                      <Badge variant="secondary" className="vyapar-chip vyapar-gentle-transition">Cash on Delivery</Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Decrease quantity"
                          className="vyapar-gentle-transition"
                          onClick={() => {
                            updateCartQty(l.productId, Math.max(1, l.quantity - 1));
                            setCart(getCart());
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="min-w-10 text-center text-sm font-medium tabular-nums">{l.quantity}</div>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Increase quantity"
                          className="vyapar-gentle-transition"
                          onClick={() => {
                            updateCartQty(l.productId, Math.min(10, l.quantity + 1));
                            setCart(getCart());
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-sm text-muted-foreground">Line total</div>
                        <div className="text-lg font-semibold">₹{l.lineTotal.toLocaleString("en-IN")}</div>
                        <Button
                          variant="ghost"
                          aria-label="Remove from cart"
                          className="vyapar-gentle-transition"
                          onClick={() => {
                            removeFromCart(l.productId);
                            setCart(getCart());
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit vyapar-card vyapar-soft-shadow">
            <CardHeader>
              <CardTitle className="text-base">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipping (India Post)</span>
                <span className="font-medium">₹{shipping.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-px w-full bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-xl font-semibold">₹{total.toLocaleString("en-IN")}</span>
              </div>

              <Button asChild className="w-full bg-primary hover:bg-primary/90 vyapar-gentle-transition">
                <Link href="/market/checkout">Proceed to Checkout</Link>
              </Button>

              <div className="text-xs text-muted-foreground leading-relaxed">
                Free shipping on orders ₹999 and above • Delivered via India Post.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
