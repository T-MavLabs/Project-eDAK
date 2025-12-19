import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold">Government of India • India Post</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Demo frontend for Smart Parcel Tracking & Predictive Delivery System.
              Built with mock data for hackathon evaluation.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold">Quick Links</div>
            <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground" href="/track">
                  Track Parcel
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/notifications">
                  Notifications
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/complaints">
                  Complaint System
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/admin">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">Compliance & Accessibility</div>
            <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
              <li>WCAG-friendly contrast & keyboard navigation</li>
              <li>Audit-friendly UI patterns  </li>
              <li>No personal data stored</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} India Post • Demo UI</div>
          <div>
            Built for hackathon demo — ready to connect Supabase/API later.
          </div>
        </div>
      </div>
    </footer>
  );
}
