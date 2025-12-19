"use client";

import { useEffect, useState } from "react";
import { Package, AlertTriangle } from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAuth } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function InventoryRow({
  item,
  isLowStock,
  updating,
  onUpdate,
}: {
  item: InventoryItem;
  isLowStock: boolean;
  updating: boolean;
  onUpdate: (productId: string, quantity: number) => void;
}) {
  const [newQuantity, setNewQuantity] = useState(String(item.quantity));

  return (
    <TableRow>
      <TableCell className="font-medium">{item.product_name}</TableCell>
      <TableCell>{item.variant_name || "Default"}</TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell>{item.reserved}</TableCell>
      <TableCell>
        <span className={isLowStock ? "text-destructive font-bold" : ""}>
          {item.available}
        </span>
      </TableCell>
      <TableCell>
        {isLowStock ? (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Low Stock
          </Badge>
        ) : (
          <Badge variant="default">In Stock</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            className="w-24"
          />
          <Button
            size="sm"
            onClick={() => onUpdate(item.product_id, parseInt(newQuantity) || 0)}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update"}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface InventoryItem {
  product_id: string;
  product_name: string;
  variant_id: string | null;
  variant_name: string | null;
  quantity: number;
  reserved: number;
  available: number;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
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
      if (typedProducts.length === 0) {
        setInventory([]);
        setLoading(false);
        return;
      }

      // Try to load from inventory table (if it exists)
      const { data: inventoryData } = await supabase
        .from("inventory")
        .select(`
          product_id,
          variant_id,
          quantity,
          reserved
        `)
        .in("product_id", typedProducts.map((p) => p.id));

      const typedInventoryData = (inventoryData as Array<{
        product_id: string;
        variant_id: string | null;
        quantity: number;
        reserved: number;
      }> | null) || [];

      // If no inventory table or no data, show products with default stock
      if (!inventoryData || typedInventoryData.length === 0) {
        setInventory(
          typedProducts.map((p) => ({
            product_id: p.id,
            product_name: p.name,
            variant_id: null,
            variant_name: null,
            quantity: 0,
            reserved: 0,
            available: 0,
          }))
        );
      } else {
        // Map inventory data with product names
        const inventoryMap = new Map(
          typedProducts.map((p) => [p.id, p.name])
        );
        setInventory(
          typedInventoryData.map((inv) => ({
            product_id: inv.product_id,
            product_name: inventoryMap.get(inv.product_id) || "Unknown",
            variant_id: inv.variant_id,
            variant_name: null,
            quantity: inv.quantity || 0,
            reserved: inv.reserved || 0,
            available: (inv.quantity || 0) - (inv.reserved || 0),
          }))
        );
      }
    } catch (err) {
      console.error("Error loading inventory:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    setUpdating(productId);
    try {
      // Check if inventory record exists
      const { data: existing } = await supabase
        .from("inventory")
        .select("id")
        .eq("product_id", productId)
        .is("variant_id", null)
        .single();

      const typedExisting = existing as unknown as { id: string } | null;
      if (typedExisting) {
        // Update existing
        const { error } = await supabase
          .from("inventory")
          .update({ quantity: newQuantity })
          .eq("id", typedExisting.id);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("inventory")
          .insert({
            product_id: productId,
            variant_id: null,
            quantity: newQuantity,
            reserved: 0,
          });
        if (error) throw error;
      }

      await loadInventory();
    } catch (err) {
      console.error("Error updating inventory:", err);
      alert("Failed to update inventory");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div>Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">Track and manage stock levels for your products</p>
      </div>

      {inventory.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No inventory items</h3>
            <p className="text-muted-foreground">Add products to start tracking inventory</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Total Stock</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => {
                const isLowStock = item.available < 10;
                return (
                  <InventoryRow
                    key={`${item.product_id}-${item.variant_id || "default"}`}
                    item={item}
                    isLowStock={isLowStock}
                    updating={updating === item.product_id}
                    onUpdate={handleUpdateQuantity}
                  />
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
