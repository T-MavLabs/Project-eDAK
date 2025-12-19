// eCom/supabase/client.ts
// Supabase client for VYAPAR marketplace.
//
// Production-ready client with auth support and RLS.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in eCom/.env.local";
  
  // Only throw in server-side context
  if (typeof window === "undefined") {
    throw new Error(errorMsg);
  } else {
    // In browser, log error but allow app to continue (will fail gracefully on auth calls)
    console.error(`⚠️ ${errorMsg}`);
  }
}

// Client-side Supabase client (for browser)
// Will fail gracefully if env vars are missing
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient<Database>("https://placeholder.supabase.co", "placeholder-key", {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

// Server-side Supabase client (for API routes, server components)
// Uses service role key for admin operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  if (!supabaseServiceKey) {
    // Fallback to anon key if service key not available
    return createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper to get admin client (server-side only)
export function getSupabaseAdmin() {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL not configured");
  }
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
