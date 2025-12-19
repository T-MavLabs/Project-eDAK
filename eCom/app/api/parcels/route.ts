import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * API route to create parcels (bypasses RLS using service role key)
 * This is needed because parcels table RLS doesn't allow customer inserts
 */
export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Check for both possible typo variations
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLL_KEY;

    if (!supabaseUrl) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
      return NextResponse.json(
        { error: "Server configuration error: NEXT_PUBLIC_SUPABASE_URL not set" },
        { status: 500 }
      );
    }

    if (!supabaseServiceKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json(
        { error: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY not set. Please add it to your .env.local file. (Note: It should be 'ROLE' not 'ROLL')" },
        { status: 500 }
      );
    }

    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });

    const body = await req.json();
    const {
      tracking_id,
      sender_user_id,
      receiver_user_id,
      origin_digipin,
      destination_digipin,
      origin_region_code,
      destination_region_code,
      status = "created",
    } = body;

    // Validate required fields
    if (!tracking_id || !origin_digipin || !destination_digipin) {
      return NextResponse.json(
        { error: "Missing required fields: tracking_id, origin_digipin, destination_digipin" },
        { status: 400 }
      );
    }

    // Validate DIGIPIN format (6-32 characters)
    if (origin_digipin.length < 6 || origin_digipin.length > 32) {
      return NextResponse.json(
        { error: "origin_digipin must be between 6 and 32 characters" },
        { status: 400 }
      );
    }

    if (destination_digipin.length < 6 || destination_digipin.length > 32) {
      return NextResponse.json(
        { error: "destination_digipin must be between 6 and 32 characters" },
        { status: 400 }
      );
    }

    // Validate tracking_id format (6-32 characters)
    if (tracking_id.length < 6 || tracking_id.length > 32) {
      return NextResponse.json(
        { error: "tracking_id must be between 6 and 32 characters" },
        { status: 400 }
      );
    }

    // Insert parcel using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from("parcels")
      .insert({
        tracking_id,
        sender_user_id: sender_user_id || null,
        receiver_user_id: receiver_user_id || null,
        origin_digipin,
        destination_digipin,
        origin_region_code: origin_region_code || null,
        destination_region_code: destination_region_code || null,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error creating parcel:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: `Failed to create parcel: ${error.message || error.code || "Unknown error"}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error in parcels API route:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: `Unexpected error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
