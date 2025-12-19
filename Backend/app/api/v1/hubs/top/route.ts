import { NextResponse } from "next/server";

/**
 * GET /api/v1/hubs/top?limit=10
 * Returns top congested hubs
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // TODO: Replace with actual database queries
    // This should query from delivery_analytics table, order by congestion, limit results
    
    const hubs = [
      {
        hub: "Nagpur RMS Hub",
        hubCode: "NAG-RMS",
        congestionScore: 8.2,
        avgDelayHours: 6.2,
        delayedCount: 840,
        region: "Central",
      },
      {
        hub: "Mumbai FPO",
        hubCode: "BOM-FPO",
        congestionScore: 7.5,
        avgDelayHours: 4.8,
        delayedCount: 710,
        region: "West",
      },
      {
        hub: "Delhi AMO",
        hubCode: "DEL-AMO",
        congestionScore: 6.1,
        avgDelayHours: 3.1,
        delayedCount: 560,
        region: "North",
      },
      {
        hub: "Kolkata GPO",
        hubCode: "CCU-GPO",
        congestionScore: 5.8,
        avgDelayHours: 2.9,
        delayedCount: 390,
        region: "East",
      },
      {
        hub: "Chennai RMS",
        hubCode: "MAA-RMS",
        congestionScore: 5.3,
        avgDelayHours: 2.6,
        delayedCount: 320,
        region: "South",
      },
      {
        hub: "Bengaluru City PO",
        hubCode: "BLR-CPO",
        congestionScore: 4.9,
        avgDelayHours: 2.4,
        delayedCount: 430,
        region: "South",
      },
      {
        hub: "Ahmedabad RMS",
        hubCode: "AMD-RMS",
        congestionScore: 4.6,
        avgDelayHours: 2.8,
        delayedCount: 280,
        region: "West",
      },
      {
        hub: "Hyderabad RMS",
        hubCode: "HYD-RMS",
        congestionScore: 4.2,
        avgDelayHours: 2.3,
        delayedCount: 250,
        region: "South",
      },
      {
        hub: "Pune RMS",
        hubCode: "PNQ-RMS",
        congestionScore: 4.0,
        avgDelayHours: 2.1,
        delayedCount: 220,
        region: "West",
      },
      {
        hub: "Jaipur RMS",
        hubCode: "JAI-RMS",
        congestionScore: 3.8,
        avgDelayHours: 1.9,
        delayedCount: 180,
        region: "North",
      },
    ];

    return NextResponse.json(hubs.slice(0, limit));
  } catch (error) {
    console.error("Error fetching congested hubs:", error);
    return NextResponse.json(
      { error: "Failed to fetch congested hubs" },
      { status: 500 }
    );
  }
}
