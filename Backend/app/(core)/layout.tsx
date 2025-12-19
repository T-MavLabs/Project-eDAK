import type { ReactNode } from "react";

import { CoreNavbar } from "@/components/core/CoreNavbar";

export default function CoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CoreNavbar />
      <div className="daksh-page">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8">
          <div className="rounded-md border daksh-glass bg-background px-4 py-3 daksh-elevated daksh-transition daksh-fade-in">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="daksh-kicker">National Logistics Intelligence</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                DAKSH is an <span className="font-medium text-foreground">API-first</span> national logistics intelligence platform.
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </>
  );
}
