"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, TrendingUp, DollarSign } from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAuth, requireRole } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SellerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const userId = await requireAuth();
        
        // Check and set role if needed (for users who signed up before role was set)
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", userId)
          .single();
        
        const typedProfile = profile as unknown as { role: string } | null;
        if (typedProfile && typedProfile.role !== "seller") {
          // If user has a seller profile but role is not set, update it
          const { data: sellerProfile } = await supabase
            .from("seller_profiles")
            .select("id")
            .eq("id", userId)
            .single();
          
          const typedSellerProfileCheck = sellerProfile as unknown as { id: string } | null;
          if (typedSellerProfileCheck) {
            // User has seller profile but wrong role - fix it
            await supabase
              .from("user_profiles")
              .update({ role: "seller" })
              .eq("id", userId);
          } else {
            // No seller profile - redirect to onboarding
            router.push("/seller/onboarding");
            return;
          }
        }
        
        // Now check role
        await requireRole("seller");

        // Get seller profile
        const { data: sellerProfile } = await supabase
          .from("seller_profiles")
          .select("id")
          .eq("id", userId)
          .single();

        if (!sellerProfile) {
          router.push("/seller/onboarding");
          return;
        }

        // Type assertion for sellerProfile
        const typedSellerProfile = sellerProfile as unknown as { id: string } | null;
        if (!typedSellerProfile || !typedSellerProfile.id) {
          router.push("/seller/onboarding");
          return;
        }

        // Get seller's product IDs
        const sellerId = typedSellerProfile.id;

        const { data: sellerProducts } = await supabase
          .from("products")
          .select("id")
          .eq("seller_id", sellerId);

        const typedSellerProducts = (sellerProducts as Array<{ id: string }> | null) || [];
        const productIds = typedSellerProducts.map((p) => p.id);

        // Load stats
        const [productsResult, orderItemsResult] = await Promise.all([
          supabase
            .from("products")
            .select("id", { count: "exact" })
            .eq("seller_id", sellerId),
          productIds.length > 0
            ? supabase
                .from("order_items")
                .select("order_id")
                .in("product_id", productIds)
            : { data: [], error: null },
        ]);

        const typedOrderItems = (orderItemsResult.data as Array<{ order_id: string }> | null) || [];
        const orderIds = typedOrderItems.map((oi) => oi.order_id);
        const uniqueOrderIds = [...new Set(orderIds)];

        const ordersResult =
          uniqueOrderIds.length > 0
            ? await supabase
                .from("orders")
                .select("id, total_amount, status")
                .in("id", uniqueOrderIds)
            : { data: [], error: null };

        const totalProducts = productsResult.count || 0;
        const orders = (ordersResult.data as Array<{ id: string; total_amount: string | number; status: string }> | null) || [];
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce(
          (sum, o) => sum + parseFloat(String(o.total_amount || 0)),
          0
        );
        const pendingOrders = orders.filter((o) => o.status !== "delivered").length;

        setStats({
          totalProducts,
          totalOrders,
          totalRevenue,
          pendingOrders,
        });
      } catch (err) {
        console.error("Dashboard load error:", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="mb-6 space-y-2">
          <div className="h-8 w-64 rounded-md vyapar-skeleton" />
          <div className="h-4 w-96 rounded-md vyapar-skeleton" />
        </div>
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl vyapar-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 sm:mb-8 vyapar-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="ux4g-headline break-words">Seller dashboard</h1>
            <p className="ux4g-body text-muted-foreground mt-1 break-words">Manage your products, orders, and business</p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 vyapar-gentle-transition min-h-[44px] ux4g-label w-full sm:w-auto flex-shrink-0">
            <Link href="/seller/products/new">+ Add product</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid - Information Dense */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>
        <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition" style={{ animationDelay: "50ms" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>
        <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition" style={{ animationDelay: "100ms" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">₹{stats.totalRevenue.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition" style={{ animationDelay: "150ms" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Structured Layout */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition">
          <CardHeader>
            <CardTitle className="ux4g-title">Products</CardTitle>
            <p className="ux4g-body text-muted-foreground mt-1">Manage your product catalog</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full bg-primary hover:bg-primary/90 vyapar-gentle-transition min-h-[44px] ux4g-label">
              <Link href="/seller/products">View all products</Link>
            </Button>
            <Button asChild variant="outline" className="w-full vyapar-gentle-transition min-h-[44px] ux4g-label">
              <Link href="/seller/products/new">Add new product</Link>
            </Button>
            <Button asChild variant="outline" className="w-full vyapar-gentle-transition min-h-[44px] ux4g-label">
              <Link href="/seller/inventory">Manage inventory</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="ux4g-title">Orders</CardTitle>
            <p className="ux4g-body text-muted-foreground mt-1">Track and fulfill orders</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full bg-primary hover:bg-primary/90 vyapar-gentle-transition min-h-[44px] ux4g-label">
              <Link href="/seller/orders">View all orders</Link>
            </Button>
            <Button asChild variant="outline" className="w-full vyapar-gentle-transition min-h-[44px] ux4g-label">
              <Link href="/seller/orders?status=placed">Pending orders ({stats.pendingOrders})</Link>
            </Button>
            <Button asChild variant="outline" className="w-full vyapar-gentle-transition min-h-[44px] ux4g-label">
              <Link href="/seller/returns">Returns & refunds</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="ux4g-title">Business</CardTitle>
            <p className="ux4g-body text-muted-foreground mt-1">Analytics and payouts</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full vyapar-gentle-transition min-h-[44px] ux4g-label">
              <Link href="/seller/analytics">View analytics</Link>
            </Button>
            <Button asChild variant="outline" className="w-full vyapar-gentle-transition min-h-[44px] ux4g-label">
              <Link href="/seller/payouts">Payouts & earnings</Link>
            </Button>
            <Button asChild variant="outline" className="w-full vyapar-gentle-transition min-h-[44px] ux4g-label">
              <Link href="/seller/settings">Account settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
