"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck, ShoppingCart, Truck } from "lucide-react";

import { getProductById } from "@/lib/mockProducts";
import { addToCart } from "@/lib/mockOrders";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = useMemo(() => getProductById(params.id), [params.id]);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="rounded-md border bg-background p-6">
          <div className="text-lg font-semibold">Product not found</div>
          <p className="mt-2 text-sm text-muted-foreground">
            This demo marketplace uses mock data. Go back to the marketplace and pick any item.
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
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild variant="outline">
          <Link href="/market" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Marketplace
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/market/cart" className="inline-flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Cart
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="relative h-80 w-full bg-muted/40">
            <Image src={product.imageSrc} alt={product.name} fill className="object-cover" />
          </div>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl leading-snug">{product.name}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              {product.deliveredByIndiaPost ? (
                <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <span className="inline-flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" /> Delivered by India Post
                  </span>
                </Badge>
              ) : null}
              <Badge variant="secondary">
                {product.codAvailable ? "COD available" : "Prepaid  "}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="mt-1 text-3xl font-semibold">₹{product.priceInr.toLocaleString("en-IN")}</div>
              </div>
              <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                Ships from <span className="font-medium text-foreground">{product.originCity}</span>
              </div>
            </div>

            <div className="rounded-md border bg-background p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">India Post tracking-ready</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    On order placement, we generate a mock India Post tracking ID and redirect you to the tracking timeline.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => {
                  addToCart(product.id, 1);
                  setAdded(true);
                  window.setTimeout(() => setAdded(false), 1400);
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/market/checkout">Buy now</Link>
              </Button>
            </div>

            {added ? (
              <div className="text-sm text-muted-foreground">Added to cart. You can proceed to checkout.</div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
