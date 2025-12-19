// eCom/lib/permissions.ts
// Permission checking utilities for VYAPAR

import { getUserProfile, getCurrentUserRole, type UserRole } from "@/supabase/auth";
import { supabase } from "@/supabase/client";

/**
 * Check if current user can access a resource
 */
export async function canAccess(
  resource: "product" | "order" | "seller" | "admin",
  action: "read" | "write" | "delete",
  resourceId?: string
): Promise<boolean> {
  const role = await getCurrentUserRole();
  if (!role) return false;

  // Admin has full access
  if (role === "admin") return true;

  switch (resource) {
    case "product":
      if (action === "read") return true; // Public read for approved products
      if (action === "write" || action === "delete") {
        if (!resourceId) return role === "seller";
        // Check if user owns the product
        const { data } = await supabase
          .from("products")
          .select("seller_id")
          .eq("id", resourceId)
          .single();
        const typedData = data as unknown as { seller_id: string } | null;
        if (!typedData) return false;
        // Get seller profile for current user
        const profile = await getUserProfile();
        return typedData.seller_id === profile?.id;
      }
      return false;

    case "order":
      if (action === "read" || action === "write") {
        if (!resourceId) return role === "buyer" || role === "seller";
        // Check ownership
        const { data: order } = await supabase
          .from("orders")
          .select("buyer_id")
          .eq("id", resourceId)
          .single();
        const typedOrder = order as unknown as { buyer_id: string } | null;
        if (!typedOrder) return false;
        const userProfile = await getUserProfile();
        if (typedOrder.buyer_id === userProfile?.id) return true;
        // Check if seller owns products in order
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("product_id")
          .eq("order_id", resourceId);
        const typedOrderItems = (orderItems as Array<{ product_id: string }> | null) || [];
        if (typedOrderItems.length === 0) return false;
        const productIds = typedOrderItems.map((item) => item.product_id);
        const { data: products } = await supabase
          .from("products")
          .select("seller_id")
          .in("id", productIds);
        const typedProducts = (products as Array<{ seller_id: string }> | null) || [];
        return typedProducts.some((p) => p.seller_id === userProfile?.id);
      }
      return false;

    case "seller":
      if (action === "read") return true; // Public read for verified sellers
      if (action === "write") {
        const profile = await getUserProfile();
        return profile?.role === "seller" || profile?.role === "admin";
      }
      return false;

    case "admin":
      // Admins already returned early, so if we reach here, user is not admin
      return false;

    default:
      return false;
  }
}

/**
 * Require specific role, throw if not met
 */
export async function requireRole(requiredRole: UserRole): Promise<void> {
  const role = await getCurrentUserRole();
  if (role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
}

/**
 * Require authentication
 */
export async function requireAuth(): Promise<string> {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error("Authentication required");
  }
  return user.data.user.id;
}

/**
 * Check if user owns a resource
 */
export async function ownsResource(
  table: string,
  resourceId: string,
  userIdColumn: string = "user_id"
): Promise<boolean> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return false;

  const { data } = await supabase
    .from(table)
    .select(userIdColumn)
    .eq("id", resourceId)
    .single();

  const typedData = data as unknown as Record<string, any> | null;
  return typedData?.[userIdColumn] === userId;
}

/**
 * Check if admin is authenticated (hardcoded credentials)
 */
export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("admin_authenticated") === "true";
}

/**
 * Require admin authentication (hardcoded)
 */
export function requireAdminAuth(): void {
  if (!isAdminAuthenticated()) {
    throw new Error("Admin authentication required");
  }
}
