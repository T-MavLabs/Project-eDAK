// Backend/supabase/functions/parcel-create/index.ts
// Creates a new parcel, generates tracking_id, stores DIGIPIN origin/destination,
// creates initial parcel_event (Booked), and writes an audit log entry.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  getAuthContext,
  json,
  requireAnyRole,
  requireMethod,
  sha256Hex,
  stableStringify,
} from "../auth-utils/index.ts";
import { digipinEncode } from "../digipin/index.ts";

type ParcelCreateInput = {
  sender_id: string;
  receiver_id: string;
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
};

function generateTrackingId(): string {
  // Format: IP-XXXXXX (uppercase, alphanumeric)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoids ambiguous 0/O/1/I
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let suffix = "";
  for (let i = 0; i < bytes.length; i++) {
    suffix += alphabet[bytes[i] % alphabet.length];
  }
  return `IP-${suffix}`;
}

export default async function handler(req: Request): Promise<Response> {
  try {
    requireMethod(req, "POST");

    const ctx = await getAuthContext(req);

    // Parcel creation is allowed for admins (post_admin/regional_admin) and customers (platform booking).
    requireAnyRole(ctx.profile, ["customer", "post_admin", "regional_admin"]);

    const input = (await req.json()) as ParcelCreateInput;

    if (!input?.sender_id || !input?.receiver_id) {
      return json({ error: "sender_id and receiver_id are required" }, { status: 400 });
    }

    const coords = [
      input.origin_lat,
      input.origin_lng,
      input.destination_lat,
      input.destination_lng,
    ];
    if (coords.some((n) => typeof n !== "number" || Number.isNaN(n))) {
      return json({ error: "Invalid coordinates" }, { status: 400 });
    }

    // DIGIPIN encode
    const origin_digipin = await digipinEncode(input.origin_lat, input.origin_lng);
    const destination_digipin = await digipinEncode(input.destination_lat, input.destination_lng);

    // Use service role to write core tables.
    const supabaseAdmin = createClient(ctx.supabaseUrl, ctx.serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Generate unique tracking_id with a few retries.
    let tracking_id = generateTrackingId();
    let parcelId: string | null = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const expected_delivery_date = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      const { data, error } = await supabaseAdmin
        .from("parcels")
        .insert({
          tracking_id,
          sender_user_id: input.sender_id,
          receiver_user_id: input.receiver_id,
          origin_digipin,
          destination_digipin,
          status: "created",
          expected_delivery_date,
        })
        .select("id")
        .single();

      if (!error && data?.id) {
        parcelId = data.id;
        break;
      }

      // If tracking_id collision, retry.
      tracking_id = generateTrackingId();

      if (attempt === 4) {
        console.error("parcel-create failed to insert parcel", { error });
        return json({ error: "Failed to create parcel" }, { status: 500 });
      }
    }

    if (!parcelId) {
      return json({ error: "Failed to create parcel" }, { status: 500 });
    }

    // Initial event (Booked)
    await supabaseAdmin.from("parcel_events").insert({
      parcel_id: parcelId,
      tracking_id,
      status: "created",
      message: "Booked",
      metadata: {
        source: "parcel-create",
      },
    });

    // Audit log (entity_type = parcel, action = created)
    const auditPayload = {
      entity_type: "parcel",
      action: "created",
      tracking_id,
      parcel_id: parcelId,
      actor_user_id: ctx.userId,
      origin_digipin,
      destination_digipin,
      at: new Date().toISOString(),
    };

    const deterministic = stableStringify(auditPayload);
    const hash = await sha256Hex(deterministic);

    await supabaseAdmin.from("audit_logs").insert({
      entity_type: "parcel",
      entity_id: parcelId,
      action: "created",
      actor_user_id: ctx.userId,
      hash,
      data: auditPayload,
    });

    return json({ tracking_id }, { status: 200 });
  } catch (err) {
    const status =
      typeof err === "object" && err && "status" in err
        ? (err as { status?: number }).status ?? 500
        : 500;
    const message = err instanceof Error ? err.message : "Internal error";
    if (status >= 500) console.error("parcel-create error", err);
    return json({ error: message }, { status });
  }
}
