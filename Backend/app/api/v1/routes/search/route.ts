import { NextResponse } from "next/server";

/**
 * GET /api/v1/routes/search?origin=Delhi&destination=Bengaluru&mode=Air&nature=Dox
 * Returns route reliability data based on search filters
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get("origin")?.toLowerCase().trim() || "";
    const destination = searchParams.get("destination")?.toLowerCase().trim() || "";
    const mode = searchParams.get("mode") || "";
    const nature = searchParams.get("nature") || "";

    // TODO: Replace with actual database queries
    // This should query route statistics from delivery_analytics or a routes table
    
    const allRoutes = [
      {
        route: "DEL-BLR",
        origin: "Delhi",
        destination: "Bengaluru",
        avgTransitDays: 2.1,
        reliabilityStdDev: 0.8,
        mode: "Air" as const,
        nature: "Dox" as const,
      },
      {
        route: "MUM-DEL",
        origin: "Mumbai",
        destination: "Delhi",
        avgTransitDays: 3.5,
        reliabilityStdDev: 1.2,
        mode: "Surface" as const,
        nature: "Non-Dox" as const,
      },
      {
        route: "CCU-GHY",
        origin: "Kolkata",
        destination: "Guwahati",
        avgTransitDays: 2.8,
        reliabilityStdDev: 1.6,
        mode: "Surface" as const,
        nature: "Dox" as const,
      },
      {
        route: "BLR-MAA",
        origin: "Bengaluru",
        destination: "Chennai",
        avgTransitDays: 1.5,
        reliabilityStdDev: 0.5,
        mode: "Express" as const,
        nature: "Dox" as const,
      },
      {
        route: "DEL-CCU",
        origin: "Delhi",
        destination: "Kolkata",
        avgTransitDays: 4.2,
        reliabilityStdDev: 1.8,
        mode: "Surface" as const,
        nature: "Non-Dox" as const,
      },
      {
        route: "NAG-VJA",
        origin: "Nagpur",
        destination: "Vijayawada",
        avgTransitDays: 3.2,
        reliabilityStdDev: 1.4,
        mode: "Surface" as const,
        nature: "Dox" as const,
      },
      {
        route: "HYD-PUN",
        origin: "Hyderabad",
        destination: "Pune",
        avgTransitDays: 2.5,
        reliabilityStdDev: 0.9,
        mode: "Express" as const,
        nature: "Dox" as const,
      },
      {
        route: "MUM-AHD",
        origin: "Mumbai",
        destination: "Ahmedabad",
        avgTransitDays: 2.8,
        reliabilityStdDev: 1.1,
        mode: "Surface" as const,
        nature: "Non-Dox" as const,
      },
      {
        route: "DEL-HYD",
        origin: "Delhi",
        destination: "Hyderabad",
        avgTransitDays: 3.0,
        reliabilityStdDev: 1.3,
        mode: "Air" as const,
        nature: "Dox" as const,
      },
      {
        route: "BLR-PUN",
        origin: "Bengaluru",
        destination: "Pune",
        avgTransitDays: 1.8,
        reliabilityStdDev: 0.7,
        mode: "Express" as const,
        nature: "Dox" as const,
      },
      {
        route: "CCU-VJA",
        origin: "Kolkata",
        destination: "Vijayawada",
        avgTransitDays: 4.5,
        reliabilityStdDev: 2.0,
        mode: "Surface" as const,
        nature: "Non-Dox" as const,
      },
      {
        route: "NAG-MUM",
        origin: "Nagpur",
        destination: "Mumbai",
        avgTransitDays: 2.3,
        reliabilityStdDev: 0.9,
        mode: "Surface" as const,
        nature: "Dox" as const,
      },
    ];

    // Filter routes based on search params
    // If no filters are provided, return all routes
    const hasFilters = origin || destination || mode || nature;
    
    if (!hasFilters) {
      return NextResponse.json(allRoutes);
    }

    // Apply filters
    const filtered = allRoutes.filter((route) => {
      if (origin && !route.origin.toLowerCase().includes(origin)) return false;
      if (destination && !route.destination.toLowerCase().includes(destination)) return false;
      if (mode && route.mode !== mode) return false;
      if (nature && route.nature !== nature) return false;
      return true;
    });
    
    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error searching routes:", error);
    return NextResponse.json(
      { error: "Failed to search routes" },
      { status: 500 }
    );
  }
}
