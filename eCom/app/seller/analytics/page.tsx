"use client";

import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, ShoppingBag, Package } from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAuth } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    ordersThisMonth: 0,
    revenueThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const userId = await requireAuth();

      // Get seller profile
      const { data: sellerProfile } = await supabase
        .from("seller_profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (!sellerProfile) return;

      // Type assertion for sellerProfile - handle potential error type
      const seller = (sellerProfile as unknown as { id: string }) || null;
      if (!seller || !seller.id) return;

      // Get seller's products
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("seller_id", seller.id);

      const typedProducts = (products as Array<{ id: string }> | null) || [];
      const productIds = typedProducts.map((p) => p.id);
      const totalProducts = typedProducts.length;

      if (productIds.length === 0) {
        setAnalytics({
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts,
          averageOrderValue: 0,
          ordersThisMonth: 0,
          revenueThisMonth: 0,
        });
        setLoading(false);
        return;
      }

      // Get order items
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("order_id, price_at_purchase, quantity")
        .in("product_id", productIds);

      const typedOrderItems = (orderItems as Array<{ order_id: string; price_at_purchase: string | number; quantity: number }> | null) || [];
      const orderIds = [...new Set(typedOrderItems.map((oi) => oi.order_id))];
      const totalOrders = orderIds.length;

      // Get orders
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total_amount, created_at")
        .in("id", orderIds);

      const typedOrders = (orders as Array<{ id: string; total_amount: string | number; created_at: string }> | null) || [];
      const totalRevenue = typedOrders.reduce((sum, o) => sum + parseFloat(String(o.total_amount || 0)), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // This month's data
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const ordersThisMonth = typedOrders.filter(
        (o) => new Date(o.created_at) >= startOfMonth
      ).length;
      const revenueThisMonth = typedOrders.filter(
        (o) => new Date(o.created_at) >= startOfMonth
      ).reduce((sum, o) => sum + parseFloat(String(o.total_amount || 0)), 0);

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalProducts,
        averageOrderValue,
        ordersThisMonth,
        revenueThisMonth,
      });
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your sales performance and insights</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">
              This month: ₹{analytics.revenueThisMonth.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              This month: {analytics.ordersThisMonth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.averageOrderValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conversion Rate</span>
              <Badge>Coming Soon</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Top Selling Product</span>
              <Badge>Coming Soon</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Return Rate</span>
              <Badge>Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Detailed analytics and charts coming soon. This will include sales trends, product performance, and customer insights.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
