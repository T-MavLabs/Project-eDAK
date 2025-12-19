"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ClipboardList, PackageSearch } from "lucide-react";

import { getOrders, type Order } from "@/lib/mockOrders";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(() => getOrders());

  useEffect(() => {
    const onStorage = () => setOrders(getOrders());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const hasOrders = orders.length > 0;

  const totalOrders = useMemo(() => orders.length, [orders.length]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ClipboardList className="h-5 w-5 text-primary" />
          Orders
        </h1>
        <p className="text-sm text-muted-foreground">
          Your marketplace demo orders. Each order is linked to India Post tracking.
        </p>
      </div>

      {!hasOrders ? (
        <div className="mt-6 rounded-md border bg-background p-6">
          <div className="text-lg font-semibold">No orders yet</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Place an order from the marketplace checkout to see it appear here.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/market">Go to Marketplace</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/track">Open Tracking</Link>
            </Button>
          </div>
        </div>
      ) : (
        <Card className="mt-6">
          <CardHeader className="space-y-2">
            <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
              <span>Order history</span>
              <Badge variant="secondary">{totalOrders} orders</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Tracking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <div className="font-medium">{o.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.items.length} item(s) • {o.paymentMode}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.placedAt}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{o.destinationCity}</div>
                      <div className="font-mono text-xs text-muted-foreground">{o.destinationDigipin}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">₹{o.totalInr.toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <Button asChild variant="secondary" className="gap-2">
                        <Link href={`/track?tracking_id=${encodeURIComponent(o.trackingId)}`}>
                          <PackageSearch className="h-4 w-4" /> Track Parcel
                        </Link>
                      </Button>
                      <div className="mt-1 font-mono text-xs text-muted-foreground">{o.trackingId}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
