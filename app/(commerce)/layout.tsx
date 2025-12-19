import type { ReactNode } from "react";
import Link from "next/link";

import { CommerceNavbar } from "@/components/commerce/CommerceNavbar";
import { Badge } from "@/components/ui/badge";

export default function CommerceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CommerceNavbar />
      <div className="border-b bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm">
              <span className="font-semibold">You are now viewing the Indian E-commerce Demo</span>
              <span className="text-muted-foreground">
                {" "}
                — a sample client of the India Post platform.
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Powered by India Post</Badge>
              <Badge variant="secondary">No payments • Mock data</Badge>
              <Link href="/track" className="text-xs font-medium text-primary hover:underline">
                Open India Post Platform
              </Link>
            </div>
          </div>
        </div>
      </div>

      {children}
    </>
  );
}
