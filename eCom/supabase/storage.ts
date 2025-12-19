// eCom/supabase/storage.ts
// Supabase Storage helpers for product images.

import { supabase } from "./client";

const BUCKET = "product-images";

// Local, always-available placeholder (keeps UI stable if storage image missing).
const FALLBACK_PLACEHOLDER = "/products/book.svg";

/**
 * Returns a URL usable by next/image.
 *
 * - Prefers Supabase Storage public URL if imagePath is set
 * - Otherwise uses a local placeholder
 */
export function getProductImageUrl(
  productId: string,
  imagePath?: string | null,
): string {
  const path = (imagePath ?? "").trim();
  if (path) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    if (data?.publicUrl) return data.publicUrl;
  }

  // Last-resort: stable local placeholder
  return FALLBACK_PLACEHOLDER;
}

/**
 * Canonical path format: product-images/{product_id}/main.jpg
 * Stored in products.image_path as: {product_id}/main.jpg
 */
export function defaultProductImagePath(productId: string): string {
  return `${productId}/main.jpg`;
}
