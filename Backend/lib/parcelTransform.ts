/**
 * Transform database order data and prediction API response into Parcel type
 */

import type { Parcel, ParcelTimelineEvent, DelayPrediction, DelayRiskFactor } from "@/lib/mockData";
import type { PredictionApiResponse } from "@/lib/predictionApi";

type DbOrder = {
  id: string;
  tracking_id: string | null;
  digipin: string; // destination digipin
  origin_digipin?: string; // added in API route
  status: "placed" | "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled" | "returned";
  created_at: string;
  confirmed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  user_email: string;
};

/**
 * Extract city name from DIGIPIN (e.g., "DL-110001-3F2A" -> "Delhi")
 * This is a simplified mapping - in production, you'd have a proper DIGIPIN lookup
 */
function getCityFromDigipin(digipin: string): string {
  const prefix = digipin.split("-")[0];
  const cityMap: Record<string, string> = {
    DL: "New Delhi",
    KA: "Bengaluru",
    MH: "Mumbai",
    WB: "Kolkata",
    TN: "Chennai",
    GJ: "Ahmedabad",
    UP: "Lucknow",
    RJ: "Jaipur",
    AS: "Guwahati",
    MP: "Bhopal",
    PB: "Chandigarh",
    HR: "Gurgaon",
    TS: "Hyderabad",
    AP: "Vishakhapatnam",
    OR: "Bhubaneswar",
    BR: "Patna",
    JH: "Ranchi",
    CT: "Raipur",
    NAG: "Nagpur",
  };
  return cityMap[prefix] || prefix;
}

/**
 * Get status label from order status enum
 */
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    placed: "Placed",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
    // Legacy parcel statuses (for backward compatibility)
    created: "Created",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    at_hub: "At Hub",
    failed_delivery: "Failed Delivery",
  };
  return statusMap[status] || status;
}

/**
 * Format timestamp to IST format
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = istDate.getDate().toString().padStart(2, "0");
  const month = istDate.toLocaleString("en-US", { month: "short" });
  const year = istDate.getFullYear();
  const hours = istDate.getHours().toString().padStart(2, "0");
  const minutes = istDate.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year} ${hours}:${minutes} IST`;
}

/**
 * Transform order status and timestamps into ParcelTimelineEvent[]
 */
function transformOrderToEvents(order: DbOrder): ParcelTimelineEvent[] {
  const events: ParcelTimelineEvent[] = [];
  const originCity = getCityFromDigipin(order.origin_digipin || "DL-110001-3F2A");
  const destCity = getCityFromDigipin(order.digipin);

  // Booked event (always present)
  events.push({
    label: "Booked",
    timestamp: formatTimestamp(order.created_at),
    location: originCity,
    hubCode: "ORIGIN",
    status: "completed",
    detail: "Order placed",
  });

  // Confirmed event (if exists)
  if (order.confirmed_at) {
    events.push({
      label: "Confirmed",
      timestamp: formatTimestamp(order.confirmed_at),
      location: originCity,
      hubCode: "ORIGIN",
      status: "completed",
      detail: "Order confirmed",
    });
  }

  // Processing/Shipped event
  if (order.status === "processing" || order.status === "shipped" || order.shipped_at) {
    events.push({
      label: "In Transit",
      timestamp: order.shipped_at ? formatTimestamp(order.shipped_at) : formatTimestamp(order.created_at),
      location: originCity,
      hubCode: "ORIGIN",
      status: order.status === "shipped" ? "current" : "completed",
      detail: "Order shipped",
    });
  }

  // Out for delivery
  if (order.status === "out_for_delivery") {
    events.push({
      label: "Out for Delivery",
      timestamp: formatTimestamp(new Date().toISOString()),
      location: destCity,
      hubCode: "DEST",
      status: "current",
      detail: "Out for delivery",
    });
  }

  // Delivered
  if (order.status === "delivered" && order.delivered_at) {
    events.push({
      label: "Delivered",
      timestamp: formatTimestamp(order.delivered_at),
      location: destCity,
      hubCode: "DEST",
      status: "completed",
      detail: "Order delivered",
    });
  }

  // If no other events, add a default "In Transit" as current
  if (events.length === 1 && order.status !== "delivered") {
    events.push({
      label: "In Transit",
      timestamp: "Expected",
      location: destCity,
      hubCode: "DEST",
      status: "upcoming",
      detail: "Order in transit",
    });
  }

  return events;
}

/**
 * Transform prediction API response into DelayPrediction
 */
function transformPrediction(prediction: PredictionApiResponse["prediction"]): DelayPrediction {
  const riskFactors: DelayRiskFactor[] = prediction.risk_factors.factors.map((factor) => {
    // Map the API label to our DelayRiskFactor label type
    let label: DelayRiskFactor["label"] = "Weather";
    if (factor.label.includes("Weather") || factor.label.includes("Seasonal")) {
      label = "Weather";
    } else if (factor.label.includes("Hub") || factor.label.includes("Congestion")) {
      label = "Hub Congestion";
    } else if (factor.label.includes("Route") || factor.label.includes("Geographic")) {
      label = "Route Diversion";
    } else if (factor.label.includes("Festival") || factor.label.includes("Seasonal")) {
      label = "Festival Load";
    }

    return {
      label,
      severity: factor.severity,
      note: factor.note,
    };
  });

  // Calculate probability based on delay hours and risk factors
  let probabilityPercent = 25; // Base probability
  if (prediction.predicted_delay_hours > 0) {
    // Higher delay hours = higher probability
    probabilityPercent = Math.min(95, 25 + prediction.predicted_delay_hours * 5);
    
    // Adjust based on risk factor severity
    const hasHighRisk = riskFactors.some((rf) => rf.severity === "High");
    const hasMediumRisk = riskFactors.some((rf) => rf.severity === "Medium");
    
    if (hasHighRisk) {
      probabilityPercent = Math.min(95, probabilityPercent + 15);
    } else if (hasMediumRisk) {
      probabilityPercent = Math.min(90, probabilityPercent + 10);
    }
  }

  return {
    estimatedDelayHours: prediction.predicted_delay_hours,
    probabilityPercent: Math.round(probabilityPercent),
    etaWindow: prediction.risk_factors.eta_window,
    riskFactors,
    modelNote: prediction.risk_factors.model_note,
  };
}

/**
 * Transform database order data and prediction into Parcel type
 */
export function transformParcelData(
  dbOrder: DbOrder,
  prediction: PredictionApiResponse | null
): Parcel {
  const originDigipin = dbOrder.origin_digipin || "DL-110001-3F2A"; // Default to Delhi
  const originCity = getCityFromDigipin(originDigipin);
  const destinationCity = getCityFromDigipin(dbOrder.digipin);
  
  // Determine current hub based on status
  let currentHub = "Unknown Hub";
  let currentHubCode = "UNKNOWN";
  if (dbOrder.status === "delivered") {
    currentHub = `${destinationCity} Hub`;
    currentHubCode = "DEST";
  } else if (dbOrder.status === "out_for_delivery") {
    currentHub = `${destinationCity} Hub`;
    currentHubCode = "DEST";
  } else if (dbOrder.status === "shipped" || dbOrder.shipped_at) {
    currentHub = "In Transit";
    currentHubCode = "TRANSIT";
  } else {
    currentHub = `${originCity} Hub`;
    currentHubCode = "ORIGIN";
  }

  const timeline = transformOrderToEvents(dbOrder);

  // Determine proactive alert from prediction
  const proactiveAlert: {
    severity: "Low" | "Medium" | "High";
    title: string;
    message: string;
    updatedAt: string;
  } = prediction
    ? {
        severity: (prediction.prediction.predicted_delay_hours > 6 ? "High" : prediction.prediction.predicted_delay_hours > 3 ? "Medium" : "Low") as "Low" | "Medium" | "High",
        title: prediction.prediction.predicted_delay_hours > 0 
          ? `Potential delay of ${prediction.prediction.predicted_delay_hours} hours`
          : "On track for delivery",
        message: prediction.prediction.risk_factors.model_note,
        updatedAt: formatTimestamp(new Date().toISOString()),
      }
    : {
        severity: "Low" as const,
        title: "Tracking active",
        message: "Your order is being tracked. Updates will appear as the order moves through the system.",
        updatedAt: formatTimestamp(dbOrder.created_at),
      };

  const predictionData: DelayPrediction = prediction
    ? transformPrediction(prediction.prediction)
    : {
        estimatedDelayHours: 0,
        probabilityPercent: 25,
        etaWindow: "TBD",
        riskFactors: [],
        modelNote: "Prediction data not available. Tracking is active.",
      };

  if (!dbOrder.tracking_id) {
    throw new Error("Order does not have a tracking_id");
  }

  return {
    trackingId: dbOrder.tracking_id,
    articleType: "Speed Post", // Default - could be stored in DB
    bookedAt: formatTimestamp(dbOrder.created_at),
    originCity,
    originDigipin: originDigipin,
    destinationCity,
    destinationDigipin: dbOrder.digipin,
    currentHub,
    currentHubCode,
    currentStatusLabel: getStatusLabel(dbOrder.status),
    proactiveAlert,
    timeline,
    prediction: predictionData,
  };
}
