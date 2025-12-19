import Link from "next/link";
import { PackageSearch, Store, Shield, HelpCircle, FileText, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background vyapar-gentle-transition">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-10 vyapar-fade-in">
          {/* About VYAPAR */}
          <div>
            <div className="text-base font-semibold mb-3">About VYAPAR</div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Virtual Yet Accessible Postal Aggregated Retail. Connecting Indian MSMEs with buyers nationwide through India Post's trusted delivery network.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span className="text-muted-foreground">Powered by India Post (DAKSH)</span>
            </div>
          </div>

          {/* For Buyers */}
          <div>
            <div className="text-base font-semibold mb-3">For Buyers</div>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/market" className="text-muted-foreground hover:text-foreground vyapar-gentle-transition inline-flex items-center gap-2">
                  <PackageSearch className="h-3.5 w-3.5" />
                  Browse Marketplace
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-muted-foreground hover:text-foreground vyapar-gentle-transition inline-flex items-center gap-2">
                  <PackageSearch className="h-3.5 w-3.5" />
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/market/orders" className="text-muted-foreground hover:text-foreground vyapar-gentle-transition">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-muted-foreground hover:text-foreground vyapar-gentle-transition">
                  Login / Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <div className="text-base font-semibold mb-3">For Sellers</div>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/auth/signup" className="text-muted-foreground hover:text-foreground vyapar-gentle-transition inline-flex items-center gap-2">
                  <Store className="h-3.5 w-3.5" />
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="text-muted-foreground hover:text-foreground vyapar-gentle-transition">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-muted-foreground hover:text-foreground vyapar-gentle-transition">
                  Seller Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Policies */}
          <div>
            <div className="text-base font-semibold mb-3">Support & Policies</div>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/track" className="text-muted-foreground hover:text-foreground vyapar-gentle-transition inline-flex items-center gap-2">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Track Parcel
                </Link>
              </li>
              <li>
                <Link href="/complaints" className="text-muted-foreground hover:text-foreground vyapar-gentle-transition">
                  Complaint System
                </Link>
              </li>
              <li>
                <Link href="/notifications" className="text-muted-foreground hover:text-foreground vyapar-gentle-transition">
                  Order Notifications
                </Link>
              </li>
              <li className="text-muted-foreground inline-flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Terms & Policies
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Strip */}
        <div className="border-t pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm">
            <div>
              <div className="font-semibold mb-1">India Post Delivery</div>
              <div className="text-muted-foreground">Nationwide network</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Real-time Tracking</div>
              <div className="text-muted-foreground">Track anytime</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Verified Sellers</div>
              <div className="text-muted-foreground">MSME certified</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Secure Checkout</div>
              <div className="text-muted-foreground">Safe transactions</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs text-muted-foreground">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
              <div>© {currentYear} VYAPAR. All rights reserved.</div>
              <div className="hidden md:block">•</div>
              <div>Powered by India Post (DAKSH)</div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/track" className="hover:text-foreground vyapar-gentle-transition">
                Track Order
              </Link>
              <span className="hidden md:inline">•</span>
              <Link href="/complaints" className="hover:text-foreground vyapar-gentle-transition">
                Support
              </Link>
              <span className="hidden md:inline">•</span>
              <span>Compliance & Accessibility</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
