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
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 overflow-x-hidden">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="ux4g-headline">Product moderation</h1>
          <p className="ux4g-body text-muted-foreground mt-1">
            Review and approve products for the marketplace
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin")} className="min-h-[44px] ux4g-label w-full sm:w-auto">
          Back to dashboard
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <Input
                placeholder="Search by product name, category, or seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md min-w-0"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px] min-h-[44px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                <SelectItem value="pending_approval">Pending approval</SelectItem>
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
          <CardTitle className="ux4g-title">Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="py-8 text-center ux4g-body text-muted-foreground">
              No products found
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="ux4g-label">Product</TableHead>
                      <TableHead className="ux4g-label">Category</TableHead>
                      <TableHead className="ux4g-label">Price</TableHead>
                      <TableHead className="ux4g-label">Seller</TableHead>
                      <TableHead className="ux4g-label">Status</TableHead>
                      <TableHead className="ux4g-label">Created</TableHead>
                      <TableHead className="text-right ux4g-label">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3 min-w-0">
                            {product.image_path ? (
                              <div className="relative h-12 w-12 overflow-hidden rounded-md flex-shrink-0">
                                <Image
                                  src={getProductImageUrl(product.id, product.image_path)}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted flex-shrink-0">
                                <Package className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="ux4g-label font-medium break-words">{product.name}</div>
                              <div className="ux4g-body-small text-muted-foreground line-clamp-1">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize ux4g-body">{product.category}</TableCell>
                        <TableCell className="ux4g-label">₹{parseFloat(product.price).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="ux4g-body break-words">{product.seller_name}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell className="ux4g-body-small text-muted-foreground">
                          {new Date(product.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="min-h-[44px] ux4g-label"
                            >
                              <Link href={`/market/product/${product.id}`}>
                                <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
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
                                  className="min-h-[44px] ux4g-label"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" aria-hidden="true" />
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
                                  className="min-h-[44px] ux4g-label"
                                >
                                  <XCircle className="h-4 w-4 mr-1" aria-hidden="true" />
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
                                className="min-h-[44px] ux4g-label"
                              >
                                <Archive className="h-4 w-4 mr-1" aria-hidden="true" />
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

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          {product.image_path ? (
                            <div className="relative h-16 w-16 overflow-hidden rounded-md flex-shrink-0">
                              <Image
                                src={getProductImageUrl(product.id, product.image_path)}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted flex-shrink-0">
                              <Package className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="ux4g-title mb-1 break-words">{product.name}</div>
                            <div className="ux4g-body-small text-muted-foreground line-clamp-2">
                              {product.description}
                            </div>
                          </div>
                          {getStatusBadge(product.status)}
                        </div>
                        
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <div className="ux4g-label text-muted-foreground mb-1">Category</div>
                            <div className="ux4g-body capitalize">{product.category}</div>
                          </div>
                          <div>
                            <div className="ux4g-label text-muted-foreground mb-1">Price</div>
                            <div className="ux4g-label font-semibold">₹{parseFloat(product.price).toLocaleString("en-IN")}</div>
                          </div>
                          <div>
                            <div className="ux4g-label text-muted-foreground mb-1">Seller</div>
                            <div className="ux4g-body break-words">{product.seller_name}</div>
                          </div>
                          <div>
                            <div className="ux4g-label text-muted-foreground mb-1">Created</div>
                            <div className="ux4g-body-small">{new Date(product.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 pt-2 border-t">
                          <Button variant="outline" className="w-full min-h-[44px] ux4g-label" asChild>
                            <Link href={`/market/product/${product.id}`}>
                              <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                              View product
                            </Link>
                          </Button>
                          {product.status === "pending_approval" || product.status === "draft" ? (
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="default"
                                onClick={() => handleStatusChange(product.id, "approved")}
                                className="min-h-[44px] ux4g-label"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden="true" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  const reason = prompt("Rejection reason:");
                                  if (reason) {
                                    handleStatusChange(product.id, "rejected", reason);
                                  }
                                }}
                                className="min-h-[44px] ux4g-label"
                              >
                                <XCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                                Reject
                              </Button>
                            </div>
                          ) : product.status === "approved" ? (
                            <Button
                              variant="outline"
                              onClick={() => handleStatusChange(product.id, "archived")}
                              className="w-full min-h-[44px] ux4g-label"
                            >
                              <Archive className="h-4 w-4 mr-2" aria-hidden="true" />
                              Archive
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
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
