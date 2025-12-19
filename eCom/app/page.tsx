import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Store, Shield, ArrowRight, PackageSearch, Truck, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SellerRedirect } from "@/components/SellerRedirect";
import { fetchActiveProducts } from "@/supabase/queries";
import { getProductImageUrl } from "@/supabase/storage";

export default async function Home() {
  const featuredProducts = await fetchActiveProducts().catch(() => []).then(products => products.slice(0, 6));

  // Extract unique categories from products
  const categories = Array.from(new Set(featuredProducts.map(p => p.category))).slice(0, 4);

  return (
    <>
      <SellerRedirect />
      <div className="min-h-screen bg-background">
        {/* Hero Section - Above the Fold */}
        <section className="border-b bg-gradient-to-b from-background via-background to-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center vyapar-fade-in">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="relative h-20 w-20 rounded-xl overflow-hidden vyapar-soft-shadow">
                  <Image
                    src="/VYAPAR.png"
                    alt="VYAPAR Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="text-left">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">VYAPAR</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">Virtual Yet Accessible Postal Aggregated Retail</p>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-balance">
                Shop from Indian MSMEs. Delivered by India Post.
              </h2>
              <p className="text-lg text-muted-foreground mb-8 text-pretty leading-relaxed">
                Trusted e-commerce platform connecting buyers with verified Indian sellers. Every order is tracked end-to-end through India Post's nationwide delivery network.
              </p>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                <Badge variant="secondary" className="gap-2 px-4 py-1.5 vyapar-chip">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Powered by India Post (DAKSH)
                </Badge>
                <Badge variant="secondary" className="gap-2 px-4 py-1.5 vyapar-chip">
                  <Truck className="h-4 w-4 text-primary" />
                  Nationwide Delivery
                </Badge>
                <Badge variant="secondary" className="gap-2 px-4 py-1.5 vyapar-chip">
                  <PackageSearch className="h-4 w-4 text-primary" />
                  Real-time Tracking
                </Badge>
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 vyapar-gentle-transition">
                  <Link href="/market">
                    Explore Marketplace
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto vyapar-gentle-transition">
                  <Link href="/track">
                    <PackageSearch className="h-4 w-4 mr-2" />
                    Track Your Order
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto vyapar-gentle-transition">
                  <Link href="/auth/signup">
                    <Store className="h-4 w-4 mr-2" />
                    Start Selling
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Credibility Strip */}
        <section className="border-b bg-muted/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="vyapar-fade-in">
                <div className="text-2xl font-semibold text-primary mb-1">India Post</div>
                <div className="text-sm text-muted-foreground">Official Delivery Partner</div>
              </div>
              <div className="vyapar-fade-in" style={{ animationDelay: "100ms" }}>
                <div className="text-2xl font-semibold mb-1">Pan-India</div>
                <div className="text-sm text-muted-foreground">Nationwide Reach</div>
              </div>
              <div className="vyapar-fade-in" style={{ animationDelay: "200ms" }}>
                <div className="text-2xl font-semibold mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Order Tracking</div>
              </div>
              <div className="vyapar-fade-in" style={{ animationDelay: "300ms" }}>
                <div className="text-2xl font-semibold mb-1">Verified</div>
                <div className="text-sm text-muted-foreground">MSME Sellers</div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Overview */}
        {categories.length > 0 && (
          <section className="border-b bg-background py-16">
            <div className="mx-auto w-full max-w-6xl px-4">
              <div className="mb-10 vyapar-slide-up">
                <div className="vyapar-kicker">Browse by Category</div>
                <h3 className="text-2xl font-semibold tracking-tight mt-2 mb-3">Shop by what you need</h3>
                <p className="text-muted-foreground max-w-2xl">
                  Discover products from verified Indian sellers across multiple categories. Every purchase supports local livelihoods.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category, idx) => (
                  <Link
                    key={category}
                    href={`/market?category=${encodeURIComponent(category)}`}
                    className="vyapar-card p-6 vyapar-fade-in vyapar-gentle-transition hover:shadow-lg"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="text-lg font-semibold mb-2">{category}</div>
                    <div className="text-sm text-muted-foreground mb-4">Explore products</div>
                    <div className="flex items-center text-xs text-primary">
                      <ArrowRight className="h-3.5 w-3.5 mr-1" />
                      View category
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="border-b bg-muted/20 py-16">
            <div className="mx-auto w-full max-w-6xl px-4">
              <div className="mb-10 vyapar-slide-up">
                <div className="vyapar-kicker">Featured Products</div>
                <h3 className="text-2xl font-semibold tracking-tight mt-2 mb-3">Handpicked from Indian sellers</h3>
                <p className="text-muted-foreground max-w-2xl">
                  Every product comes with a story. Support Indian MSMEs building sustainable livelihoods.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.map((product, idx) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden vyapar-card vyapar-fade-in group"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <Link href={`/market/product/${product.id}`}>
                      <div className="relative h-48 w-full bg-muted/30 overflow-hidden">
                        <Image
                          src={getProductImageUrl(product.id, product.image_path)}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover vyapar-gentle-transition group-hover:scale-105"
                          loading="lazy"
                          unoptimized
                        />
                      </div>
                      <CardHeader className="space-y-2">
                        <CardTitle className="text-lg leading-snug line-clamp-2">{product.name}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="vyapar-chip text-xs">{product.category}</Badge>
                          <Badge variant="secondary" className="gap-1.5 vyapar-chip text-xs">
                            <Truck className="h-3 w-3" />
                            India Post
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">From {product.seller_name}</div>
                          <div className="text-xl font-semibold">₹{Number(product.price).toLocaleString("en-IN")}</div>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90 vyapar-gentle-transition" size="sm">
                          View Product
                        </Button>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
              <div className="mt-10 text-center">
                <Button asChild variant="outline" size="lg" className="vyapar-gentle-transition">
                  <Link href="/market">
                    View All Products
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Why India Post Section */}
        <section className="border-b bg-background py-16">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="mb-10 vyapar-slide-up">
              <div className="vyapar-kicker">Why India Post Logistics</div>
              <h3 className="text-2xl font-semibold tracking-tight mt-2 mb-3">Reliable delivery across India</h3>
              <p className="text-muted-foreground max-w-2xl">
                India Post's extensive network ensures your orders reach every corner of the country, from metros to remote villages.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="vyapar-card vyapar-fade-in">
                <CardHeader>
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Nationwide Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    India Post reaches over 1.5 lakh post offices across India, ensuring delivery to even the most remote locations.
                  </p>
                </CardContent>
              </Card>
              <Card className="vyapar-card vyapar-fade-in" style={{ animationDelay: "100ms" }}>
                <CardHeader>
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 mb-4">
                    <PackageSearch className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Real-time Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Track your order from dispatch to delivery with detailed updates at every stage of the journey.
                  </p>
                </CardContent>
              </Card>
              <Card className="vyapar-card vyapar-fade-in" style={{ animationDelay: "200ms" }}>
                <CardHeader>
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 mb-4">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Trusted & Secure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Government-backed logistics with secure handling and reliable delivery timelines you can count on.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How Delivery Works */}
        <section className="border-b bg-muted/20 py-16">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="mb-10 vyapar-slide-up">
              <div className="vyapar-kicker">How It Works</div>
              <h3 className="text-2xl font-semibold tracking-tight mt-2 mb-3">Simple delivery process</h3>
              <p className="text-muted-foreground max-w-2xl">
                From order placement to doorstep delivery, here's how your purchase journey works.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-4">
              {[
                { step: "1", title: "Place Order", desc: "Browse products and complete checkout" },
                { step: "2", title: "Seller Ships", desc: "Seller prepares and dispatches via India Post" },
                { step: "3", title: "In Transit", desc: "Track your order in real-time as it moves" },
                { step: "4", title: "Delivered", desc: "Receive at your doorstep, COD or prepaid" },
              ].map((item, idx) => (
                <div key={item.step} className="vyapar-fade-in text-center" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold mb-4">
                    {item.step}
                  </div>
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Role Selection - For Quick Access */}
        <section className="bg-background py-16">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="mb-10 vyapar-slide-up text-center">
              <h3 className="text-2xl font-semibold tracking-tight mb-3">Get Started</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose your role to begin your journey with VYAPAR
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10">
                      <ShoppingBag className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>I'm a Buyer</CardTitle>
                  </div>
                  <CardDescription>
                    Browse and purchase products from verified Indian MSME sellers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 vyapar-gentle-transition">
                    <Link href="/market">
                      Browse Marketplace
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <div className="text-xs text-muted-foreground text-center">
                    <Link href="/auth/login" className="hover:text-foreground vyapar-gentle-transition">Already have an account?</Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition" style={{ animationDelay: "100ms" }}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>I'm a Seller (MSME)</CardTitle>
                  </div>
                  <CardDescription>
                    List your products, manage inventory, and reach customers nationwide
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="default" className="w-full bg-primary hover:bg-primary/90 vyapar-gentle-transition">
                    <Link href="/auth/signup">
                      Become a Seller
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <div className="text-xs text-muted-foreground text-center">
                    <Link href="/auth/login" className="hover:text-foreground vyapar-gentle-transition">Already registered?</Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition" style={{ animationDelay: "200ms" }}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Admin Access</CardTitle>
                  </div>
                  <CardDescription>
                    Platform governance, seller verification, and product moderation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" className="w-full vyapar-gentle-transition">
                    <Link href="/auth/admin-login">
                      Admin Login
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <div className="text-xs text-muted-foreground text-center">
                    <span className="font-mono">admin / admin123</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
