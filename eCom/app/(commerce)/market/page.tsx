import Image from "next/image";
import Link from "next/link";
import { Search, Truck, Filter, ChevronRight } from "lucide-react";

import { fetchActiveProducts } from "@/supabase/queries";
import { getProductImageUrl } from "@/supabase/storage";
import { SellerRedirect } from "@/components/SellerRedirect";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SortSelect } from "@/components/market/SortSelect";

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const allProducts = await fetchActiveProducts().catch(() => []);
  
  // Filter products
  let products = allProducts;
  const categoryFilter = params.category && typeof params.category === "string" ? params.category : null;
  if (categoryFilter) {
    products = products.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());
  }
  if (params.search && typeof params.search === "string") {
    const searchLower = params.search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      p.description.toLowerCase().includes(searchLower) ||
      p.seller_name.toLowerCase().includes(searchLower)
    );
  }

  // Sort products
  if (params.sort === "price-low") {
    products = [...products].sort((a, b) => Number(a.price) - Number(b.price));
  } else if (params.sort === "price-high") {
    products = [...products].sort((a, b) => Number(b.price) - Number(a.price));
  } else if (params.sort === "name") {
    products = [...products].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get unique categories
  const categories = Array.from(new Set(allProducts.map(p => p.category))).sort();

  return (
    <>
      <SellerRedirect />
      <div className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        <div className="border-b bg-muted/30">
          <div className="mx-auto w-full max-w-7xl px-4 py-3">
            <nav className="flex items-center gap-2 ux4g-body-small text-muted-foreground" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-foreground vyapar-gentle-transition min-h-[44px] inline-flex items-center">Home</Link>
              <ChevronRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="text-foreground font-medium ux4g-label">Marketplace</span>
              {categoryFilter && (
                <>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span className="text-foreground font-medium ux4g-label">{categoryFilter}</span>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Search Bar - Prominent Amazon/Flipkart Style */}
        <div className="sticky top-[73px] z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
          <div className="mx-auto w-full max-w-7xl px-4 py-4">
            <form action="/market" method="get" className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  name="search"
                  placeholder="Search for products, sellers, or categories..."
                  defaultValue={params.search}
                  className="pl-10 h-11 text-base"
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90 h-11 px-6">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 py-6">
          <div className="flex gap-6">
            {/* Filters Sidebar - Amazon Style */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-[185px] space-y-6">
                <Card className="vyapar-card p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
                    <h3 className="ux4g-label font-semibold">Filters</h3>
                  </div>
                  
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <div className="ux4g-label font-semibold text-muted-foreground">Category</div>
                    <div className="space-y-2">
                      <Link
                        href="/market"
                        className={`block ux4g-body-small py-2 px-2 rounded-md vyapar-gentle-transition min-h-[44px] flex items-center ${
                          !params.category
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        All categories
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat}
                          href={`/market?category=${encodeURIComponent(cat)}${params.search && typeof params.search === "string" ? `&search=${encodeURIComponent(params.search)}` : ""}`}
                          className={`block ux4g-body-small py-2 px-2 rounded-md vyapar-gentle-transition min-h-[44px] flex items-center ${
                            categoryFilter === cat
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {cat}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <Truck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <div className="ux4g-body-small">
                        <div className="ux4g-label font-semibold text-foreground mb-1">Delivered by India Post</div>
                        <div className="text-muted-foreground">Nationwide delivery with real-time tracking</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="ux4g-title">
                    {categoryFilter ? categoryFilter : "All products"}
                  </h1>
                  <p className="ux4g-body-small text-muted-foreground mt-1">
                    {products.length} {products.length === 1 ? "product" : "products"} found
                    {params.search && typeof params.search === "string" && ` for "${params.search}"`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SortSelect defaultValue={params.sort} />
                </div>
              </div>

              {/* Products Grid - Amazon/Flipkart Style Compact Cards */}
              {products.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((p, idx) => (
                    <Card
                      key={p.id}
                      className="overflow-hidden vyapar-card vyapar-fade-in group hover:shadow-lg vyapar-gentle-transition flex flex-col h-full"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <Link href={`/market/product/${p.id}`} className="block flex flex-col h-full">
                        <div className="relative h-48 w-full bg-muted/30 overflow-hidden flex-shrink-0">
                          <Image
                            src={getProductImageUrl(p.id, p.image_path)}
                            alt={p.name}
                            fill
                            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover vyapar-gentle-transition group-hover:scale-105"
                            loading="lazy"
                            unoptimized
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="gap-1 vyapar-chip bg-white/95 backdrop-blur-sm ux4g-body-small px-2 py-0.5">
                              <Truck className="h-3 w-3 text-primary" aria-hidden="true" />
                              India Post
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4 flex flex-col flex-1">
                          {/* Title and Category - Fixed height area */}
                          <div className="mb-3 min-h-[3.5rem]">
                            <h3 className="ux4g-label font-semibold leading-snug line-clamp-2 mb-2 group-hover:text-primary vyapar-gentle-transition">
                              {p.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="vyapar-chip ux4g-body-small px-2 py-0">{p.category}</Badge>
                            </div>
                          </div>

                          {/* Seller Info - Fixed height */}
                          <div className="mb-3 min-h-[1.5rem]">
                            <div className="ux4g-body-small text-muted-foreground truncate">{p.seller_name}</div>
                          </div>

                          {/* Price - Fixed position, always aligned */}
                          <div className="mb-3 flex-shrink-0">
                            <div className="ux4g-title text-primary">₹{Number(p.price).toLocaleString("en-IN")}</div>
                          </div>

                          {/* Delivery Info - Fixed height */}
                          <div className="mb-3 min-h-[1.25rem] flex-shrink-0">
                            <div className="ux4g-body-small text-muted-foreground">
                              Delivery: 5-7 days via India Post
                            </div>
                          </div>

                          {/* Payment badges - Push to bottom */}
                          <div className="flex items-center gap-1.5 pt-2 border-t mt-auto">
                            <Badge variant="secondary" className="vyapar-chip ux4g-body-small px-2 py-0">COD</Badge>
                            <Badge variant="secondary" className="vyapar-chip ux4g-body-small px-2 py-0">Free delivery</Badge>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="vyapar-card p-12 text-center">
                  <div className="space-y-4">
                    <div className="text-4xl" role="img" aria-label="Empty box">📦</div>
                    <div>
                      <h3 className="ux4g-title mb-2">No products found</h3>
                      <p className="ux4g-body text-muted-foreground mb-4">
                        {params.search || categoryFilter
                          ? "Try adjusting your search or filters"
                          : "No products available at the moment"}
                      </p>
                      {(params.search || categoryFilter) && (
                        <Button asChild variant="outline" className="min-h-[44px] ux4g-label">
                          <Link href="/market">Clear filters</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Trust Footer */}
              <div className="mt-10 pt-6 border-t">
                <div className="flex flex-wrap items-center justify-center gap-6 ux4g-body-small text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>Delivered by India Post</span>
                  </div>
                  <div aria-hidden="true">•</div>
                  <div>Nationwide delivery</div>
                  <div aria-hidden="true">•</div>
                  <div>Real-time tracking</div>
                  <div aria-hidden="true">•</div>
                  <div>Cash on delivery available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
