import Link from "next/link";
import { PackageSearch, Store, Shield, HelpCircle, FileText, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background vyapar-gentle-transition" role="contentinfo">
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 mb-10 vyapar-fade-in">
          {/* About VYAPAR */}
          <div className="lg:col-span-2">
            <div className="ux4g-title mb-3">About VYAPAR</div>
            <p className="ux4g-body text-muted-foreground mb-4">
              Virtual Yet Accessible Postal Aggregated Retail. Connecting Indian MSMEs with buyers nationwide through India Post's trusted delivery network.
            </p>
            <div className="flex items-center gap-2 ux4g-body-small">
              <div className="h-2 w-2 rounded-full bg-primary" aria-hidden="true"></div>
              <span className="text-muted-foreground">Powered by India Post (DAKSH)</span>
            </div>
          </div>

          {/* For Buyers */}
          <div>
            <div className="ux4g-label font-semibold mb-3">For buyers</div>
            <ul className="space-y-2.5">
              <li>
                <Link href="/market" className="ux4g-body-small text-muted-foreground hover:text-foreground vyapar-gentle-transition inline-flex items-center gap-2 min-h-[44px]">
                  <PackageSearch className="h-3.5 w-3.5" aria-hidden="true" />
                  Browse marketplace
                </Link>
              </li>
              <li>
                <Link href="/track" className="ux4g-body-small text-muted-foreground hover:text-foreground vyapar-gentle-transition inline-flex items-center gap-2 min-h-[44px]">
                  <PackageSearch className="h-3.5 w-3.5" aria-hidden="true" />
                  Track your order
                </Link>
              </li>
              <li>
                <Link href="/market/orders" className="ux4g-body-small text-muted-foreground hover:text-foreground vyapar-gentle-transition min-h-[44px] inline-flex items-center">
                  My orders
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="ux4g-body-small text-muted-foreground hover:text-foreground vyapar-gentle-transition min-h-[44px] inline-flex items-center">
                  Login / Sign up
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <div className="ux4g-label font-semibold mb-3">For sellers</div>
            <ul className="space-y-2.5">
              <li>
                <Link href="/auth/signup" className="ux4g-body-small text-muted-foreground hover:text-foreground vyapar-gentle-transition inline-flex items-center gap-2 min-h-[44px]">
                  <Store className="h-3.5 w-3.5" aria-hidden="true" />
                  Become a seller
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="ux4g-body-small text-muted-foreground hover:text-foreground vyapar-gentle-transition min-h-[44px] inline-flex items-center">
                  Seller dashboard
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="ux4g-body-small text-muted-foreground hover:text-foreground vyapar-gentle-transition min-h-[44px] inline-flex items-center">
                  Seller login
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Policies */}
          <div>
            <div className="ux4g-label font-semibold mb-3">Support & policies</div>
            <ul className="space-y-2.5">
              <li>
                <Link href="/track" className="ux4g-body-small text-muted-foreground hover:text-foreground vyapar-gentle-transition inline-flex items-center gap-2 min-h-[44px]">
                  <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  Track parcel
                </Link>
              </li>
              <li>
                <Link href="/complaints" className="ux4g-body-small text-muted-foreground hover:text-foreground vyapar-gentle-transition min-h-[44px] inline-flex items-center">
                  Complaint system
                </Link>
              </li>
              <li>
                <Link href="/notifications" className="ux4g-body-small text-muted-foreground hover:text-foreground vyapar-gentle-transition min-h-[44px] inline-flex items-center">
                  Order notifications
                </Link>
              </li>
              <li className="ux4g-body-small text-muted-foreground inline-flex items-center gap-2 min-h-[44px]">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Terms & policies
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Strip */}
        <div className="border-t pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="ux4g-label font-semibold mb-1">India Post delivery</div>
              <div className="ux4g-body-small text-muted-foreground">Nationwide network</div>
            </div>
            <div>
              <div className="ux4g-label font-semibold mb-1">Real-time tracking</div>
              <div className="ux4g-body-small text-muted-foreground">Track anytime</div>
            </div>
            <div>
              <div className="ux4g-label font-semibold mb-1">Verified sellers</div>
              <div className="ux4g-body-small text-muted-foreground">MSME certified</div>
            </div>
            <div>
              <div className="ux4g-label font-semibold mb-1">Secure checkout</div>
              <div className="ux4g-body-small text-muted-foreground">Safe transactions</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between ux4g-body-small text-muted-foreground">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
              <div>© {currentYear} VYAPAR. All rights reserved.</div>
              <div className="hidden md:block" aria-hidden="true">•</div>
              <div>Powered by India Post (DAKSH)</div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/track" className="hover:text-foreground vyapar-gentle-transition min-h-[44px] inline-flex items-center">
                Track order
              </Link>
              <span className="hidden md:inline" aria-hidden="true">•</span>
              <Link href="/complaints" className="hover:text-foreground vyapar-gentle-transition min-h-[44px] inline-flex items-center">
                Support
              </Link>
              <span className="hidden md:inline" aria-hidden="true">•</span>
              <span>Compliance & accessibility</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
