"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Star,
  RotateCcw,
  Settings,
  Boxes,
  LogOut,
} from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAuth, requireRole } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sellerName, setSellerName] = useState<string>("");

  useEffect(() => {
    async function checkAuth() {
      try {
        const userId = await requireAuth();
        await requireRole("seller");
        
        // Get seller profile name
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("id", userId)
          .single();
        
        setSellerName(profile?.full_name || "Seller");
      } catch {
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  const navItems = [
    { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/seller/products", label: "Products", icon: Package },
    { href: "/seller/orders", label: "Orders", icon: ShoppingBag },
    { href: "/seller/inventory", label: "Inventory", icon: Boxes },
    { href: "/seller/analytics", label: "Analytics", icon: TrendingUp },
    { href: "/seller/payouts", label: "Payouts", icon: DollarSign },
    { href: "/seller/reviews", label: "Reviews", icon: Star },
    { href: "/seller/returns", label: "Returns", icon: RotateCcw },
    { href: "/seller/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b p-4">
            <h1 className="text-lg font-semibold">VYAPAR Seller</h1>
            <p className="text-xs text-muted-foreground">{sellerName}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6">{children}</div>
      </main>
    </div>
  );
}
