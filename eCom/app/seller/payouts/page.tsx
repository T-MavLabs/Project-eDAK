"use client";

import { useEffect, useState } from "react";
import { DollarSign, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAuth } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Payout {
  id: string;
  order_id: string;
  amount: number;
  commission: number;
  net_amount: number;
  status: string;
  created_at: string;
  settled_at: string | null;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPayouts: 0,
    pendingAmount: 0,
    settledAmount: 0,
  });

  useEffect(() => {
    loadPayouts();
  }, []);

  async function loadPayouts() {
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

      // Try to load payouts (if table exists)
      const { data: payoutData, error } = await supabase
        .from("payouts")
        .select("*")
        .eq("seller_id", typedSellerProfile.id)
        .order("created_at", { ascending: false });

      if (error && error.code !== "42P01") {
        // Table doesn't exist error is OK
        throw error;
      }

      if (payoutData) {
        const typedPayoutData = payoutData as unknown as Array<Payout>;
        setPayouts(typedPayoutData);
        const pending = typedPayoutData
          .filter((p) => p.status === "pending")
          .reduce((sum, p) => sum + parseFloat(String(p.net_amount || 0)), 0);
        const settled = typedPayoutData
          .filter((p) => p.status === "settled")
          .reduce((sum, p) => sum + parseFloat(String(p.net_amount || 0)), 0);
        setSummary({
          totalPayouts: payoutData.length,
          pendingAmount: pending,
          settledAmount: settled,
        });
      }
    } catch (err) {
      console.error("Error loading payouts:", err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === "settled") {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Settled
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading payouts...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payouts</h1>
        <p className="text-muted-foreground">Track your earnings and settlements</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalPayouts}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.pendingAmount.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">Awaiting settlement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settled</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.settledAmount.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">Total received</p>
          </CardContent>
        </Card>
      </div>

      {payouts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No payouts yet</h3>
            <p className="text-muted-foreground">Payouts will appear here after orders are delivered</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payout ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-mono text-sm">{payout.id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-mono text-sm">{payout.order_id.slice(0, 8)}...</TableCell>
                  <TableCell>₹{Number(payout.amount).toLocaleString("en-IN")}</TableCell>
                  <TableCell>₹{Number(payout.commission).toLocaleString("en-IN")}</TableCell>
                  <TableCell className="font-bold">₹{Number(payout.net_amount).toLocaleString("en-IN")}</TableCell>
                  <TableCell>{getStatusBadge(payout.status)}</TableCell>
                  <TableCell>
                    {payout.settled_at
                      ? new Date(payout.settled_at).toLocaleDateString()
                      : new Date(payout.created_at).toLocaleDateString()}
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
