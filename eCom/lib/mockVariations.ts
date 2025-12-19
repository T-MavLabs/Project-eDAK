/**
 * Generate variations of mock parcel data based on tracking ID
 * Each tracking ID will show slightly different information
 */

import type { Parcel, ParcelTimelineEvent, DelayPrediction } from "@/lib/mockData";
import { getParcelByTrackingId } from "@/lib/mockData";

// City pairs for variations
const cityPairs = [
  { origin: "New Delhi", originDigipin: "DL-110001-3F2A", dest: "Bengaluru", destDigipin: "KA-560001-8B4D" },
  { origin: "Mumbai", originDigipin: "MH-400001-5C3B", dest: "Kolkata", destDigipin: "WB-700001-2C19" },
  { origin: "Chennai", originDigipin: "TN-600001-9D4E", dest: "New Delhi", destDigipin: "DL-110001-3F2A" },
  { origin: "Kolkata", originDigipin: "WB-700001-2C19", dest: "Mumbai", destDigipin: "MH-400001-5C3B" },
  { origin: "Hyderabad", originDigipin: "TS-500001-7A2B", dest: "Pune", destDigipin: "MH-411001-6D3C" },
  { origin: "Ahmedabad", originDigipin: "GJ-380001-4E5F", dest: "Jaipur", destDigipin: "RJ-302001-8B1A" },
  { origin: "Bengaluru", originDigipin: "KA-560001-8B4D", dest: "Chennai", destDigipin: "TN-600001-9D4E" },
  { origin: "Pune", originDigipin: "MH-411001-6D3C", dest: "Hyderabad", destDigipin: "TS-500001-7A2B" },
];

// Status variations
const statusVariations = [
  { label: "Hub Processing", hub: "Nagpur RMS Hub", hubCode: "NAG-RMS" },
  { label: "In Transit", hub: "Mumbai Sorting Hub", hubCode: "BOM-SRT" },
  { label: "At Hub", hub: "Delhi Airport Mail Office", hubCode: "DEL-AMO" },
  { label: "Processing", hub: "Kolkata GPO", hubCode: "CCU-GPO" },
  { label: "In Transit", hub: "Chennai Central Hub", hubCode: "MAA-CEN" },
];

// Alert variations
const alertVariations = [
  {
    severity: "High" as const,
    title: "Weather-related delay likely",
    message: "Your parcel may be delayed by ~7 hours due to heavy rainfall and route rebalancing.",
  },
  {
    severity: "Medium" as const,
    title: "Minor routing variance detected",
    message: "A small reroute was applied to avoid congestion. Delivery remains within SLA window.",
  },
  {
    severity: "Low" as const,
    title: "On track for delivery",
    message: "Your parcel is progressing normally. Expected delivery within the scheduled window.",
  },
  {
    severity: "Medium" as const,
    title: "Hub congestion detected",
    message: "Inbound load at processing hub is higher than usual. Transit time may vary slightly.",
  },
  {
    severity: "High" as const,
    title: "Potential delay due to weather",
    message: "Adverse weather conditions may cause delays. We're monitoring the situation closely.",
  },
];

/**
 * Generate a simple hash from tracking ID to get consistent variations
 */
function hashTrackingId(trackingId: string): number {
  let hash = 0;
  for (let i = 0; i < trackingId.length; i++) {
    const char = trackingId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a variation of mock parcel data based on tracking ID
 */
export function generateMockVariation(trackingId: string): Parcel | null {
  const baseParcel = getParcelByTrackingId("IPXK9A72IN");
  if (!baseParcel) return null;

  const hash = hashTrackingId(trackingId);
  const cityPair = cityPairs[hash % cityPairs.length];
  const status = statusVariations[hash % statusVariations.length];
  const alert = alertVariations[hash % alertVariations.length];

  // Generate delay hours (0-12 hours)
  const delayHours = hash % 13;
  const probabilityPercent = delayHours > 0 ? Math.min(95, 50 + delayHours * 3) : 25;

  // Generate dates (vary by tracking ID)
  const daysOffset = hash % 7; // 0-6 days ago
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - daysOffset);
  
  const bookedDate = new Date(baseDate);
  bookedDate.setHours(9 + (hash % 8), 12 + (hash % 48), 0, 0);
  
  const transitDate = new Date(bookedDate);
  transitDate.setHours(transitDate.getHours() + 2 + (hash % 4));
  
  const hubDate = new Date(transitDate);
  hubDate.setHours(hubDate.getHours() + 4 + (hash % 6));

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year} ${hours}:${minutes} IST`;
  };

  // Generate timeline
  const timeline: ParcelTimelineEvent[] = [
    {
      label: "Booked",
      timestamp: formatDate(bookedDate),
      location: `${cityPair.origin} GPO`,
      hubCode: cityPair.originDigipin.split("-")[0] + "-GPO",
      status: "completed",
      detail: "Accepted at counter • Speed Post",
    },
    {
      label: "In Transit",
      timestamp: formatDate(transitDate),
      location: `${cityPair.origin} Airport Mail Office`,
      hubCode: cityPair.originDigipin.split("-")[0] + "-AMO",
      status: "completed",
      detail: "Dispatch to central routing",
    },
    {
      label: "Hub",
      timestamp: formatDate(hubDate),
      location: status.hub,
      hubCode: status.hubCode,
      status: delayHours > 6 ? "current" : "completed",
      detail: delayHours > 6 ? "Processing at hub • Weather watch" : "Processing at hub",
    },
  ];

  // Add "Out for Delivery" if not delayed much
  if (delayHours <= 6) {
    timeline.push({
      label: "Out for Delivery",
      timestamp: "Expected",
      location: `${cityPair.dest} City PO`,
      hubCode: cityPair.destDigipin.split("-")[0] + "-CPO",
      status: "upcoming",
      detail: "Auto-scheduled based on hub clearance",
    });
  }

  // Generate risk factors
  const riskFactors = [];
  if (delayHours > 6) {
    riskFactors.push({
      label: "Weather" as const,
      severity: "High" as const,
      note: "Heavy rainfall advisory near transit corridor",
    });
  }
  if (delayHours > 3) {
    riskFactors.push({
      label: "Hub Congestion" as const,
      severity: "Medium" as const,
      note: "Above-normal inbound volume at processing hub",
    });
  }
  if (delayHours > 0 && delayHours <= 3) {
    riskFactors.push({
      label: "Festival Load" as const,
      severity: "Low" as const,
      note: "Seasonal spike handled via dynamic routing",
    });
  }

  const prediction: DelayPrediction = {
    estimatedDelayHours: delayHours,
    probabilityPercent,
    etaWindow: delayHours > 0 
      ? `Tomorrow ${14 + (hash % 6)}:00–${16 + (hash % 4)}:00 IST`
      : "Today 18:00–20:00 IST",
    riskFactors,
    modelNote: delayHours > 0
      ? `Prediction derived from hub scan cadence, historical dwell time, and weather signals. Estimated delay: ${delayHours} hours.`
      : "Prediction derived from hub scan cadence and historical RMS dwell time. On track for delivery.",
  };

  return {
    ...baseParcel,
    trackingId: trackingId.toUpperCase(),
    originCity: cityPair.origin,
    originDigipin: cityPair.originDigipin,
    destinationCity: cityPair.dest,
    destinationDigipin: cityPair.destDigipin,
    currentHub: status.hub,
    currentHubCode: status.hubCode,
    currentStatusLabel: status.label,
    bookedAt: formatDate(bookedDate),
    proactiveAlert: {
      ...alert,
      updatedAt: formatDate(new Date(hubDate.getTime() + 30 * 60 * 1000)), // 30 mins after hub
    },
    timeline,
    prediction,
  };
}
