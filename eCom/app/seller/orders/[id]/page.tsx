"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Truck, Package } from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAuth } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;
  user_email: string;
  total_amount: number;
  status: string;
  tracking_id: string | null;
  created_at: string;
  digipin: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product: {
    name: string;
    image_path: string | null;
  };
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        await requireAuth();

        // Load order
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (orderError) throw orderError;
        const typedOrderData = orderData as unknown as Order | null;
        setOrder(typedOrderData);
        if (typedOrderData) {
          setStatus(typedOrderData.status);
        }

        // Load order items
        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select(`
            *,
            product:products(id, name, image_path)
          `)
          .eq("order_id", orderId);

        if (itemsError) throw itemsError;
        const typedItems = (items as Array<any> | null) || [];
        setOrderItems(
          typedItems.map((item: any) => ({
            ...item,
            product: item.product,
          })) || []
        );
      } catch (err) {
        console.error("Error loading order:", err);
        alert("Failed to load order");
        router.push("/seller/orders");
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId, router]);

  const handleStatusUpdate = async () => {
    if (!order || status === order.status) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;
      setOrder({ ...order, status });
      alert("Order status updated successfully");
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div>Loading order...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">Order ID: {order.id.slice(0, 8)}...</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Customer Email</Label>
              <p className="text-sm font-medium">{order.user_email}</p>
            </div>
            <div>
              <Label>Total Amount</Label>
              <p className="text-2xl font-bold">₹{Number(order.total_amount).toLocaleString("en-IN")}</p>
            </div>
            <div>
              <Label>Status</Label>
              <div className="flex items-center gap-2 mt-2">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placed">Placed</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleStatusUpdate} disabled={updating || status === order.status}>
                  {updating ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
            <div>
              <Label>Tracking ID</Label>
              <p className="text-sm">{order.tracking_id || "Not assigned"}</p>
            </div>
            <div>
              <Label>DIGIPIN</Label>
              <p className="text-sm font-mono">{order.digipin}</p>
            </div>
            <div>
              <Label>Order Date</Label>
              <p className="text-sm">{new Date(order.created_at).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                <div className="flex-1">
                  <p className="font-medium">{item.product?.name || "Product"}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity} × ₹{Number(item.price_at_purchase).toLocaleString("en-IN")}
                  </p>
                </div>
                <p className="font-bold">
                  ₹{(item.quantity * Number(item.price_at_purchase)).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
