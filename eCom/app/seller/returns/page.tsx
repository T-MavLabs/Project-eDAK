"use client";

import { useEffect, useState } from "react";
import { RotateCcw, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAuth } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Return {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  reason: string;
  status: string;
  created_at: string;
  refund_amount: number;
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReturns();
  }, []);

  async function loadReturns() {
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
        .select("id, name")
        .eq("seller_id", typedSellerProfile.id);

      const typedProducts = (products as Array<{ id: string; name: string }> | null) || [];
      const productIds = typedProducts.map((p) => p.id);
      if (productIds.length === 0) {
        setReturns([]);
        setLoading(false);
        return;
      }

      // Try to load returns (if table exists)
      const { data: returnData, error } = await supabase
        .from("returns_refunds")
        .select(`
          *,
          product:products(id, name)
        `)
        .in("product_id", productIds)
        .order("created_at", { ascending: false });

      if (error && error.code !== "42P01") {
        throw error;
      }

      if (returnData) {
        setReturns(
          returnData.map((r: any) => ({
            id: r.id,
            order_id: r.order_id,
            product_id: r.product_id,
            product_name: r.product?.name || "Unknown Product",
            reason: r.reason,
            status: r.status,
            created_at: r.created_at,
            refund_amount: r.refund_amount || 0,
          }))
        );
      }
    } catch (err) {
      console.error("Error loading returns:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (returnId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("returns_refunds")
        .update({ status: newStatus })
        .eq("id", returnId);

      if (error) throw error;
      await loadReturns();
    } catch (err) {
      console.error("Error updating return status:", err);
      alert("Failed to update return status");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      requested: "secondary",
      approved: "default",
      rejected: "destructive",
      refunded: "default",
      completed: "default",
    };

    const icons: Record<string, typeof Clock> = {
      requested: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      refunded: CheckCircle,
      completed: CheckCircle,
    };

    const Icon = icons[status] || Clock;

    return (
      <Badge variant={variants[status] || "outline"} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading returns...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Returns & Refunds</h1>
        <p className="text-muted-foreground">Manage return requests and refunds</p>
      </div>

      {returns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RotateCcw className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No return requests</h3>
            <p className="text-muted-foreground">Return requests will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Return ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Refund Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.map((returnItem) => (
                <TableRow key={returnItem.id}>
                  <TableCell className="font-mono text-sm">{returnItem.id.slice(0, 8)}...</TableCell>
                  <TableCell>{returnItem.product_name}</TableCell>
                  <TableCell className="max-w-xs truncate">{returnItem.reason}</TableCell>
                  <TableCell>₹{Number(returnItem.refund_amount).toLocaleString("en-IN")}</TableCell>
                  <TableCell>{getStatusBadge(returnItem.status)}</TableCell>
                  <TableCell>{new Date(returnItem.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {returnItem.status === "requested" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStatusUpdate(returnItem.id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(returnItem.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
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
