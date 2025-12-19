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
        <h1 className="ux4g-headline mb-2">Shopping cart</h1>
        <p className="ux4g-body-small text-muted-foreground">
          {lines.length === 0 ? "Your cart is empty" : `${lines.length} ${lines.length === 1 ? "item" : "items"} in your cart`}
        </p>
      </div>

      {lines.length === 0 ? (
        <Card className="vyapar-card vyapar-soft-shadow vyapar-fade-in">
          <CardContent className="p-12 text-center">
            <div className="text-5xl mb-4" role="img" aria-label="Empty shopping cart">🛒</div>
            <div className="ux4g-title mb-2">Your cart is empty</div>
            <p className="ux4g-body text-muted-foreground mb-6 max-w-md mx-auto">
              Browse the marketplace and support an Indian seller today. Every purchase helps MSMEs grow.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 vyapar-gentle-transition min-h-[44px] ux4g-label">
              <Link href="/market">Continue shopping</Link>
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
                          <h3 className="ux4g-label font-semibold mb-2 hover:text-primary vyapar-gentle-transition line-clamp-2">{l.product.name}</h3>
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="secondary" className="vyapar-chip ux4g-body-small">{l.product.category}</Badge>
                          <Badge variant="secondary" className="vyapar-chip ux4g-body-small">Cash on delivery</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Decrease quantity"
                            className="h-11 w-11 vyapar-gentle-transition"
                            onClick={() => {
                              updateCartQty(l.productId, Math.max(1, l.quantity - 1));
                              setCart(getCart());
                            }}
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                          <div className="min-w-10 text-center ux4g-body font-medium tabular-nums">{l.quantity}</div>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Increase quantity"
                            className="h-11 w-11 vyapar-gentle-transition"
                            onClick={() => {
                              updateCartQty(l.productId, Math.min(10, l.quantity + 1));
                              setCart(getCart());
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="ux4g-body-small text-muted-foreground">Unit price</div>
                            <div className="ux4g-body font-medium">₹{Number(l.product.price).toLocaleString("en-IN")}</div>
                          </div>
                          <div className="text-right">
                            <div className="ux4g-body-small text-muted-foreground">Total</div>
                            <div className="ux4g-title text-primary">₹{l.lineTotal.toLocaleString("en-IN")}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Remove from cart"
                            className="h-11 w-11 vyapar-gentle-transition text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              removeFromCart(l.productId);
                              setCart(getCart());
                            }}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
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
                <CardTitle className="ux4g-title">Order summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between ux4g-body-small">
                    <span className="text-muted-foreground">Subtotal ({lines.length} {lines.length === 1 ? "item" : "items"})</span>
                    <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between ux4g-body-small">
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
                    <div className="ux4g-body-small text-muted-foreground">
                      Add ₹{(999 - subtotal).toLocaleString("en-IN")} more for free shipping
                    </div>
                  )}
                </div>
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between">
                  <span className="ux4g-label font-semibold">Total</span>
                  <span className="ux4g-headline text-primary">₹{total.toLocaleString("en-IN")}</span>
                </div>

                <Button asChild className="w-full bg-primary hover:bg-primary/90 h-12 ux4g-label vyapar-gentle-transition min-h-[44px]">
                  <Link href="/market/checkout">Proceed to checkout</Link>
                </Button>

                <div className="pt-3 border-t space-y-2 ux4g-body-small text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true">✓</span>
                    <span>Free shipping on orders ₹999+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true">✓</span>
                    <span>Delivered via India Post</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true">✓</span>
                    <span>Cash on delivery available</span>
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
