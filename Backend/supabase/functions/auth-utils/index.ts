// Backend/supabase/functions/auth-utils/index.ts
// Shared auth + RBAC helpers for Supabase Edge Functions (Deno).
//
// - Validates JWT via Supabase Auth (getUser)
// - Fetches role and scope from public.profiles
// - Provides strict role checks

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export type UserRole =
  | "customer"
  | "delivery_agent"
  | "post_admin"
  | "regional_admin";

export type Profile = {
  id: string;
  role: UserRole;
  hub_code: string | null;
  region_code: string | null;
};

export type AuthContext = {
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  jwt: string;
  userId: string;
  profile: Profile;
};

function envOrThrow(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function json(
  body: unknown,
  init: ResponseInit & { headers?: HeadersInit } = {},
): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function requireMethod(req: Request, method: string) {
  if (req.method !== method) {
    throw Object.assign(new Error("Method not allowed"), { status: 405 });
  }
}

export function getBearerToken(req: Request): string {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth) throw Object.assign(new Error("Missing Authorization header"), { status: 401 });
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) throw Object.assign(new Error("Invalid Authorization header"), { status: 401 });
  return m[1];
}

export async function getAuthContext(req: Request): Promise<AuthContext> {
  const supabaseUrl = envOrThrow("SUPABASE_URL");
  const anonKey = envOrThrow("SUPABASE_ANON_KEY");
  const serviceRoleKey = envOrThrow("SUPABASE_SERVICE_ROLE_KEY");

  const jwt = getBearerToken(req);

  // 1) Validate JWT (using anon client + Authorization header)
  const supabaseAuthClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userErr } = await supabaseAuthClient.auth.getUser();
  if (userErr || !userData.user) {
    throw Object.assign(new Error("Unauthorized"), { status: 401, cause: userErr });
  }

  const userId = userData.user.id;

  // 2) Fetch RBAC profile using service role (bypasses RLS, but we still enforce access here)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: profile, error: profileErr } = await supabaseAdmin
    .from("profiles")
    .select("id, role, hub_code, region_code")
    .eq("id", userId)
    .maybeSingle();

  if (profileErr) {
    throw Object.assign(new Error("Failed to load profile"), { status: 500, cause: profileErr });
  }

  // Secure-by-default: if profile missing, treat as customer with no scope
  const normalized: Profile = {
    id: userId,
    role: (profile?.role as UserRole) ?? "customer",
    hub_code: (profile?.hub_code as string | null) ?? null,
    region_code: (profile?.region_code as string | null) ?? null,
  };

  return { supabaseUrl, anonKey, serviceRoleKey, jwt, userId, profile: normalized };
}

export function requireAnyRole(profile: Profile, allowed: UserRole[]) {
  if (!allowed.includes(profile.role)) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
}

export function isAdminRole(role: UserRole): boolean {
  return role === "post_admin" || role === "regional_admin";
}

export function stableStringify(value: unknown): string {
  // Deterministic JSON serialization (stable key ordering) for audit hashing.
  const seen = new WeakSet<object>();

  const stringify = (v: unknown): string => {
    if (v === null || typeof v !== "object") return JSON.stringify(v);

    if (v instanceof Date) return JSON.stringify(v.toISOString());

    if (Array.isArray(v)) {
      return `[${v.map((x) => stringify(x)).join(",")}]`;
    }

    const obj = v as Record<string, unknown>;
    if (seen.has(obj)) throw new Error("Cannot stableStringify circular structure");
    seen.add(obj);

    const keys = Object.keys(obj).sort();
    const body = keys.map((k) => `${JSON.stringify(k)}:${stringify(obj[k])}`).join(",");
    return `{${body}}`;
  };

  return stringify(value);
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function mapStatusToEnum(status: string):
  | "created"
  | "picked_up"
  | "in_transit"
  | "at_hub"
  | "out_for_delivery"
  | "delivered"
  | "failed_delivery"
  | "returned"
  | "cancelled" {
  const s = status.trim().toLowerCase();

  if (s === "booked" || s === "created") return "created";
  if (s === "picked up" || s === "picked_up") return "picked_up";
  if (s === "in transit" || s === "in_transit") return "in_transit";
  if (s === "at hub" || s === "at_hub") return "at_hub";
  if (s === "out for delivery" || s === "out_for_delivery") return "out_for_delivery";
  if (s === "delivered") return "delivered";
  if (s === "failed delivery" || s === "failed_delivery") return "failed_delivery";
  if (s === "returned") return "returned";
  if (s === "cancelled" || s === "canceled") return "cancelled";

  throw Object.assign(new Error("Invalid status"), { status: 400 });
}
