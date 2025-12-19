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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Check hardcoded admin auth first
        if (!isAdminAuthenticated()) {
          router.push("/auth/admin-login");
          return;
        }
        
        requireAdminAuth();

        // Load stats - handle errors gracefully for tables that might not exist
        // Query sellers: count pending sellers (both in seller_profiles and users with seller role but no profile)
        let pendingSellers = 0;
        try {
          // Count seller_profiles with pending/under_review status
          const { data: allSellers, error: sellersError } = await supabase
            .from("seller_profiles")
            .select("verification_status");
          
          if (sellersError) {
            console.error("Seller profiles query error:", sellersError);
            // Try with count query as fallback
            const { count, error: countError } = await supabase
              .from("seller_profiles")
              .select("id", { count: "exact", head: true })
              .in("verification_status", ["pending", "under_review"]);
            
            if (!countError && count !== null) {
              pendingSellers = count;
            }
          } else if (allSellers) {
            // Filter in memory - more reliable
            pendingSellers = allSellers.filter(
              (s: any) => s.verification_status === "pending" || s.verification_status === "under_review"
            ).length;
          }
          
          // Also count users with seller role who haven't completed onboarding (no seller_profiles entry)
          const { data: sellerUsers, error: sellerUsersError } = await supabase
            .from("user_profiles")
            .select("id")
            .eq("role", "seller");
          
          if (!sellerUsersError && sellerUsers) {
            const sellerUserIds = sellerUsers.map((u: any) => u.id);
            
            if (sellerUserIds.length > 0) {
              // Check which seller users don't have a seller_profiles entry
              const { data: existingProfiles } = await supabase
                .from("seller_profiles")
                .select("id")
                .in("id", sellerUserIds);
              
              const existingProfileIds = (existingProfiles || []).map((p: any) => p.id);
              const sellersWithoutProfile = sellerUserIds.filter(
                (id: string) => !existingProfileIds.includes(id)
              );
              
              // Add sellers who haven't completed onboarding
              pendingSellers += sellersWithoutProfile.length;
            }
          }
        } catch (err) {
          console.error("Exception in seller query:", err);
        }

        // Query other stats
        const [
          productsResult,
          usersResult,
          ordersResult,
        ] = await Promise.allSettled([
          supabase
            .from("products")
            .select("id", { count: "exact" })
            .eq("status", "pending_approval"),
          supabase.from("user_profiles").select("id", { count: "exact" }),
          supabase.from("orders").select("total_amount"),
        ]);

        const pendingProducts =
          productsResult.status === "fulfilled" && !productsResult.value.error
            ? productsResult.value.count || 0
            : 0;

        const totalUsers =
          usersResult.status === "fulfilled" && !usersResult.value.error
            ? usersResult.value.count || 0
            : 0;

        const totalRevenue =
          ordersResult.status === "fulfilled" &&
          !ordersResult.value.error &&
          ordersResult.value.data
            ? (ordersResult.value.data as Array<{ total_amount: string | number }>).reduce(
                (sum, o) => sum + parseFloat(String(o.total_amount || 0)),
                0
              )
            : 0;

        setStats({
          pendingSellers,
          pendingProducts,
          totalUsers,
          totalRevenue,
        });
        setError(null);
      } catch (err) {
        console.error("Admin dashboard error:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        // Don't redirect on error, just show the error
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    // Trigger reload by updating a dependency or calling loadDashboard
    window.location.reload();
  };
  
  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_username");
    router.push("/auth/admin-login");
  };

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
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 vyapar-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Platform governance, moderation, and analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} className="vyapar-gentle-transition">
              Refresh
            </Button>
            <Button variant="outline" onClick={handleLogout} className="vyapar-gentle-transition">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive vyapar-fade-in">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Stats Grid - Information Dense */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Sellers</CardTitle>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.pendingSellers}</div>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>
        <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition" style={{ animationDelay: "50ms" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Products</CardTitle>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.pendingProducts}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition" style={{ animationDelay: "100ms" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition" style={{ animationDelay: "150ms" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">₹{stats.totalRevenue.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">Platform revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Structured Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition">
          <CardHeader>
            <CardTitle className="text-lg">Seller Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Verify and manage sellers</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full bg-primary hover:bg-primary/90 vyapar-gentle-transition">
              <Link href="/admin/sellers?status=pending">Review Sellers ({stats.pendingSellers})</Link>
            </Button>
            <Button asChild variant="outline" className="w-full vyapar-gentle-transition">
              <Link href="/admin/sellers">View All Sellers</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Product Moderation</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Approve and moderate products</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full bg-primary hover:bg-primary/90 vyapar-gentle-transition">
              <Link href="/admin/products?status=pending_approval">Review Products ({stats.pendingProducts})</Link>
            </Button>
            <Button asChild variant="outline" className="w-full vyapar-gentle-transition">
              <Link href="/admin/products">View All Products</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Platform Operations</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Orders and audit logs</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full vyapar-gentle-transition">
              <Link href="/admin/orders">View All Orders</Link>
            </Button>
            <Button asChild variant="outline" className="w-full vyapar-gentle-transition">
              <Link href="/admin/audit">Audit Logs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
