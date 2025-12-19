import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Truck } from "lucide-react";

import { fetchActiveProducts } from "@/supabase/queries";
import { getProductImageUrl } from "@/supabase/storage";
import { SellerRedirect } from "@/components/SellerRedirect";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MarketPage() {
  const products = await fetchActiveProducts().catch(() => []);

  return (
    <>
      <SellerRedirect />
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-3 vyapar-fade-in">
        <div className="vyapar-kicker">Supporting Indian Sellers</div>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <ShoppingBag className="h-6 w-6 text-primary" />
          Vyapar Marketplace
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Discover handcrafted products from Indian MSMEs. Every purchase supports local livelihoods, delivered with care by India Post.
        </p>
      </div>

      <div className="mt-8 rounded-2xl vyapar-trust-badge p-6 vyapar-soft-shadow vyapar-gentle-transition">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-base font-semibold">Handled by India Post</div>
            <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Track your delivery easily from dispatch to your doorstep.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-2 vyapar-chip vyapar-gentle-transition">
              <Truck className="h-3.5 w-3.5" /> Delivered by India Post
            </Badge>
            <Badge variant="secondary" className="vyapar-chip vyapar-gentle-transition">
              COD available where eligible
            </Badge>
          </div>
        </div>
      </div>

      {/* Categories first - story-led layout */}
      <div className="mt-10 vyapar-slide-up">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="vyapar-kicker">Browse by category</div>
            <div className="mt-1 text-base font-semibold">Discover by what you need</div>
            <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Explore handcrafted products from Indian artisans, local publishers, and small-batch makers.
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Handmade & Craft", note: "Artisans and clusters" },
            { name: "Books & Stationery", note: "Local publishers" },
            { name: "Electronics", note: "Everyday utility" },
            { name: "Home & Lifestyle", note: "Small-batch makers" },
          ].map((c, idx) => (
            <div
              key={c.name}
              className="vyapar-card p-5 vyapar-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="text-base font-semibold">{c.name}</div>
              <div className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.note}</div>
              <div className="mt-4 inline-flex items-center rounded-full border bg-white/80 px-3 py-1.5 text-xs text-muted-foreground vyapar-gentle-transition">
                Delivered via India Post
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 vyapar-slide-up">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="vyapar-kicker">Featured products</div>
            <div className="mt-1 text-base font-semibold">Meet the makers</div>
            <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Every product comes with a story. Support Indian sellers building sustainable livelihoods.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, idx) => (
          <Card 
            key={p.id} 
            className="overflow-hidden vyapar-card vyapar-fade-in"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="relative h-48 w-full bg-muted/30 overflow-hidden">
              <Image
                src={getProductImageUrl(p.id, p.image_path)}
                alt={p.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover vyapar-gentle-transition"
                priority={idx === 0}
                loading={idx === 0 ? "eager" : "lazy"}
                unoptimized
              />
            </div>
            <CardHeader className="space-y-3">
              <CardTitle className="text-lg leading-snug">{p.name}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="vyapar-chip vyapar-gentle-transition">{p.category}</Badge>
                <Badge variant="secondary" className="gap-2 vyapar-chip vyapar-gentle-transition">
                  <Truck className="h-3.5 w-3.5" /> India Post delivery
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Seller:</span> {p.seller_name}
                </div>
                <div className="text-xl font-semibold">
                  ₹{Number(p.price).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="vyapar-chip vyapar-gentle-transition">Cash on Delivery</Badge>
              </div>
            <Button asChild className="w-full bg-primary hover:bg-primary/90 vyapar-gentle-transition">
              <Link href={`/market/product/${p.id}`}>View seller & product</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-sm text-muted-foreground leading-relaxed text-center">
        Trusted delivery across Bharat — checkout and tracking powered by India Post.
      </div>
    </div>
    </>
  );
}
