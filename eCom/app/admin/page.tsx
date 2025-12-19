"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Users, Package, DollarSign } from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAdminAuth, isAdminAuthenticated } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingSellers: 0,
    pendingProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Check hardcoded admin auth first
        if (!isAdminAuthenticated()) {
          router.push("/auth/admin-login");
          return;
        }
        
        requireAdminAuth();

        // Load stats
        const [
          sellersResult,
          productsResult,
          usersResult,
          ordersResult,
        ] = await Promise.all([
          supabase
            .from("seller_profiles")
            .select("id", { count: "exact" })
            .eq("verification_status", "pending"),
          supabase
            .from("products")
            .select("id", { count: "exact" })
            .eq("status", "pending_approval"),
          supabase.from("user_profiles").select("id", { count: "exact" }),
          supabase.from("orders").select("total_amount"),
        ]);

        setStats({
          pendingSellers: sellersResult.count || 0,
          pendingProducts: productsResult.count || 0,
          totalUsers: usersResult.count || 0,
          totalRevenue:
            (ordersResult.data as Array<{ total_amount: string | number }> | null)?.reduce(
              (sum, o) => sum + parseFloat(String(o.total_amount || 0)),
              0
            ) || 0,
        });
      } catch (err) {
        console.error("Admin dashboard error:", err);
        router.push("/auth/admin-login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);
  
  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_username");
    router.push("/auth/admin-login");
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform governance and moderation</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Sellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSellers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
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
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Seller Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin/sellers?status=pending">Review Sellers</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/sellers">All Sellers</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Product Moderation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin/products?status=pending_approval">Review Products</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/products">All Products</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Platform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin/orders">All Orders</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/audit">Audit Logs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
