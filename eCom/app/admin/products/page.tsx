"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, CheckCircle2, XCircle, Archive, Search, Eye } from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAdminAuth, isAdminAuthenticated } from "@/lib/permissions";
import { getProductImageUrl } from "@/supabase/storage";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image_path: string | null;
  seller_name: string;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "archived";
  is_active: boolean;
  created_at: string;
  seller_id: string | null;
  rejection_reason: string | null;
};

function AdminProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState(statusFilter);

  useEffect(() => {
    async function loadProducts() {
      try {
        if (!isAdminAuthenticated()) {
          router.push("/auth/admin-login");
          return;
        }

        requireAdminAuth();

        // Build query - admins can see all products
        let query = supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        // Apply status filter
        if (filterStatus !== "all") {
          query = query.eq("status", filterStatus);
        }

        const { data, error } = await query;

        if (error) throw error;

        setProducts((data || []) as unknown as Product[]);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [router, filterStatus]);

  const handleStatusChange = async (
    productId: string,
    newStatus: "approved" | "rejected" | "archived",
    reason?: string
  ) => {
    try {
      requireAdminAuth();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const updateData: any = {
        status: newStatus,
        is_active: newStatus === "approved",
      };

      if (newStatus === "approved") {
        updateData.approved_at = new Date().toISOString();
        // Note: approved_by would need service role client
      }

      if (newStatus === "rejected" && reason) {
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", productId);

      if (error) throw error;

      // Log admin action
      try {
        await supabase.from("admin_actions").insert({
          admin_id: user?.id || "00000000-0000-0000-0000-000000000000",
          action_type:
            newStatus === "approved"
              ? "product_approve"
              : newStatus === "rejected"
                ? "product_reject"
                : "product_archive",
          target_type: "product",
          target_id: productId,
          action_data: { reason },
        });
      } catch (logError) {
        console.error("Failed to log admin action:", logError);
      }

      // Reload products
      window.location.reload();
    } catch (err) {
      console.error("Error updating product status:", err);
      alert("Failed to update product status");
    }
  };

  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.seller_name.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default",
      pending_approval: "secondary",
      draft: "secondary",
      rejected: "destructive",
      archived: "outline",
    };

    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div>Loading products...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Product Moderation</h1>
          <p className="text-sm text-muted-foreground">
            Review and approve products for the marketplace
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin")}>
          Back to Dashboard
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name, category, or seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No products found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_path ? (
                            <div className="relative h-12 w-12 overflow-hidden rounded-md">
                              <Image
                                src={getProductImageUrl(product.id, product.image_path)}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell>₹{parseFloat(product.price).toLocaleString("en-IN")}</TableCell>
                      <TableCell>{product.seller_name}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(product.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link href={`/market/product/${product.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          {product.status === "pending_approval" ||
                          product.status === "draft" ? (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  handleStatusChange(product.id, "approved")
                                }
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  const reason = prompt("Rejection reason:");
                                  if (reason) {
                                    handleStatusChange(product.id, "rejected", reason);
                                  }
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : product.status === "approved" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusChange(product.id, "archived")
                              }
                            >
                              <Archive className="h-4 w-4 mr-1" />
                              Archive
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div>Loading...</div>
      </div>
    }>
      <AdminProductsPageContent />
    </Suspense>
  );
}
