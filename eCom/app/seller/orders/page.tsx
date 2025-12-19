"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Package, Eye, Truck } from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAuth } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: string;
  user_email: string;
  total_amount: number;
  status: string;
  tracking_id: string | null;
  created_at: string;
  buyer_id: string | null;
}

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const userId = await requireAuth();

        // Get seller profile
        const { data: sellerProfile } = await supabase
          .from("seller_profiles")
          .select("id")
          .eq("id", userId)
          .single();

        const typedSellerProfile = sellerProfile as unknown as { id: string } | null;
        if (!typedSellerProfile || !typedSellerProfile.id) return;

        // Get seller's products
        const { data: products } = await supabase
          .from("products")
          .select("id")
          .eq("seller_id", typedSellerProfile.id);

        const typedProducts = (products as Array<{ id: string }> | null) || [];
        const productIds = typedProducts.map((p) => p.id);
        if (productIds.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // Get order items for seller's products
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("order_id")
          .in("product_id", productIds);

        const typedOrderItems = (orderItems as Array<{ order_id: string }> | null) || [];
        const orderIds = [...new Set(typedOrderItems.map((oi) => oi.order_id))];
        if (orderIds.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // Get orders
        let query = supabase
          .from("orders")
          .select("*")
          .in("id", orderIds)
          .order("created_at", { ascending: false });

        if (statusFilter) {
          query = query.eq("status", statusFilter);
        }

        const { data, error } = await query;
        if (error) throw error;
        const typedOrders = (data as unknown as Array<Order> | null) || [];
        setOrders(typedOrders);
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      placed: "secondary",
      confirmed: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"}>{status}</Badge>
    );
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="ux4g-headline">Orders</h1>
          <p className="ux4g-body text-muted-foreground mt-1">Manage and fulfill customer orders</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={!statusFilter ? "default" : "outline"} asChild className="min-h-[44px] ux4g-label">
            <Link href="/seller/orders">All</Link>
          </Button>
          <Button variant={statusFilter === "placed" ? "default" : "outline"} asChild className="min-h-[44px] ux4g-label">
            <Link href="/seller/orders?status=placed">Pending</Link>
          </Button>
          <Button variant={statusFilter === "shipped" ? "default" : "outline"} asChild className="min-h-[44px] ux4g-label">
            <Link href="/seller/orders?status=shipped">Shipped</Link>
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
            <h3 className="ux4g-title mb-2">No orders yet</h3>
            <p className="ux4g-body text-muted-foreground text-center px-4">Orders will appear here when customers purchase your products</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <Card className="hidden lg:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="ux4g-label">Order ID</TableHead>
                    <TableHead className="ux4g-label">Customer</TableHead>
                    <TableHead className="ux4g-label">Amount</TableHead>
                    <TableHead className="ux4g-label">Status</TableHead>
                    <TableHead className="ux4g-label">Date</TableHead>
                    <TableHead className="ux4g-label">Tracking</TableHead>
                    <TableHead className="ux4g-label">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono ux4g-body-small">{order.id.slice(0, 8)}...</TableCell>
                      <TableCell className="ux4g-body break-words">{order.user_email}</TableCell>
                      <TableCell className="ux4g-label">₹{Number(order.total_amount).toLocaleString("en-IN")}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="ux4g-body-small">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {order.tracking_id ? (
                          <Badge variant="outline" className="ux4g-body-small break-all">{order.tracking_id}</Badge>
                        ) : (
                          <span className="text-muted-foreground ux4g-body-small">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild className="min-h-[44px] ux4g-label">
                          <Link href={`/seller/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="ux4g-label font-semibold mb-1">Order ID</div>
                        <div className="font-mono ux4g-body-small break-all">{order.id}</div>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <div className="ux4g-label text-muted-foreground mb-1">Customer</div>
                        <div className="ux4g-body break-words">{order.user_email}</div>
                      </div>
                      <div>
                        <div className="ux4g-label text-muted-foreground mb-1">Amount</div>
                        <div className="ux4g-label font-semibold">₹{Number(order.total_amount).toLocaleString("en-IN")}</div>
                      </div>
                      <div>
                        <div className="ux4g-label text-muted-foreground mb-1">Date</div>
                        <div className="ux4g-body-small">{new Date(order.created_at).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="ux4g-label text-muted-foreground mb-1">Tracking</div>
                        {order.tracking_id ? (
                          <Badge variant="outline" className="ux4g-body-small break-all">{order.tracking_id}</Badge>
                        ) : (
                          <span className="text-muted-foreground ux4g-body-small">-</span>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full min-h-[44px] ux4g-label" asChild>
                      <Link href={`/seller/orders/${order.id}`}>
                        <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                        View details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div>Loading...</div>
      </div>
    }>
      <OrdersPageContent />
    </Suspense>
  );
}
