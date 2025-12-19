import { NextResponse } from "next/server";

/**
 * GET /api/v1/mode-comparison
 * Returns delivery mode comparison data
 */
export async function GET() {
  try {
    // TODO: Replace with actual database queries
    // This should aggregate from parcels/delivery_analytics by mode (surface/air/express)
    
    const modes = [
      {
        mode: "Surface" as const,
        efficiencyScore: 0.68,
        avgTransitDays: 4.2,
        totalShipments: 45000,
        delayRate: 18.5,
      },
      {
        mode: "Air" as const,
        efficiencyScore: 0.91,
        avgTransitDays: 1.8,
        totalShipments: 28000,
        delayRate: 8.2,
      },
      {
        mode: "Express" as const,
        efficiencyScore: 0.95,
        avgTransitDays: 1.2,
        totalShipments: 15000,
        delayRate: 4.8,
      },
    ];

    return NextResponse.json(modes);
  } catch (error) {
    console.error("Error fetching mode comparison:", error);
    return NextResponse.json(
      { error: "Failed to fetch mode comparison" },
      { status: 500 }
    );
  }
}
