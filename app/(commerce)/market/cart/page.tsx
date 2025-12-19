"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { getProductById } from "@/lib/mockProducts";
import {
  getCart,
  removeFromCart,
  updateCartQty,
} from "@/lib/mockOrders";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CartPage() {
  const [cart, setCart] = useState(getCart());

  useEffect(() => {
    // keep in sync if other pages update cart
    const onStorage = () => setCart(getCart());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const lines = useMemo(() => {
    return cart
      .map((c) => {
        const p = getProductById(c.productId);
        if (!p) return null;
        return {
          ...c,
          product: p,
          lineTotal: p.priceInr * c.quantity,
        };
      })
      .filter(Boolean) as Array<{
      productId: string;
      quantity: number;
      product: NonNullable<ReturnType<typeof getProductById>>;
      lineTotal: number;
    }>;
  }, [cart]);

  const subtotal = lines.reduce((acc, l) => acc + l.lineTotal, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Cart
        </h1>
        <p className="text-sm text-muted-foreground">
          Review items and proceed to checkout. Delivery is handled by India Post (demo).
        </p>
      </div>

      {lines.length === 0 ? (
        <div className="mt-6 rounded-md border bg-background p-6">
          <div className="text-lg font-semibold">Your cart is empty</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse the marketplace and add a few items to see the India Post integration flow.
          </p>
          <div className="mt-4">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/market">Go to Marketplace</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {lines.map((l) => (
              <Card key={l.productId}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="relative h-20 w-full overflow-hidden rounded-md border bg-muted/40 sm:h-20 sm:w-32">
                    <Image src={l.product.imageSrc} alt={l.product.name} fill className="object-cover" />
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-semibold">{l.product.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{l.product.category}</Badge>
                      <Badge variant="secondary">₹{l.product.priceInr.toLocaleString("en-IN")}</Badge>
                      {l.product.codAvailable ? (
                        <Badge variant="secondary">COD</Badge>
                      ) : (
                        <Badge variant="secondary">Prepaid  </Badge>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Decrease quantity"
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

          <Card className="h-fit border-primary/10">
            <CardHeader>
              <CardTitle className="text-base">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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

              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href="/market/checkout">Proceed to Checkout</Link>
              </Button>

              <div className="text-xs text-muted-foreground">
                Free shipping on orders ₹999 and above (demo policy).
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
