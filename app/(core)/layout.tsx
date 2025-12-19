import type { ReactNode } from "react";
import Link from "next/link";

import { CoreNavbar } from "@/components/core/CoreNavbar";
import { Badge } from "@/components/ui/badge";

export default function CoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CoreNavbar />
      <div className="border-b bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-semibold">India Post Smart Parcel Platform</div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">API-first platform</Badge>
              <Badge variant="secondary">Integrable by Indian e-commerce via public APIs</Badge>
              <Link
                href="/market"
                className="text-xs font-medium text-primary hover:underline"
              >
                Switch to E-commerce Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {children}
    </>
  );
}
