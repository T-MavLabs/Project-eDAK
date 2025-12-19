import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * API route to fetch order data by tracking_id
 * Returns order details from the orders table
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tracking_id: string }> }
) {
  try {
    const { tracking_id } = await params;
    
    if (!tracking_id) {
      return NextResponse.json(
        { error: "tracking_id is required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLL_KEY;

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "Server configuration error: NEXT_PUBLIC_SUPABASE_URL not set" },
        { status: 500 }
      );
    }

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY not set" },
        { status: 500 }
      );
    }

    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });

    // Fetch order by tracking_id
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("tracking_id", tracking_id)
      .maybeSingle();

    if (orderError) {
      console.error("Error fetching order:", orderError);
      return NextResponse.json(
        { error: "Failed to fetch order" },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Try to get origin digipin from seller location or use default
    // For now, we'll use a default origin or derive from seller
    let originDigipin = "DL-110001-3F2A"; // Default to Delhi (can be enhanced later)
    
    // If order has seller info, try to get seller location
    if (order.buyer_id) {
      // Could fetch seller location from seller_profiles or addresses
      // For now, using default
    }

    return NextResponse.json({
      order: {
        ...order,
        origin_digipin: originDigipin, // Add origin for tracking display
      },
    });
  } catch (err) {
    console.error("Unexpected error in orders GET route:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: `Unexpected error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
