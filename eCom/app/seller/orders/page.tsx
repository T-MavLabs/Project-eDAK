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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage and fulfill customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant={!statusFilter ? "default" : "outline"} asChild>
            <Link href="/seller/orders">All</Link>
          </Button>
          <Button variant={statusFilter === "placed" ? "default" : "outline"} asChild>
            <Link href="/seller/orders?status=placed">Pending</Link>
          </Button>
          <Button variant={statusFilter === "shipped" ? "default" : "outline"} asChild>
            <Link href="/seller/orders?status=shipped">Shipped</Link>
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Orders will appear here when customers purchase your products</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                  <TableCell>{order.user_email}</TableCell>
                  <TableCell>₹{Number(order.total_amount).toLocaleString("en-IN")}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {order.tracking_id ? (
                      <Badge variant="outline">{order.tracking_id}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/seller/orders/${order.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
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
