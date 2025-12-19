"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUserRole, getUserProfile } from "@/supabase/auth";
import { supabase } from "@/supabase/client";

export function SellerRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAndRedirect() {
      // Only redirect from marketplace pages, not from seller pages
      if (pathname?.startsWith("/seller") || pathname?.startsWith("/admin") || pathname?.startsWith("/auth")) {
        return;
      }

      try {
        const role = await getCurrentUserRole();
        
        if (role === "seller") {
          // Check if seller has completed onboarding
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: sellerProfile } = await supabase
              .from("seller_profiles")
              .select("id")
              .eq("id", user.id)
              .single();
            
            if (sellerProfile) {
              router.push("/seller/dashboard");
            } else {
              router.push("/seller/onboarding");
            }
          }
        } else if (role === "admin") {
          router.push("/admin");
        }
      } catch {
        // If auth check fails, stay on current page (public access)
      }
    }

    checkAndRedirect();
  }, [router, pathname]);

  return null; // This component doesn't render anything
}
