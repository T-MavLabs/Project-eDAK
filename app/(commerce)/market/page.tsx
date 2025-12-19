import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Truck } from "lucide-react";

import { mockProducts } from "@/lib/mockProducts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/aceternity/AnimatedCard";
import { AnimatedText } from "@/components/aceternity/AnimatedText";
import { Spotlight } from "@/components/aceternity/Spotlight";

export default function MarketPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 relative overflow-hidden">
      {/* Spotlight background effect */}
      <Spotlight className="top-0 left-0 opacity-20" />
      
      <div className="relative z-10">
        <AnimatedText type="slide" delay={0}>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight mb-2">
            <ShoppingBag className="h-5 w-5 text-primary aceternity-float" />
            <span className="aceternity-gradient-text">Marketplace (Demo)</span>
          </h1>
        </AnimatedText>
        <AnimatedText type="fade" delay={100}>
          <p className="text-sm text-muted-foreground">
            A lightweight Indian e-commerce demo showing how external platforms can generate India Post tracking IDs
            and plug into the smart tracking flow.
          </p>
        </AnimatedText>
      </div>

      <AnimatedCard className="mt-6 rounded-lg border bg-background p-5 aceternity-glow" delay={200}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">Trusted delivery</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Orders placed here create a mock shipment and become trackable instantly via the India Post tracking UI.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-2">
              <Truck className="h-3.5 w-3.5" /> Delivered by India Post
            </Badge>
            <Badge variant="secondary">COD supported on eligible items</Badge>
          </div>
        </div>
      </AnimatedCard>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
        {mockProducts.map((p, idx) => (
          <AnimatedCard 
            key={p.id} 
            className="overflow-hidden aceternity-border-gradient" 
            delay={300 + idx * 50}
          >
            <div className="relative h-44 w-full bg-muted/40 overflow-hidden rounded-t-lg">
              <Image
                src={p.imageSrc}
                alt={p.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-base font-semibold leading-snug mb-2">{p.name}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{p.category}</Badge>
                  {p.deliveredByIndiaPost ? (
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Delivered by India Post
                    </Badge>
                  ) : null}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">From {p.originCity}</div>
                  <div className="text-lg font-semibold text-primary">₹{p.priceInr.toLocaleString("en-IN")}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {p.codAvailable ? (
                    <Badge variant="secondary">COD available</Badge>
                  ) : (
                    <Badge variant="secondary">Prepaid (Mock)</Badge>
                  )}
                </div>
                <Button asChild className="w-full bg-primary hover:bg-primary/90 daksh-press">
                  <Link href={`/market/product/${p.id}`}>View product</Link>
                </Button>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      <div className="mt-8 text-xs text-muted-foreground">
        This marketplace UI is for demo only — no payments, no authentication, and no inventory backend.
      </div>
    </div>
  );
}
