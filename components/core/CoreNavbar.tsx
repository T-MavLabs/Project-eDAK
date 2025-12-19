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

const navItems = [
  { href: "/track", label: "Track Parcel", icon: PackageSearch },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
] as const;

export function CoreNavbar() {
  const pathname = usePathname();
  const role = useDemoRole();

  const roleLabel = useMemo(
    () => (role === "admin" ? "Admin demo" : "Citizen demo"),
    [role],
  );

  function toggleRole() {
    const next = role === "admin" ? "citizen" : "admin";
    setDemoRole(next);
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-md overflow-hidden shadow-sm">
            <Image
              src="/DAKSH.png"
              alt="DAKSH Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">
              India Post Smart Parcel Platform
            </div>
            <div className="text-xs text-muted-foreground">
              API-first tracking, prediction & proactive alerts
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
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
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
        </nav>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="hidden md:inline-flex"
            onClick={toggleRole}
            aria-label="Toggle demo role"
          >
            {roleLabel}
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <div className="p-5">
                <SheetHeader>
                  <SheetTitle className="text-base">India Post Platform</SheetTitle>
                </SheetHeader>
                <div className="mt-4 grid gap-2">
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
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

                <div className="mt-6">
                  <Button type="button" className="w-full" onClick={toggleRole}>
                    Toggle role: {roleLabel}
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Mock role handling for hackathon demo.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="h-1 w-full bg-[linear-gradient(90deg,#FF9933_0%,#C60000_50%,#138808_100%)]" />
    </header>
  );
}
