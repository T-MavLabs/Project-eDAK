"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingBag, ShoppingCart, ClipboardList, PackageSearch, BadgeCheck, Store, Shield, LogIn, LogOut, User, Home } from "lucide-react";

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
import { GovernmentBanner } from "@/components/GovernmentBanner";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/market", label: "Marketplace", icon: ShoppingBag },
  { href: "/market/orders", label: "Orders", icon: ClipboardList },
  { href: "/track", label: "Track", icon: PackageSearch },
];

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
    
    // Check session first (faster than getUser)
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Set basic info immediately from session
          setIsAuthenticated(true);
          setUserEmail(session.user.email || null);
          setEmailVerified(session.user.email_confirmed_at !== null);
          
          // Fetch profile (which includes role)
          getUserProfile(session.user.id).then((profile) => {
            if (profile) {
              setUserProfile(profile);
              setUserRole(profile.role);
            }
          }).catch(() => {
            // If profile fetch fails, still show user as authenticated
            setUserRole(null);
          });
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
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || null);
          setEmailVerified(session.user.email_confirmed_at !== null);
          
          // Fetch profile (which includes role)
          getUserProfile(session.user.id).then((profile) => {
            if (profile) {
              setUserProfile(profile);
              setUserRole(profile.role);
            }
          }).catch(() => {
            setUserRole(null);
          });
        }
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
      // Use getSession instead of getUser for faster initial check
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);
        setEmailVerified(session.user.email_confirmed_at !== null);
        
        // Fetch profile (which includes role)
        const profile = await getUserProfile(session.user.id);
        if (profile) {
          setUserProfile(profile);
          setUserRole(profile.role);
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
    <div className="sticky top-0 z-50">
      <GovernmentBanner />
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 vyapar-gentle-transition">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4">
        {/* Logo - Left */}
        <Link href="/" className="flex items-center gap-3 vyapar-gentle-transition" aria-label="VYAPAR Home">
          <div className="relative h-10 w-10 rounded-lg overflow-hidden vyapar-soft-shadow vyapar-gentle-transition">
            <Image
              src="/VYAPAR.png"
              alt="VYAPAR Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="ux4g-label font-semibold tracking-tight">VYAPAR</div>
            <div className="ux4g-body-small text-muted-foreground">
              Powered by India Post (DAKSH)
            </div>
          </div>
        </Link>

        {/* Primary Navigation - Center-left */}
        <nav className="hidden items-center gap-1 lg:flex flex-1 justify-center lg:justify-start lg:ml-8" aria-label="Main navigation">
          {navItems.map((item) => {
            let active = false;
            if (item.href === "/") {
              active = pathname === "/";
            } else if (item.href === "/market") {
              // Only active for /market, not for /market/orders, /market/cart, etc.
              active = pathname === "/market" || (pathname?.startsWith("/market/") && !pathname?.startsWith("/market/orders") && !pathname?.startsWith("/market/cart") && !pathname?.startsWith("/market/checkout") && !pathname?.startsWith("/market/product"));
            } else if (item.href === "/market/orders") {
              active = pathname === "/market/orders" || pathname?.startsWith("/market/orders/");
            } else if (item.href === "/track") {
              active = pathname === "/track" || pathname?.startsWith("/track/");
            } else {
              active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            }
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 ux4g-label font-medium vyapar-gentle-transition min-h-[44px]",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions - Right */}
        <div className="flex items-center gap-2">
          {/* Cart Button */}
          <Button 
            asChild 
            variant="outline" 
            size="sm" 
            className="hidden md:inline-flex min-h-[44px] vyapar-gentle-transition"
            aria-label="Shopping cart"
          >
            <Link href="/market/cart" className="inline-flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              <span className="ux4g-label">Cart</span>
            </Link>
          </Button>

          {/* Role-based navigation */}
          {mounted && (
            <>
              {userRole === "seller" && (
                <Button asChild variant="outline" size="sm" className="hidden md:inline-flex min-h-[44px] ux4g-label">
                  <Link href="/seller/dashboard">
                    <Store className="h-4 w-4 mr-2" aria-hidden="true" /> Seller dashboard
                  </Link>
                </Button>
              )}
              {adminAuth && (
                <Button asChild variant="outline" size="sm" className="hidden md:inline-flex min-h-[44px] ux4g-label">
                  <Link href="/admin">
                    <Shield className="h-4 w-4 mr-2" aria-hidden="true" /> Admin
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
                    <Button variant="outline" size="sm" className="min-h-[44px] ux4g-label">
                      <User className="h-4 w-4 mr-2" aria-hidden="true" />
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
                      <Link href="/account/profile" className="ux4g-label">
                        <User className="h-4 w-4 mr-2" aria-hidden="true" />
                        Edit profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    
                    {userRole === "buyer" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/market/orders" className="ux4g-label">My orders</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {userRole === "seller" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/seller/dashboard" className="ux4g-label">Seller dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="ux4g-label">
                      <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" className="min-h-[44px] ux4g-label">
                    <Link href="/auth/login">
                      <LogIn className="h-4 w-4 mr-2" aria-hidden="true" /> Login
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="min-h-[44px] ux4g-label">
                    <Link href="/auth/signup">Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          )}

          {mounted ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden vyapar-gentle-transition min-h-[44px] min-w-[44px]" aria-label="Open menu">
                <span className="ux4g-label">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <div className="p-5">
                <SheetHeader>
                  <SheetTitle className="ux4g-title">Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-4 grid gap-2" aria-label="Mobile navigation">
                  {navItems.map((item) => {
                    let active = false;
                    if (item.href === "/") {
                      active = pathname === "/";
                    } else if (item.href === "/market") {
                      // Only active for /market, not for /market/orders, /market/cart, etc.
                      active = pathname === "/market" || (pathname?.startsWith("/market/") && !pathname?.startsWith("/market/orders") && !pathname?.startsWith("/market/cart") && !pathname?.startsWith("/market/checkout") && !pathname?.startsWith("/market/product"));
                    } else if (item.href === "/market/orders") {
                      active = pathname === "/market/orders" || pathname?.startsWith("/market/orders/");
                    } else if (item.href === "/track") {
                      active = pathname === "/track" || pathname?.startsWith("/track/");
                    } else {
                      active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    }
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 ux4g-label font-medium vyapar-gentle-transition min-h-[44px]",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-6 grid gap-2">
                  <Button asChild variant="outline" className="w-full min-h-[44px] ux4g-label" onClick={() => setOpen(false)}>
                    <Link href="/market/cart">
                      <ShoppingCart className="h-4 w-4 mr-2" aria-hidden="true" /> Cart
                    </Link>
                  </Button>
                  {mounted && userRole === "seller" && (
                    <Button asChild variant="outline" className="w-full min-h-[44px] ux4g-label">
                      <Link href="/seller/dashboard" onClick={() => setOpen(false)}>
                        <Store className="h-4 w-4 mr-2" aria-hidden="true" /> Seller dashboard
                      </Link>
                    </Button>
                  )}
                  {mounted && adminAuth && (
                    <Button asChild variant="outline" className="w-full min-h-[44px] ux4g-label">
                      <Link href="/admin" onClick={() => setOpen(false)}>
                        <Shield className="h-4 w-4 mr-2" aria-hidden="true" /> Admin dashboard
                      </Link>
                    </Button>
                  )}
                  {mounted && (
                    <div className="mt-4 space-y-2">
                      {isAuthenticated ? (
                        <>
                          <Button asChild variant="outline" className="w-full min-h-[44px] ux4g-label" onClick={() => setOpen(false)}>
                            <Link href="/account/profile">
                              <User className="h-4 w-4 mr-2" aria-hidden="true" /> Edit profile
                            </Link>
                          </Button>
                          {userRole === "buyer" && (
                            <Button asChild variant="outline" className="w-full min-h-[44px] ux4g-label" onClick={() => setOpen(false)}>
                              <Link href="/market/orders">My orders</Link>
                            </Button>
                          )}
                          {userRole === "seller" && (
                            <Button asChild variant="outline" className="w-full min-h-[44px] ux4g-label" onClick={() => setOpen(false)}>
                              <Link href="/seller/dashboard">Seller dashboard</Link>
                            </Button>
                          )}
                          <Button variant="outline" className="w-full min-h-[44px] ux4g-label" onClick={() => { handleLogout(); setOpen(false); }}>
                            <LogOut className="h-4 w-4 mr-2" aria-hidden="true" /> Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button asChild variant="outline" className="w-full min-h-[44px] ux4g-label" onClick={() => setOpen(false)}>
                            <Link href="/auth/login">
                              <LogIn className="h-4 w-4 mr-2" aria-hidden="true" /> Login
                            </Link>
                          </Button>
                          <Button asChild className="w-full min-h-[44px] ux4g-label" onClick={() => setOpen(false)}>
                            <Link href="/auth/signup">Sign up</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  <p className="ux4g-body-small text-muted-foreground leading-relaxed mt-4">
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

      <div className="h-1 w-full bg-[linear-gradient(90deg,rgba(255,153,51,0.35)_0%,rgba(231,76,60,0.65)_55%,rgba(19,136,8,0.35)_100%)] vyapar-gentle-transition" />
      </header>
    </div>
  );
}
