"use client";

import type { Parcel } from "@/lib/mockData";
import { getProductById } from "@/lib/mockProducts";
import { publishParcelToPublicApi } from "@/lib/publicApi";

export type CartItem = {
  productId: string;
  quantity: number;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  digipin: string;
};

export type Order = {
  id: string;
  placedAt: string;
  items: Array<{
    productId: string;
    name: string;
    priceInr: number;
    quantity: number;
  }>;
  subtotalInr: number;
  shippingInr: number;
  totalInr: number;
  paymentMode: "COD" | "Prepaid  ";
  deliveredBy: "India Post";
  trackingId: string;
  destinationCity: string;
  destinationDigipin: string;
  status: "Placed" | "In Transit" | "Delivered";
};

const CART_KEY = "edak_market_cart";
const ORDERS_KEY = "edak_market_orders";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function nowISTLabel() {
  const d = new Date();
  return d
    .toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    })
    .replace(",", "")
    .replace(/\s(am|pm)$/i, (m) => ` ${m.toUpperCase()} IST`);
}

function randomAlphaNum(len: number) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  return safeParse<CartItem[]>(window.localStorage.getItem(CART_KEY), []);
}

export function setCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(productId: string, quantity = 1) {
  const cart = getCart();
  const idx = cart.findIndex((c) => c.productId === productId);
  if (idx >= 0) cart[idx] = { ...cart[idx], quantity: cart[idx].quantity + quantity };
  else cart.push({ productId, quantity });
  setCart(cart);
}

export function updateCartQty(productId: string, quantity: number) {
  const q = Math.max(1, Math.min(10, Math.floor(quantity || 1)));
  const cart = getCart().map((c) => (c.productId === productId ? { ...c, quantity: q } : c));
  setCart(cart);
}

export function removeFromCart(productId: string) {
  const cart = getCart().filter((c) => c.productId !== productId);
  setCart(cart);
}

export function clearCart() {
  setCart([]);
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  return safeParse<Order[]>(window.localStorage.getItem(ORDERS_KEY), []);
}

export function setOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function generateTrackingId(existing: string[] = []): string {
  // India Post-like demo ID: IP + 6 chars + IN
  let attempt = 0;
  while (attempt < 50) {
    const id = `IP${randomAlphaNum(6)}IN`;
    if (!existing.includes(id)) return id;
    attempt += 1;
  }
  return `IP${randomAlphaNum(7)}IN`;
}

function createParcelFromOrder(order: Order, address: ShippingAddress): Parcel {
  const originCity = order.items[0]?.name ? "New Delhi" : "Mumbai";

  return {
    trackingId: order.trackingId,
    articleType: "Business Parcel",
    bookedAt: order.placedAt,
    originCity,
    originDigipin: "DL-110001-0A1B",
    destinationCity: address.city,
    destinationDigipin: address.digipin,
    currentHub: "Delhi AMO",
    currentHubCode: "DEL-AMO",
    currentStatusLabel: "Booked",
    proactiveAlert: {
      severity: "Low",
      title: "Order booked with India Post",
      message:
        "Shipment created by marketplace integration. Next scan expected at origin hub within 3–6 hours.",
      updatedAt: order.placedAt,
    },
    timeline: [
      {
        label: "Booked",
        timestamp: order.placedAt,
        location: `${originCity} Fulfilment Desk`,
        hubCode: "MKP-FUL",
        status: "current",
        detail: "Marketplace manifest received • Ready for handover",
      },
      {
        label: "In Transit",
        timestamp: "Expected",
        location: "Delhi AMO",
        hubCode: "DEL-AMO",
        status: "upcoming",
        detail: "Dispatch to central routing",
      },
      {
        label: "Hub",
        timestamp: "Expected",
        location: "Regional RMS Hub",
        hubCode: "RMS-AUTO",
        status: "upcoming",
        detail: "Automated hub assignment based on DIGIPIN",
      },
      {
        label: "Out for Delivery",
        timestamp: "Expected",
        location: `${address.city} Delivery Office`,
        hubCode: "DO-AUTO",
        status: "upcoming",
      },
    ],
    prediction: {
      estimatedDelayHours: 1,
      probabilityPercent: 24,
      etaWindow: "Within 2–3 working days  ",
      riskFactors: [
        {
          label: "Hub Congestion",
          severity: "Low",
          note: "Standard processing load",
        },
        {
          label: "Route Diversion",
          severity: "Low",
          note: "Dynamic routing based on network health",
        },
      ],
      modelNote:
        "Marketplace shipments use the same predictive pipeline; this preview is mocked for the demo.",
    },
  };
}

export function placeOrder(address: ShippingAddress): {
  order: Order;
  trackingId: string;
} {
  const cart = getCart();
  const enriched = cart
    .map((c) => {
      const p = getProductById(c.productId);
      if (!p) return null;
      return {
        productId: p.id,
        name: p.name,
        priceInr: p.priceInr,
        quantity: c.quantity,
        codAvailable: p.codAvailable,
      };
    })
    .filter(Boolean) as Array<{
    productId: string;
    name: string;
    priceInr: number;
    quantity: number;
    codAvailable: boolean;
  }>;

  const subtotal = enriched.reduce((acc, it) => acc + it.priceInr * it.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 49;

  const existingTrackingIds = [
    ...getOrders().map((o) => o.trackingId),
  ];

  const trackingId = generateTrackingId(existingTrackingIds);

  const paymentMode: Order["paymentMode"] = enriched.every((i) => i.codAvailable)
    ? "COD"
    : "Prepaid  ";

  const order: Order = {
    id: `ORD-${randomAlphaNum(8)}`,
    placedAt: nowISTLabel(),
    items: enriched.map((it) => ({
      productId: it.productId,
      name: it.name,
      priceInr: it.priceInr,
      quantity: it.quantity,
    })),
    subtotalInr: subtotal,
    shippingInr: shipping,
    totalInr: subtotal + shipping,
    paymentMode,
    deliveredBy: "India Post",
    trackingId,
    destinationCity: address.city,
    destinationDigipin: address.digipin,
    status: "Placed",
  };

  const orders = getOrders();
  setOrders([order, ...orders]);

  const parcel = createParcelFromOrder(order, address);
  // Publish to the platform via a mocked public API layer (no direct coupling).
  publishParcelToPublicApi(parcel);

  clearCart();

  return { order, trackingId };
}
