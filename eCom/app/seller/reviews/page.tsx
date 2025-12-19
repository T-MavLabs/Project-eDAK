"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAuth } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: string;
  product_id: string;
  product_name: string;
  buyer_id: string;
  buyer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  is_approved: boolean;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    fiveStar: 0,
  });

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      const userId = await requireAuth();

      // Get seller profile
      const { data: sellerProfile } = await supabase
        .from("seller_profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (!sellerProfile) return;

      // Get seller's products
      const { data: products } = await supabase
        .from("products")
        .select("id, name")
        .eq("seller_id", sellerProfile.id);

      const productIds = products?.map((p) => p.id) || [];
      if (productIds.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      // Try to load reviews (if table exists)
      const { data: reviewData, error } = await supabase
        .from("reviews")
        .select(`
          *,
          product:products(id, name),
          buyer:user_profiles(id, full_name)
        `)
        .in("product_id", productIds)
        .order("created_at", { ascending: false });

      if (error && error.code !== "42P01") {
        throw error;
      }

      if (reviewData) {
        const mappedReviews = reviewData.map((r: any) => ({
          id: r.id,
          product_id: r.product_id,
          product_name: r.product?.name || "Unknown Product",
          buyer_id: r.buyer_id,
          buyer_name: r.buyer?.full_name || "Anonymous",
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          is_approved: r.is_approved,
        }));
        setReviews(mappedReviews);

        // Calculate stats
        const total = mappedReviews.length;
        const average = total > 0
          ? mappedReviews.reduce((sum, r) => sum + r.rating, 0) / total
          : 0;
        const fiveStar = mappedReviews.filter((r) => r.rating === 5).length;

        setStats({
          totalReviews: total,
          averageRating: average,
          fiveStar,
        });
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Product Reviews</h1>
        <p className="text-muted-foreground">View and manage customer reviews</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="flex gap-1 mt-1">
              {renderStars(Math.round(stats.averageRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fiveStar}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReviews > 0
                ? `${Math.round((stats.fiveStar / stats.totalReviews) * 100)}% of total`
                : "0%"}
            </p>
          </CardContent>
        </Card>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground">Customer reviews will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{review.product_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">by {review.buyer_name}</p>
                  </div>
                  <Badge variant={review.is_approved ? "default" : "secondary"}>
                    {review.is_approved ? "Approved" : "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm">{review.comment}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
