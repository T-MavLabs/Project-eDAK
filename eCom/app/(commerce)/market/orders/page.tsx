"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { fetchOrdersByEmail, type DbOrder } from "@/supabase/queries";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const e = window.localStorage.getItem("edak_demo_email");
    queueMicrotask(() => setEmail(e));
    if (!e) return;
    queueMicrotask(() => setLoading(true));
    fetchOrdersByEmail(e)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const hasOrders = orders.length > 0;

  const totalOrders = useMemo(() => orders.length, [orders.length]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-3 vyapar-fade-in">
        <div className="vyapar-kicker">Service receipt</div>
        <h1 className="text-2xl font-semibold tracking-tight">Order receipts</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Receipts for services requested through this portal. Each receipt includes India Post tracking where available.
        </p>
      </div>

      {!hasOrders ? (
        <div className="mt-8 rounded-xl border vyapar-card bg-background p-8 vyapar-soft-shadow vyapar-fade-in text-center">
          <div className="text-xl font-semibold">
            {loading ? "Loading receipts…" : "No receipts available"}
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {loading
              ? "Please wait while we fetch your receipt history."
              : "To generate a receipt, complete checkout for an item from Available Services."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <Button asChild className="bg-primary hover:bg-primary/90 vyapar-gentle-transition">
              <Link href="/market">Go to Marketplace</Link>
            </Button>
            <Button asChild variant="secondary" className="vyapar-gentle-transition">
              <Link href="/track">Open Tracking</Link>
            </Button>
          </div>
          {email ? (
            <div className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Showing orders for <span className="font-medium">{email}</span>
            </div>
          ) : (
            <div className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Enter the same email used at checkout to view your order history.
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 vyapar-slide-up">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="vyapar-kicker">Receipt list</div>
              <div className="mt-1 text-base font-semibold">Your order history</div>
              <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {email ? (
                  <>
                    Showing receipts for <span className="font-medium text-foreground">{email}</span>
                  </>
                ) : (
                  "Showing your recent receipts."
                )}
              </div>
            </div>
            <Badge variant="secondary" className="vyapar-chip vyapar-gentle-transition">
              {totalOrders} receipts
            </Badge>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {orders.map((o, idx) => (
              <div 
                key={o.id} 
                className="vyapar-receipt p-6 vyapar-card vyapar-soft-shadow vyapar-fade-in vyapar-success"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="vyapar-kicker">Service receipt</div>
                    <div className="mt-1 text-base font-semibold text-foreground">
                      Receipt no.: {o.id}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Date and time: {new Date(o.created_at).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <Badge variant="secondary" className="vyapar-chip vyapar-gentle-transition">
                    {o.status}
                  </Badge>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border vyapar-card bg-background p-4 vyapar-soft-shadow">
                    <div className="vyapar-kicker">Applicant email</div>
                    <div className="mt-1 text-sm font-medium">{o.user_email}</div>
                    <div className="mt-1 font-mono text-xs text-muted-foreground">
                      Official Address Code (DIGIPIN): {o.digipin}
                    </div>
                  </div>
                  <div className="rounded-xl border vyapar-card bg-background p-4 vyapar-soft-shadow">
                    <div className="vyapar-kicker">Amount (INR)</div>
                    <div className="mt-1 text-xl font-semibold">
                      ₹{Number(o.total_amount).toLocaleString("en-IN")}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">Cash on Delivery (demo)</div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border vyapar-trust-badge bg-muted/30 p-4 vyapar-soft-shadow">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">Tracking (India Post)</div>
                    <div className="text-xs text-muted-foreground">Status: system generated</div>
                  </div>
                  {o.tracking_id ? (
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="font-mono text-sm font-semibold">{o.tracking_id}</div>
                      <Button asChild variant="secondary" className="gap-2 vyapar-gentle-transition">
                        <Link href={`/track?tracking_id=${encodeURIComponent(o.tracking_id)}`}>
                          Track service request
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-muted-foreground">Tracking pending</div>
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
