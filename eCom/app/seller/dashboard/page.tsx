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
        
        if (profile && profile.role !== "seller") {
          // If user has a seller profile but role is not set, update it
          const { data: sellerProfile } = await supabase
            .from("seller_profiles")
            .select("id")
            .eq("id", userId)
            .single();
          
          if (sellerProfile) {
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

        // Get seller's product IDs
        const { data: sellerProducts } = await supabase
          .from("products")
          .select("id")
          .eq("seller_id", sellerProfile.id);

        const productIds = sellerProducts?.map((p) => p.id) || [];

        // Load stats
        const [productsResult, orderItemsResult] = await Promise.all([
          supabase
            .from("products")
            .select("id", { count: "exact" })
            .eq("seller_id", sellerProfile.id),
          productIds.length > 0
            ? supabase
                .from("order_items")
                .select("order_id")
                .in("product_id", productIds)
            : { data: [], error: null },
        ]);

        const orderIds =
          orderItemsResult.data?.map((oi) => oi.order_id) || [];
        const uniqueOrderIds = [...new Set(orderIds)];

        const ordersResult =
          uniqueOrderIds.length > 0
            ? await supabase
                .from("orders")
                .select("id, total_amount, status")
                .in("id", uniqueOrderIds)
            : { data: [], error: null };

        const totalProducts = productsResult.count || 0;
        const orders = ordersResult.data || [];
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
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Seller Dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage your products and orders</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString("en-IN")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/seller/products">Manage Products</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/seller/products/new">Add New Product</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/seller/orders">View All Orders</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/seller/orders?status=placed">Pending Orders</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/seller/inventory">Inventory</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/seller/analytics">Analytics</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/seller/payouts">Payouts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
