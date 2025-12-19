import type { ReactNode } from "react";

import { CommerceNavbar } from "@/components/commerce/CommerceNavbar";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CommerceNavbar />
      <div className="vyapar-page">
        <div className="mx-auto w-full max-w-6xl px-4 pt-4">
          <EmailVerificationBanner />
        </div>
        {children}
      </div>
    </>
  );
}
