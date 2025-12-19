"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingBag, ShoppingCart, ClipboardList, PackageSearch, BadgeCheck, Store, Shield, LogIn, LogOut, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { getCurrentUserRole, signOut, getCurrentUser, getUserProfile, type UserProfile } from "@/supabase/auth";
import { isAdminAuthenticated } from "@/lib/permissions";
import { supabase } from "@/supabase/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/market", label: "Marketplace", icon: ShoppingBag },
  { href: "/market/cart", label: "Cart", icon: ShoppingCart },
  { href: "/market/orders", label: "Orders", icon: ClipboardList },
] as const;

export function CommerceNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState<"buyer" | "seller" | "admin" | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await checkAuth();
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserProfile(null);
        setUserEmail(null);
        setEmailVerified(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkAuth() {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email || null);
        setEmailVerified(user.email_confirmed_at !== null);
        
        const profile = await getUserProfile(user.id);
        if (profile) {
          setUserProfile(profile);
          setUserRole(profile.role);
        } else {
          const role = await getCurrentUserRole();
          setUserRole(role);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserProfile(null);
        setUserEmail(null);
        setEmailVerified(false);
      }
    } catch {
      setIsAuthenticated(false);
      setUserRole(null);
      setUserProfile(null);
      setUserEmail(null);
      setEmailVerified(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      setIsAuthenticated(false);
      setUserRole(null);
      router.push("/market");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const adminAuth = mounted && isAdminAuthenticated();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/85 vyapar-gentle-transition">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/market" className="flex items-center gap-3 vyapar-gentle-transition">
          <div className="relative h-9 w-9 rounded-lg overflow-hidden vyapar-soft-shadow vyapar-gentle-transition">
            <Image
              src="/VYAPAR.png"
              alt="VYAPAR Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">VYAPAR</div>
            <div className="text-xs text-muted-foreground">
              Powered by India Post (DAKSH)
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium vyapar-gentle-transition",
                  active
                    ? "bg-secondary text-foreground vyapar-soft-shadow"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          <Button asChild variant="outline" className="ml-2 vyapar-gentle-transition">
            <Link href="/track" className="inline-flex items-center gap-2">
              <PackageSearch className="h-4 w-4" /> Track via India Post
            </Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden gap-2 md:inline-flex vyapar-chip vyapar-gentle-transition">
            <BadgeCheck className="h-3.5 w-3.5" /> Powered by India Post (DAKSH)
          </Badge>

          {/* Role-based navigation */}
          {mounted && (
            <>
              {userRole === "seller" && (
                <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                  <Link href="/seller/dashboard">
                    <Store className="h-4 w-4 mr-2" /> Seller Dashboard
                  </Link>
                </Button>
              )}
              {adminAuth && (
                <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                  <Link href="/admin">
                    <Shield className="h-4 w-4 mr-2" /> Admin
                  </Link>
                </Button>
              )}
            </>
          )}

          {/* Auth buttons */}
          {mounted && (
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {userProfile?.full_name 
                        ? userProfile.full_name.split(" ")[0]
                        : userEmail?.split("@")[0] || "Account"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {/* User Info */}
                    <div className="px-2 py-1.5 text-sm">
                      <div className="font-medium truncate">
                        {userProfile?.full_name || userEmail || "User"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {userEmail}
                      </div>
                      {!emailVerified && (
                        <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                          Email not verified
                        </div>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    
                    {/* Profile Edit */}
                    <DropdownMenuItem asChild>
                      <Link href="/account/profile">
                        <User className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    
                    {userRole === "buyer" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/market/orders">My Orders</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {userRole === "seller" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/seller/dashboard">Seller Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/auth/login">
                      <LogIn className="h-4 w-4 mr-2" /> Login
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          )}

          {mounted ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden vyapar-gentle-transition">
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <div className="p-5">
                <SheetHeader>
                  <SheetTitle className="text-base">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-4 grid gap-2">
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium vyapar-gentle-transition",
                          active
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6 grid gap-2">
                  {mounted && userRole === "seller" && (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/seller/dashboard" onClick={() => setOpen(false)}>
                        <Store className="h-4 w-4 mr-2" /> Seller Dashboard
                      </Link>
                    </Button>
                  )}
                  {mounted && adminAuth && (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/admin" onClick={() => setOpen(false)}>
                        <Shield className="h-4 w-4 mr-2" /> Admin Dashboard
                      </Link>
                    </Button>
                  )}
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 vyapar-gentle-transition">
                    <Link href="/track" className="inline-flex items-center gap-2" onClick={() => setOpen(false)}>
                      <PackageSearch className="h-4 w-4" /> Track via India Post
                    </Link>
                  </Button>
                  {mounted && (
                    <div className="mt-4 space-y-2">
                      {isAuthenticated ? (
                        <>
                          <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                            <Link href="/account/profile">
                              <User className="h-4 w-4 mr-2" /> Edit Profile
                            </Link>
                          </Button>
                          {userRole === "buyer" && (
                            <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                              <Link href="/market/orders">My Orders</Link>
                            </Button>
                          )}
                          {userRole === "seller" && (
                            <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                              <Link href="/seller/dashboard">Seller Dashboard</Link>
                            </Button>
                          )}
                          <Button variant="outline" className="w-full" onClick={() => { handleLogout(); setOpen(false); }}>
                            <LogOut className="h-4 w-4 mr-2" /> Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                            <Link href="/auth/login">
                              <LogIn className="h-4 w-4 mr-2" /> Login
                            </Link>
                          </Button>
                          <Button asChild className="w-full" onClick={() => setOpen(false)}>
                            <Link href="/auth/signup">Sign Up</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed mt-4">
                    Integrated with India Post tracking via tracking ID.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          ) : (
            <Button variant="outline" className="md:hidden vyapar-gentle-transition" disabled>
              Menu
            </Button>
          )}
        </div>
      </div>

      <div className="h-1 w-full bg-[linear-gradient(90deg,rgba(255,153,51,0.35)_0%,rgba(198,0,0,0.65)_55%,rgba(19,136,8,0.35)_100%)] vyapar-gentle-transition" />
    </header>
  );
}
