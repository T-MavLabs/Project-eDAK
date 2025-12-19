import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background daksh-glass">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3 daksh-fade-in">
          <div>
            <div className="text-sm font-semibold">Government of India • India Post</div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              DAKSH – Delivery Analytics & Knowledge System for Shipment.
              API-first smart parcel intelligence for India Post.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold">Quick Links</div>
            <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground daksh-transition daksh-focus-ring" href="/track">
                  Track Parcel
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground daksh-transition daksh-focus-ring" href="/notifications">
                  Notifications
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground daksh-transition daksh-focus-ring" href="/complaints">
                  Complaint System
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground daksh-transition daksh-focus-ring" href="/admin">
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
          <div>© {new Date().getFullYear()} India Post • DAKSH</div>
          <div>
            API-first platform for integration by Indian e-commerce providers.
          </div>
        </div>
      </div>
    </footer>
  );
}
