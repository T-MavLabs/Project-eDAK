// Backend/supabase/functions/parcel-events/index.ts
// Adds new parcel tracking events (delivery agents / admins) and updates parcel current state.
// Also writes an audit log entry.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  getAuthContext,
  json,
  mapStatusToEnum,
  requireAnyRole,
  requireMethod,
  sha256Hex,
  stableStringify,
} from "../auth-utils/index.ts";

type ParcelEventInput = {
  tracking_id: string;
  status: string;
  hub: string;
};

export default async function handler(req: Request): Promise<Response> {
  try {
    requireMethod(req, "POST");

    const ctx = await getAuthContext(req);

    // Only delivery agents or admins can add events.
    requireAnyRole(ctx.profile, ["delivery_agent", "post_admin", "regional_admin"]);

    const input = (await req.json()) as ParcelEventInput;
    const tracking_id = (input?.tracking_id || "").trim();
    const hub_code = (input?.hub || "").trim();

    if (!tracking_id || !hub_code || !input?.status) {
      return json({ error: "tracking_id, status, and hub are required" }, { status: 400 });
    }

    const statusEnum = mapStatusToEnum(input.status);

    // Delivery agent constraint: must be writing for their hub
    if (ctx.profile.role === "delivery_agent") {
      if (!ctx.profile.hub_code || ctx.profile.hub_code !== hub_code) {
        return json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const supabaseAdmin = createClient(ctx.supabaseUrl, ctx.serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: parcel, error: parcelErr } = await supabaseAdmin
      .from("parcels")
      .select("id, current_hub_code, current_region_code")
      .eq("tracking_id", tracking_id)
      .maybeSingle();

    if (parcelErr) {
      console.error("parcel-events parcel lookup failed", parcelErr);
      return json({ error: "Failed to load parcel" }, { status: 500 });
    }

    if (!parcel) return json({ error: "Parcel not found" }, { status: 404 });

    // Regional admin constraint: if region scope is present, enforce it
    if (ctx.profile.role === "regional_admin" && ctx.profile.region_code) {
      if (parcel.current_region_code && parcel.current_region_code !== ctx.profile.region_code) {
        return json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Insert event
    const { error: eventErr } = await supabaseAdmin.from("parcel_events").insert({
      parcel_id: parcel.id,
      tracking_id,
      hub_code,
      region_code: parcel.current_region_code,
      status: statusEnum,
      message: input.status,
      metadata: {
        source: "parcel-events",
        actor_role: ctx.profile.role,
      },
    });

    if (eventErr) {
      console.error("parcel-events insert event failed", eventErr);
      return json({ error: "Failed to insert event" }, { status: 500 });
    }

    // Update parcel current state
    const patch: Record<string, unknown> = {
      status: statusEnum,
      current_hub_code: hub_code,
    };

    if (statusEnum === "delivered") {
      patch.delivered_at = new Date().toISOString();
    }

    const { error: updErr } = await supabaseAdmin
      .from("parcels")
      .update(patch)
      .eq("id", parcel.id);

    if (updErr) {
      console.error("parcel-events update parcel failed", updErr);
      return json({ error: "Failed to update parcel" }, { status: 500 });
    }

    // Audit log (entity_type = parcel, action = status_update)
    const auditPayload = {
      entity_type: "parcel",
      action: "status_update",
      tracking_id,
      parcel_id: parcel.id,
      actor_user_id: ctx.userId,
      hub_code,
      status: statusEnum,
      at: new Date().toISOString(),
    };

    const deterministic = stableStringify(auditPayload);
    const hash = await sha256Hex(deterministic);

    await supabaseAdmin.from("audit_logs").insert({
      entity_type: "parcel",
      entity_id: parcel.id,
      action: "status_update",
      actor_user_id: ctx.userId,
      hash,
      data: auditPayload,
    });

    return json({ ok: true }, { status: 200 });
  } catch (err) {
    const status =
      typeof err === "object" && err && "status" in err
        ? (err as { status?: number }).status ?? 500
        : 500;
    const message = err instanceof Error ? err.message : "Internal error";
    if (status >= 500) console.error("parcel-events error", err);
    return json({ error: message }, { status });
  }
}
