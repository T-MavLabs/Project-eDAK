import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background vyapar-gentle-transition">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3 vyapar-fade-in">
          <div>
            <div className="text-sm font-semibold">Powered by India Post</div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              India Post delivery and end-to-end parcel tracking for your orders.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold">Quick Links</div>
            <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground vyapar-gentle-transition" href="/track">
                  Track Parcel
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground vyapar-gentle-transition" href="/notifications">
                  Notifications
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground vyapar-gentle-transition" href="/complaints">
                  Complaint System
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground vyapar-gentle-transition" href="/admin">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">Compliance & Accessibility</div>
            <ul className="mt-2 grid gap-2 text-sm text-muted-foreground leading-relaxed">
              <li>WCAG-friendly contrast & keyboard navigation</li>
              <li>Audit-friendly UI patterns</li>
              <li>No personal data stored</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between leading-relaxed">
          <div>© {new Date().getFullYear()} India Post</div>
          <div>
            Secure checkout and tracking.
          </div>
        </div>
      </div>
    </footer>
  );
}
