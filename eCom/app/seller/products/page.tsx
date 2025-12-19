"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Package } from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAuth } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProductImageUrl } from "@/supabase/storage";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_path: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerId, setSellerId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const userId = await requireAuth();
        setSellerId(userId);

        // Get seller profile
        const { data: sellerProfile } = await supabase
          .from("seller_profiles")
          .select("id")
          .eq("id", userId)
          .single();

        const typedSellerProfile = sellerProfile as unknown as { id: string } | null;
        if (!typedSellerProfile || !typedSellerProfile.id) return;

        // Load products
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("seller_id", typedSellerProfile.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        const typedProducts = (data as unknown as Array<Product> | null) || [];
        setProducts(typedProducts);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="mb-6 space-y-2">
          <div className="h-8 w-64 rounded-md vyapar-skeleton" />
          <div className="h-4 w-96 rounded-md vyapar-skeleton" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-xl vyapar-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  const activeProducts = products.filter(p => p.is_active).length;
  const inactiveProducts = products.filter(p => !p.is_active).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 vyapar-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Products</h1>
            <p className="text-sm text-muted-foreground">
              Manage your product catalog • {products.length} total products ({activeProducts} active, {inactiveProducts} inactive)
            </p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 vyapar-gentle-transition">
            <Link href="/seller/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <Card className="vyapar-card vyapar-soft-shadow vyapar-fade-in">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-muted mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No products yet</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              Get started by adding your first product. List your items and start selling to customers across India.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 vyapar-gentle-transition">
              <Link href="/seller/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Product
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product, idx) => (
            <Card key={product.id} className="vyapar-card vyapar-fade-in hover:shadow-lg vyapar-gentle-transition overflow-hidden" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="relative h-48 w-full overflow-hidden bg-muted/30">
                <Image
                  src={getProductImageUrl(product.id, product.image_path)}
                  alt={product.name}
                  fill
                  className="object-cover vyapar-gentle-transition"
                  unoptimized
                />
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant={product.is_active ? "default" : "secondary"}
                    className={product.is_active ? "bg-primary text-primary-foreground" : ""}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-snug line-clamp-2 flex-1">{product.name}</CardTitle>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {product.status || "draft"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Price</div>
                    <div className="text-xl font-semibold text-primary">₹{Number(product.price).toLocaleString("en-IN")}</div>
                  </div>
                  <Badge variant="secondary" className="vyapar-chip">{product.category}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 vyapar-gentle-transition" asChild>
                    <Link href={`/seller/products/${product.id}/edit`}>
                      <Edit className="mr-2 h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 vyapar-gentle-transition text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </Button>
                  <Button variant="outline" size="sm" className="vyapar-gentle-transition" asChild>
                    <Link href={`/market/product/${product.id}`}>
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
