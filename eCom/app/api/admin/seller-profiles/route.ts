// API route for admin to create/update seller profiles
// Uses service role key to bypass RLS

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sellerId, newStatus, notes, userProfile } = body;

    if (!sellerId || !newStatus) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "Server configuration error: NEXT_PUBLIC_SUPABASE_URL not set" },
        { status: 500 }
      );
    }

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY not set. Please add it to your .env.local file." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from("seller_profiles")
      .select("id")
      .eq("id", sellerId)
      .single();

    if (!existingProfile) {
      // Create new profile
      const businessName = userProfile?.full_name || userProfile?.email?.split("@")[0] || "Seller";

      const { error: createError } = await supabaseAdmin
        .from("seller_profiles")
        .insert({
          id: sellerId,
          business_name: businessName,
          business_address_line1: "To be completed",
          business_city: "To be completed",
          business_state: "To be completed",
          business_pincode: "000000",
          business_phone: userProfile?.phone || "N/A",
          verification_status: newStatus,
          verification_notes: notes || (newStatus === "verified" 
            ? "Verified before completing onboarding" 
            : "Rejected before completing onboarding"),
          verified_at: newStatus === "verified" ? new Date().toISOString() : null,
          is_active: newStatus === "verified",
        });

      if (createError) {
        console.error("Error creating seller profile:", createError);
        return NextResponse.json(
          { 
            error: createError.message,
            code: createError.code,
            details: createError.details,
            hint: createError.hint
          },
          { status: 500 }
        );
      }
    } else {
      // Update existing profile
      const updateData: any = {
        verification_status: newStatus,
        verified_at: newStatus === "verified" ? new Date().toISOString() : null,
      };

      if (notes) {
        updateData.verification_notes = notes;
      }

      const { error: updateError } = await supabaseAdmin
        .from("seller_profiles")
        .update(updateData)
        .eq("id", sellerId);

      if (updateError) {
        console.error("Error updating seller profile:", updateError);
        return NextResponse.json(
          { 
            error: updateError.message,
            code: updateError.code,
            details: updateError.details,
            hint: updateError.hint
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
