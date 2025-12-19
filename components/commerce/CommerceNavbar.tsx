"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, ShoppingCart, ClipboardList, PackageSearch, BadgeCheck } from "lucide-react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/market", label: "Marketplace", icon: ShoppingBag },
  { href: "/market/cart", label: "Cart", icon: ShoppingCart },
  { href: "/market/orders", label: "Orders", icon: ClipboardList },
] as const;

export function CommerceNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/market" className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-lg overflow-hidden shadow-sm">
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

          <Button asChild variant="outline" className="ml-2">
            <Link href="/track" className="inline-flex items-center gap-2">
              <PackageSearch className="h-4 w-4" /> Track via India Post
            </Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden gap-2 md:inline-flex">
            <BadgeCheck className="h-3.5 w-3.5" /> Powered by India Post
          </Badge>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <div className="p-5">
                <SheetHeader>
                  <SheetTitle className="text-base">E-commerce Demo</SheetTitle>
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

                <div className="mt-6 grid gap-2">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90">
                    <Link href="/track" className="inline-flex items-center gap-2">
                      <PackageSearch className="h-4 w-4" /> Track via India Post
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    This client integrates via public APIs   using only tracking_id.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="h-1 w-full bg-[linear-gradient(90deg,rgba(255,153,51,0.35)_0%,rgba(198,0,0,0.65)_55%,rgba(19,136,8,0.35)_100%)]" />
    </header>
  );
}
