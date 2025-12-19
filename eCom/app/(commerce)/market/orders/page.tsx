"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { fetchOrdersByEmail, type DbOrder } from "@/supabase/queries";
import { getCurrentUser } from "@/supabase/auth";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const user = await getCurrentUser();
      if (user && user.email) {
        setIsAuthenticated(true);
        setEmail(user.email);
        setLoading(true);
        fetchOrdersByEmail(user.email)
          .then(setOrders)
          .catch(() => setOrders([]))
          .finally(() => setLoading(false));
      } else {
        setIsAuthenticated(false);
        setEmail(null);
        setOrders([]);
        setLoading(false);
      }
    } catch {
      setIsAuthenticated(false);
      setEmail(null);
      setOrders([]);
      setLoading(false);
    }
  }

  const hasOrders = orders.length > 0;

  const totalOrders = useMemo(() => orders.length, [orders.length]);

  // Show login prompt if not authenticated
  if (mounted && !isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-3 vyapar-fade-in">
          <div className="vyapar-kicker ux4g-label">Service receipt</div>
          <h1 className="ux4g-headline">Order receipts</h1>
          <p className="ux4g-body text-muted-foreground">
            Receipts for services requested through this portal. Each receipt includes India Post tracking where available.
          </p>
        </div>

        <Card className="mt-8 vyapar-card vyapar-soft-shadow vyapar-fade-in">
          <CardHeader>
            <CardTitle className="ux4g-title">Login required</CardTitle>
            <CardDescription className="ux4g-body-small">
              Please log in to view your order receipts and tracking information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="ux4g-body text-muted-foreground">
              Order receipts are only available to authenticated users. Sign in to access your order history.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-primary hover:bg-primary/90 min-h-[44px] ux4g-label">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild variant="outline" className="min-h-[44px] ux4g-label">
                <Link href="/auth/signup">Sign up</Link>
              </Button>
              <Button asChild variant="secondary" className="min-h-[44px] ux4g-label">
                <Link href="/market">Browse marketplace</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-3 vyapar-fade-in">
        <div className="vyapar-kicker ux4g-label">Service receipt</div>
        <h1 className="ux4g-headline">Order receipts</h1>
        <p className="ux4g-body text-muted-foreground">
          Receipts for services requested through this portal. Each receipt includes India Post tracking where available.
        </p>
      </div>

      {!hasOrders ? (
        <Card className="mt-8 vyapar-card vyapar-soft-shadow vyapar-fade-in">
          <CardContent className="p-8 text-center">
            <div className="ux4g-title">
              {loading ? "Loading receipts…" : "No receipts available"}
            </div>
            <p className="mt-2 ux4g-body text-muted-foreground">
              {loading
                ? "Please wait while we fetch your receipt history."
                : "To generate a receipt, complete checkout for an item from Available Services."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <Button asChild className="bg-primary hover:bg-primary/90 vyapar-gentle-transition min-h-[44px] ux4g-label">
                <Link href="/market">Go to marketplace</Link>
              </Button>
              <Button asChild variant="secondary" className="vyapar-gentle-transition min-h-[44px] ux4g-label">
                <Link href="/track">Open tracking</Link>
              </Button>
            </div>
            {email && (
              <div className="mt-4 ux4g-body-small text-muted-foreground">
                Showing orders for <span className="font-medium">{email}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 vyapar-slide-up">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="vyapar-kicker ux4g-label">Receipt list</div>
              <div className="mt-1 ux4g-title">Your order history</div>
              <div className="mt-1 ux4g-body-small text-muted-foreground">
                {email ? (
                  <>
                    Showing receipts for <span className="font-medium text-foreground">{email}</span>
                  </>
                ) : (
                  "Showing your recent receipts."
                )}
              </div>
            </div>
            <Badge variant="secondary" className="vyapar-chip vyapar-gentle-transition ux4g-label">
              {totalOrders} receipts
            </Badge>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {orders.map((o, idx) => (
              <div 
                key={o.id} 
                className="vyapar-receipt p-6 vyapar-card vyapar-soft-shadow vyapar-fade-in vyapar-success min-w-0 overflow-hidden"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="vyapar-kicker ux4g-label">Service receipt</div>
                    <div className="mt-1 ux4g-label font-semibold text-foreground break-words">
                      Receipt no.: <span className="font-mono break-all">{o.id}</span>
                    </div>
                    <div className="mt-1 ux4g-body-small text-muted-foreground">
                      Date and time: {new Date(o.created_at).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <Badge variant="secondary" className="vyapar-chip vyapar-gentle-transition">
                    {o.status}
                  </Badge>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border vyapar-card bg-background p-4 vyapar-soft-shadow min-w-0">
                    <div className="vyapar-kicker ux4g-label">Applicant email</div>
                    <div className="mt-1 ux4g-body font-medium break-words">{o.user_email}</div>
                    <div className="mt-1 font-mono ux4g-body-small text-muted-foreground break-words">
                      Official address code (DIGIPIN): {o.digipin}
                    </div>
                  </div>
                  <div className="rounded-xl border vyapar-card bg-background p-4 vyapar-soft-shadow">
                    <div className="vyapar-kicker ux4g-label">Amount (INR)</div>
                    <div className="mt-1 ux4g-headline text-primary">
                      ₹{Number(o.total_amount).toLocaleString("en-IN")}
                    </div>
                    <div className="mt-1 ux4g-body-small text-muted-foreground">Cash on delivery (demo)</div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border vyapar-trust-badge bg-muted/30 p-4 vyapar-soft-shadow">
                  <div className="flex items-center justify-between gap-3">
                    <div className="ux4g-body-small text-muted-foreground">Tracking (India Post)</div>
                    <div className="ux4g-body-small text-muted-foreground">Status: system generated</div>
                  </div>
                  {o.tracking_id ? (
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
                      <div className="font-mono ux4g-body font-semibold break-all">{o.tracking_id}</div>
                      <Button asChild variant="secondary" className="gap-2 vyapar-gentle-transition min-h-[44px] ux4g-label">
                        <Link href={`/track?tracking_id=${encodeURIComponent(o.tracking_id)}`}>
                          Track service request
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 ux4g-body text-muted-foreground">Tracking pending</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
