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
  Menu,
} from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAuth, requireRole } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sellerName, setSellerName] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        
        const typedProfile = profile as unknown as { full_name: string | null } | null;
        setSellerName(typedProfile?.full_name || "Seller");
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

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      {/* Header */}
      <div className="border-b p-4">
        <h1 className="ux4g-title">VYAPAR Seller</h1>
        <p className="ux4g-body-small text-muted-foreground mt-1">{sellerName}</p>
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
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 ux4g-label font-medium transition-colors min-h-[44px]",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start min-h-[44px] ux4g-label"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex w-64 border-r bg-card flex-shrink-0">
        <div className="flex h-full flex-col w-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="ux4g-title">VYAPAR Seller</h1>
            <p className="ux4g-body-small text-muted-foreground">{sellerName}</p>
          </div>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]">
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation menu</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:ml-0 pt-16 lg:pt-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:p-6 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
