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
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 vyapar-fade-in">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Shopping Cart</h1>
        <p className="text-sm text-muted-foreground">
          {lines.length === 0 ? "Your cart is empty" : `${lines.length} ${lines.length === 1 ? "item" : "items"} in your cart`}
        </p>
      </div>

      {lines.length === 0 ? (
        <Card className="vyapar-card vyapar-soft-shadow vyapar-fade-in">
          <CardContent className="p-12 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <div className="text-xl font-semibold mb-2">Your cart is empty</div>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Browse the marketplace and support an Indian seller today. Every purchase helps MSMEs grow.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 vyapar-gentle-transition">
              <Link href="/market">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3 vyapar-slide-up">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {lines.map((l, idx) => (
              <Card key={l.productId} className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition" style={{ animationDelay: `${idx * 50}ms` }}>
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <Link href={`/market/product/${l.product.id}`} className="relative h-32 w-full overflow-hidden rounded-lg border bg-muted/30 sm:h-32 sm:w-32 flex-shrink-0">
                      <Image
                        src={getProductImageUrl(l.product.id, l.product.image_path)}
                        alt={l.product.name}
                        fill
                        sizes="(min-width: 640px) 8rem, 100vw"
                        className="object-cover vyapar-gentle-transition"
                        unoptimized
                      />
                    </Link>

                    <div className="flex-1 min-w-0 space-y-3">
                      <div>
                        <Link href={`/market/product/${l.product.id}`}>
                          <h3 className="text-base font-semibold mb-2 hover:text-primary vyapar-gentle-transition line-clamp-2">{l.product.name}</h3>
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="secondary" className="vyapar-chip text-xs">{l.product.category}</Badge>
                          <Badge variant="secondary" className="vyapar-chip text-xs">Cash on Delivery</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Decrease quantity"
                            className="h-8 w-8 vyapar-gentle-transition"
                            onClick={() => {
                              updateCartQty(l.productId, Math.max(1, l.quantity - 1));
                              setCart(getCart());
                            }}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <div className="min-w-10 text-center text-sm font-medium tabular-nums">{l.quantity}</div>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Increase quantity"
                            className="h-8 w-8 vyapar-gentle-transition"
                            onClick={() => {
                              updateCartQty(l.productId, Math.min(10, l.quantity + 1));
                              setCart(getCart());
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Unit price</div>
                            <div className="text-sm font-medium">₹{Number(l.product.price).toLocaleString("en-IN")}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Total</div>
                            <div className="text-lg font-semibold">₹{l.lineTotal.toLocaleString("en-IN")}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Remove from cart"
                            className="h-8 w-8 vyapar-gentle-transition text-muted-foreground hover:text-destructive"
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary - Sticky */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="vyapar-card vyapar-soft-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({lines.length} {lines.length === 1 ? "item" : "items"})</span>
                    <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-primary">Free</span>
                      ) : (
                        `₹${shipping.toLocaleString("en-IN")}`
                      )}
                    </span>
                  </div>
                  {subtotal < 999 && (
                    <div className="text-xs text-muted-foreground">
                      Add ₹{(999 - subtotal).toLocaleString("en-IN")} more for free shipping
                    </div>
                  )}
                </div>
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">₹{total.toLocaleString("en-IN")}</span>
                </div>

                <Button asChild className="w-full bg-primary hover:bg-primary/90 h-12 text-base vyapar-gentle-transition">
                  <Link href="/market/checkout">Proceed to Checkout</Link>
                </Button>

                <div className="pt-3 border-t space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Free shipping on orders ₹999+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Delivered via India Post</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Cash on Delivery available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
