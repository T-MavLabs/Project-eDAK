// eCom/lib/supabaseDiagnostics.ts
// Helper to diagnose Supabase connection issues

export function checkSupabaseConfig(): {
  hasUrl: boolean;
  hasKey: boolean;
  isConfigured: boolean;
  message: string;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const hasUrl = !!url && url !== "https://placeholder.supabase.co";
  const hasKey = !!key && key !== "placeholder-key";
  const isConfigured = hasUrl && hasKey;

  let message = "";
  if (!isConfigured) {
    const missing: string[] = [];
    if (!hasUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!hasKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    message = `Missing environment variables: ${missing.join(", ")}. Please set them in eCom/.env.local`;
  } else {
    message = "Supabase configuration appears valid";
  }

  return { hasUrl, hasKey, isConfigured, message };
}
