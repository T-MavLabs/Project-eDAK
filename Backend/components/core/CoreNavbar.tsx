"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bell, LayoutDashboard, MessageSquareWarning, PackageSearch, Home } from "lucide-react";

import { cn } from "@/lib/utils";
import { setDemoRole, useDemoRole } from "@/lib/useDemoRole";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GovernmentBanner } from "@/components/GovernmentBanner";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/track", label: "Track Parcel", icon: PackageSearch },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
] as const;

export function CoreNavbar() {
  const pathname = usePathname();
  const role = useDemoRole();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const roleLabel = useMemo(
    () => (role === "admin" ? "Admin view" : "Citizen view"),
    [role],
  );

  function toggleRole() {
    const next = role === "admin" ? "citizen" : "admin";
    setDemoRole(next);
  }

  return (
    <div className="sticky top-0 z-50">
      <GovernmentBanner />
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 transition-colors">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E74C3C] focus:ring-offset-2 rounded-md" aria-label="DAKSH Home">
            <div className="relative h-10 w-10 rounded-lg overflow-hidden shadow-sm transition-transform">
              <Image
                src="/DAKSH.png"
                alt="DAKSH Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="text-sm font-semibold tracking-tight" style={{ fontFamily: "var(--ux4g-font-family-display, 'Noto Sans Display', sans-serif)", fontSize: "var(--ux4g-text-sm, 0.875rem)" }}>
                DAKSH
              </div>
              <div className="text-xs text-muted-foreground" style={{ fontSize: "var(--ux4g-text-xs, 0.75rem)" }}>
                Smart Parcel Tracking & Delivery
              </div>
            </div>
          </Link>

          {/* Primary Navigation - Center-left */}
          <nav className="hidden items-center gap-1 lg:flex flex-1 justify-center lg:justify-start lg:ml-8" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
                    "focus:outline-none focus:ring-2 focus:ring-[#E74C3C] focus:ring-offset-1",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                  style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
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
            <Button
              type="button"
              variant="secondary"
              className="hidden md:inline-flex text-sm min-h-[44px] transition-colors"
              onClick={toggleRole}
              aria-label={`Toggle demo role. Current: ${roleLabel}`}
              style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
            >
              {roleLabel}
            </Button>

            {mounted ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden min-h-[44px] transition-colors">
                    Menu
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-80">
                  <div className="p-5">
                    <SheetHeader>
                      <SheetTitle className="text-base" style={{ fontFamily: "var(--ux4g-font-family-display, 'Noto Sans Display', sans-serif)" }}>
                        DAKSH Navigation
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="mt-4 grid gap-2" aria-label="Mobile navigation">
                      {navItems.map((item) => {
                        const active = item.href === "/" ? pathname === "/" : pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px]",
                              "focus:outline-none focus:ring-2 focus:ring-[#E74C3C] focus:ring-offset-1",
                              active
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                            )}
                            style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
                            aria-current={active ? "page" : undefined}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </nav>

                    <div className="mt-6 pt-6 border-t border-neutral-200">
                      <Button type="button" className="w-full bg-primary hover:bg-primary/90 text-white transition-colors" onClick={toggleRole}>
                        Toggle role: {roleLabel}
                      </Button>
                      <p className="mt-2 text-xs text-neutral-500" style={{ fontSize: "var(--ux4g-text-xs, 0.75rem)" }}>
                        Mock role handling for hackathon demo.
                      </p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Button variant="outline" className="md:hidden min-h-[44px] transition-colors" type="button" disabled>
                Menu
              </Button>
            )}
          </div>
      </div>

        <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-[#C60000] to-[#138808]" aria-hidden="true" />
    </header>
    </div>
  );
}
