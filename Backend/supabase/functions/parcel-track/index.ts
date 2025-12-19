// Backend/supabase/functions/parcel-track/index.ts
// Public (JWT-authenticated) tracking endpoint.
// Returns parcel details + timeline + latest prediction (if exists).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getAuthContext, json, requireAnyRole, requireMethod } from "../auth-utils/index.ts";

export default async function handler(req: Request): Promise<Response> {
  try {
    requireMethod(req, "GET");

    const ctx = await getAuthContext(req);

    // Customers can call parcel-track; admins can too.
    requireAnyRole(ctx.profile, ["customer", "delivery_agent", "post_admin", "regional_admin"]);

    const url = new URL(req.url);
    const tracking_id = (url.searchParams.get("tracking_id") || "").trim();

    if (!tracking_id) {
      return json({ error: "tracking_id query param is required" }, { status: 400 });
    }

    const supabaseAdmin = createClient(ctx.supabaseUrl, ctx.serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: parcel, error: parcelErr } = await supabaseAdmin
      .from("parcels")
      .select(
        "id, tracking_id, sender_user_id, receiver_user_id, origin_digipin, destination_digipin, origin_region_code, destination_region_code, current_hub_code, current_region_code, status, expected_delivery_date, delivered_at, created_at, updated_at",
      )
      .eq("tracking_id", tracking_id)
      .maybeSingle();

    if (parcelErr) {
      console.error("parcel-track parcel query failed", parcelErr);
      return json({ error: "Failed to load parcel" }, { status: 500 });
    }

    if (!parcel) {
      return json({ error: "Parcel not found" }, { status: 404 });
    }

    // Basic access checks (API-first enforcement here, independent of RLS)
    if (ctx.profile.role === "customer") {
      const owns = parcel.sender_user_id === ctx.userId || parcel.receiver_user_id === ctx.userId;
      if (!owns) return json({ error: "Forbidden" }, { status: 403 });
    }

    if (ctx.profile.role === "delivery_agent") {
      if (!ctx.profile.hub_code || parcel.current_hub_code !== ctx.profile.hub_code) {
        return json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (ctx.profile.role === "regional_admin") {
      const region = ctx.profile.region_code;
      if (
        !region ||
        !(
          parcel.current_region_code === region ||
          parcel.origin_region_code === region ||
          parcel.destination_region_code === region
        )
      ) {
        return json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { data: events, error: eventsErr } = await supabaseAdmin
      .from("parcel_events")
      .select("id, event_time, hub_code, region_code, status, message, metadata")
      .eq("tracking_id", tracking_id)
      .order("event_time", { ascending: false });

    if (eventsErr) {
      console.error("parcel-track events query failed", eventsErr);
      return json({ error: "Failed to load events" }, { status: 500 });
    }

    const { data: prediction, error: predErr } = await supabaseAdmin
      .from("delivery_predictions")
      .select("id, predicted_delay_hours, probability_score, risk_factors, model_version, generated_at")
      .eq("tracking_id", tracking_id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (predErr) {
      console.error("parcel-track prediction query failed", predErr);
      return json({ error: "Failed to load prediction" }, { status: 500 });
    }

    return json(
      {
        parcel,
        events: events ?? [],
        prediction: prediction ?? null,
      },
      { status: 200 },
    );
  } catch (err) {
    const status =
      typeof err === "object" && err && "status" in err
        ? (err as { status?: number }).status ?? 500
        : 500;
    const message = err instanceof Error ? err.message : "Internal error";
    if (status >= 500) console.error("parcel-track error", err);
    return json({ error: message }, { status });
  }
}
