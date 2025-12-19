"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Bell, LayoutDashboard, MessageSquareWarning, PackageSearch } from "lucide-react";

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
  { href: "/track", label: "Track Parcel", icon: PackageSearch },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
] as const;

// Get breadcrumb label from pathname
function getBreadcrumb(pathname: string): string {
  if (pathname === "/admin") return "Admin Analytics";
  if (pathname === "/track") return "Track Parcel";
  if (pathname === "/notifications") return "Notifications";
  if (pathname === "/complaints") return "Complaints";
  return "DAKSH Platform";
}

export function CoreNavbar() {
  const pathname = usePathname();
  const role = useDemoRole();

  const roleLabel = useMemo(
    () => (role === "admin" ? "Admin demo" : "Citizen demo"),
    [role],
  );

  const breadcrumb = useMemo(() => getBreadcrumb(pathname), [pathname]);

  function toggleRole() {
    const next = role === "admin" ? "citizen" : "admin";
    setDemoRole(next);
  }

  return (
    <>
      <GovernmentBanner />
    <header 
      className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90"
      role="banner"
      aria-label="Main navigation"
    >
      {/* UX4G Navbar Layout: Logo Left | Breadcrumb Center | Nav Right */}
      <div className="mx-auto w-full max-w-[1536px] px-4 py-3">
        <div className="grid grid-cols-3 items-center gap-4">
          {/* Left: Logo + App Title */}
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#E74C3C] focus:ring-offset-2 rounded-md"
              aria-label="DAKSH Home"
            >
              <div className="relative h-10 w-10 rounded-md overflow-hidden shadow-sm">
                <Image
                  src="/DAKSH.png"
                  alt="DAKSH Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="leading-tight">
                <div 
                  className="text-base font-semibold tracking-tight text-neutral-900"
                  style={{ fontFamily: "var(--ux4g-font-family-display, 'Noto Sans Display', sans-serif)" }}
                >
                  DAKSH
                </div>
                <div className="text-xs text-neutral-600">
                  Smart Parcel Tracking & Delivery
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Breadcrumb / Workspace Name */}
          <div className="hidden md:flex justify-center">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center">
                <li className="text-sm font-medium text-neutral-700">
                  {breadcrumb}
                </li>
              </ol>
            </nav>
          </div>

          {/* Right: Navigation Items + Admin Toggle */}
          <div className="flex items-center justify-end gap-2">
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-[#E74C3C] focus:ring-offset-1",
                      active
                        ? "bg-neutral-100 text-neutral-900"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Button
              type="button"
              variant="secondary"
              className="hidden md:inline-flex text-sm"
              onClick={toggleRole}
              aria-label={`Toggle demo role. Current: ${roleLabel}`}
            >
              {roleLabel}
            </Button>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className="md:hidden"
                  aria-label="Open navigation menu"
                >
                  Menu
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-80">
                <div className="p-5">
                  <SheetHeader>
                    <SheetTitle className="text-base">DAKSH Navigation</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-4 grid gap-2" aria-label="Mobile navigation">
                    {navItems.map((item) => {
                      const active = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            "focus:outline-none focus:ring-2 focus:ring-[#E74C3C] focus:ring-offset-1",
                            active
                              ? "bg-neutral-100 text-neutral-900"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <Button 
                      type="button" 
                      className="w-full" 
                      onClick={toggleRole}
                      aria-label={`Toggle demo role. Current: ${roleLabel}`}
                    >
                      Toggle role: {roleLabel}
                    </Button>
                    <p className="mt-2 text-xs text-neutral-500">
                      Mock role handling for hackathon demo.
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* India flag colors gradient bar */}
      <div 
        className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-[#C60000] to-[#138808]"
        aria-hidden="true"
      />
    </header>
    </>
  );
}
