// eCom/supabase/queries.ts
// Small query layer for the eCom demo.

import { supabase } from "./client";

export type DbProduct = {
  id: string;
  name: string;
  description: string;
  price: string; // numeric comes back as string
  category: string;
  image_path?: string | null;
  seller_name: string;
  is_active: boolean;
  created_at: string;
};

export type DbOrderStatus = "placed" | "shipped";

export type DbOrder = {
  id: string;
  user_email: string;
  total_amount: string;
  digipin: string;
  tracking_id: string | null;
  status: DbOrderStatus;
  created_at: string;
};

export type DbOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: string;
};

export async function fetchActiveProducts(): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,description,price,category,image_path,seller_name,is_active,created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DbProduct[];
}

export async function fetchProductById(id: string): Promise<DbProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,description,price,category,image_path,seller_name,is_active,created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  if (!data.is_active) return null;
  return data as DbProduct;
}

export async function fetchProductsByIds(ids: string[]): Promise<DbProduct[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("products")
    .select("id,name,description,price,category,image_path,seller_name,is_active,created_at")
    .in("id", ids);

  if (error) throw error;
  return (data ?? []) as DbProduct[];
}

export async function createOrder(input: {
  user_email: string;
  total_amount: number;
  digipin: string;
  status?: DbOrderStatus;
}): Promise<DbOrder> {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_email: input.user_email,
      total_amount: input.total_amount,
      digipin: input.digipin,
      status: input.status ?? "placed",
    })
    .select("id,user_email,total_amount,digipin,tracking_id,status,created_at")
    .single();

  if (error) throw error;
  return data as DbOrder;
}

export async function createOrderItems(
  orderId: string,
  items: Array<{ product_id: string; quantity: number; price_at_purchase: number }>,
): Promise<DbOrderItem[]> {
  const payload = items.map((it) => ({
    order_id: orderId,
    product_id: it.product_id,
    quantity: it.quantity,
    price_at_purchase: it.price_at_purchase,
  }));

  const { data, error } = await supabase
    .from("order_items")
    .insert(payload)
    .select("id,order_id,product_id,quantity,price_at_purchase");

  if (error) throw error;
  return (data ?? []) as DbOrderItem[];
}

export async function setOrderTrackingId(orderId: string, trackingId: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ tracking_id: trackingId })
    .eq("id", orderId);

  if (error) throw error;
}

export async function fetchOrdersByEmail(email: string): Promise<DbOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id,user_email,total_amount,digipin,tracking_id,status,created_at")
    .eq("user_email", email)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DbOrder[];
}
