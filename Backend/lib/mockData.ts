export type TimelineStatus = "completed" | "current" | "upcoming";

export type ParcelTimelineEvent = {
  label: string;
  timestamp: string;
  location: string;
  hubCode: string;
  status: TimelineStatus;
  detail?: string;
};

export type DelayRiskFactor = {
  label: "Weather" | "Hub Congestion" | "Route Diversion" | "Festival Load";
  severity: "Low" | "Medium" | "High";
  note: string;
};

export type DelayPrediction = {
  estimatedDelayHours: number;
  probabilityPercent: number;
  etaWindow: string;
  riskFactors: DelayRiskFactor[];
  modelNote: string;
};

export type Parcel = {
  trackingId: string;
  articleType: "Speed Post" | "Registered Parcel" | "Business Parcel";
  bookedAt: string;
  originCity: string;
  originDigipin: string;
  destinationCity: string;
  destinationDigipin: string;
  currentHub: string;
  currentHubCode: string;
  currentStatusLabel: string;
  proactiveAlert: {
    severity: "Low" | "Medium" | "High";
    title: string;
    message: string;
    updatedAt: string;
  };
  timeline: ParcelTimelineEvent[];
  prediction: DelayPrediction;
};

export type ProactiveNotification = {
  id: string;
  severity: "Low" | "Medium" | "High";
  title: string;
  message: string;
  cityContext: string;
  createdAt: string;
  trackingId?: string;
};

export type Complaint = {
  id: string;
  trackingId: string;
  submittedAt: string;
  summary: string;
  description: string;
  aiCategory:
    | "Delay / SLA"
    | "Delivery Attempt"
    | "Address / Routing"
    | "Damage / Tamper"
    | "Refund / Charges"
    | "Other";
  aiSeverity: "Low" | "Medium" | "High";
  aiResponsePreview: string;
  status: "Open" | "In Review" | "Resolved";
};

export type HubDelayMetric = {
  hub: string;
  hubCode: string;
  avgDelayHours: number;
  delayedCount: number;
  region: "North" | "South" | "East" | "West" | "Central";
};

export type WeatherDelayMetric = {
  label: string;
  delayHours: number;
  probability: number;
};

export type RegionalHeatCell = {
  region: HubDelayMetric["region"];
  delayIndex: number; // 0–100 simplified
};

export type AdminDashboardMock = {
  dateLabel: string;
  totals: {
    parcelsToday: number;
    delayedParcels: number;
    avgDelayHours: number;
    slaCompliancePercent: number;
  };
  delayByHub: HubDelayMetric[];
  delayVsWeather: WeatherDelayMetric[];
  regionalDelayHeatmap: RegionalHeatCell[];
  bottleneckHubs: Array<HubDelayMetric & { note: string }>;
};

export const mockParcels: Parcel[] = [
  {
    trackingId: "IPXK9A72IN",
    articleType: "Speed Post",
    bookedAt: "2025-12-18 09:12 IST",
    originCity: "New Delhi",
    originDigipin: "DL-110001-3F2A",
    destinationCity: "Bengaluru",
    destinationDigipin: "KA-560001-8B4D",
    currentHub: "Nagpur RMS Hub",
    currentHubCode: "NAG-RMS",
    currentStatusLabel: "Hub Processing",
    proactiveAlert: {
      severity: "High",
      title: "Weather-related delay likely",
      message:
        "Your parcel may be delayed by ~7 hours due to heavy rainfall and route rebalancing near Nagpur.",
      updatedAt: "2025-12-18 15:40 IST",
    },
    timeline: [
      {
        label: "Booked",
        timestamp: "2025-12-18 09:12 IST",
        location: "New Delhi GPO",
        hubCode: "DEL-GPO",
        status: "completed",
        detail: "Accepted at counter • Speed Post",
      },
      {
        label: "In Transit",
        timestamp: "2025-12-18 11:05 IST",
        location: "Delhi Airport Mail Office",
        hubCode: "DEL-AMO",
        status: "completed",
        detail: "Dispatch to central routing",
      },
      {
        label: "Hub",
        timestamp: "2025-12-18 15:28 IST",
        location: "Nagpur RMS Hub",
        hubCode: "NAG-RMS",
        status: "current",
        detail: "Processing at hub • Weather watch",
      },
      {
        label: "Out for Delivery",
        timestamp: "Expected",
        location: "Bengaluru City PO",
        hubCode: "BLR-CPO",
        status: "upcoming",
        detail: "Auto-scheduled based on hub clearance",
      },
    ],
    prediction: {
      estimatedDelayHours: 7,
      probabilityPercent: 78,
      etaWindow: "Today 22:30–23:30 IST",
      riskFactors: [
        {
          label: "Weather",
          severity: "High",
          note: "Heavy rainfall advisory near Nagpur corridor",
        },
        {
          label: "Hub Congestion",
          severity: "Medium",
          note: "Above-normal inbound volume at NAG-RMS",
        },
        {
          label: "Festival Load",
          severity: "Low",
          note: "Seasonal spike handled via dynamic routing",
        },
      ],
      modelNote:
        "Prediction derived from hub scan cadence, historical RMS dwell time, and weather signals (mock).",
    },
  },
  {
    trackingId: "RPL7Q2D1IN",
    articleType: "Registered Parcel",
    bookedAt: "2025-12-17 17:20 IST",
    originCity: "Kolkata",
    originDigipin: "WB-700001-2C19",
    destinationCity: "Guwahati",
    destinationDigipin: "AS-781001-7D0E",
    currentHub: "Siliguri Transit Hub",
    currentHubCode: "SLG-TRN",
    currentStatusLabel: "In Transit",
    proactiveAlert: {
      severity: "Medium",
      title: "Minor routing variance detected",
      message:
        "A small reroute was applied to avoid congestion. Delivery remains within SLA window.",
      updatedAt: "2025-12-18 10:05 IST",
    },
    timeline: [
      {
        label: "Booked",
        timestamp: "2025-12-17 17:20 IST",
        location: "Kolkata GPO",
        hubCode: "CCU-GPO",
        status: "completed",
        detail: "Registered Parcel accepted",
      },
      {
        label: "In Transit",
        timestamp: "2025-12-17 21:10 IST",
        location: "Howrah Sorting Facility",
        hubCode: "HWH-SRT",
        status: "completed",
        detail: "Dispatch to NE corridor",
      },
      {
        label: "Hub",
        timestamp: "2025-12-18 06:55 IST",
        location: "Siliguri Transit Hub",
        hubCode: "SLG-TRN",
        status: "current",
        detail: "Connecting shipment to Guwahati",
      },
      {
        label: "Out for Delivery",
        timestamp: "Expected",
        location: "Guwahati Head PO",
        hubCode: "GHY-HPO",
        status: "upcoming",
      },
    ],
    prediction: {
      estimatedDelayHours: 2,
      probabilityPercent: 42,
      etaWindow: "Tomorrow 14:00–16:00 IST",
      riskFactors: [
        {
          label: "Hub Congestion",
          severity: "Medium",
          note: "Higher transfers at SLG-TRN",
        },
        {
          label: "Route Diversion",
          severity: "Low",
          note: "Alternative corridor used for load balancing",
        },
      ],
      modelNote:
        "Model confidence moderate due to sparse scan points (mock).",
    },
  },
];

export const mockNotifications: ProactiveNotification[] = [
  {
    id: "NTF-1007",
    severity: "High",
    title: "Potential delay due to heavy rainfall",
    message:
      "Your parcel may be delayed by 7 hours due to heavy rainfall near Nagpur and hub rebalancing.",
    cityContext: "Nagpur, Maharashtra",
    createdAt: "2025-12-18 15:40 IST",
    trackingId: "IPXK9A72IN",
  },
  {
    id: "NTF-1006",
    severity: "Medium",
    title: "Hub congestion detected",
    message:
      "Inbound load at Mumbai Foreign Post Office is higher than usual. Transit time may vary slightly.",
    cityContext: "Mumbai, Maharashtra",
    createdAt: "2025-12-18 12:05 IST",
  },
  {
    id: "NTF-1005",
    severity: "Low",
    title: "Delivery window confirmed",
    message:
      "Your parcel is on track. Next scan expected at destination hub within 6 hours.",
    cityContext: "Bengaluru, Karnataka",
    createdAt: "2025-12-18 09:10 IST",
    trackingId: "IPXK9A72IN",
  },
];

export const mockComplaints: Complaint[] = [
  {
    id: "CMP-24018",
    trackingId: "IPXK9A72IN",
    submittedAt: "2025-12-18 16:10 IST",
    summary: "Parcel delayed beyond expected window",
    description:
      "Tracking shows hub processing for several hours. Please confirm revised ETA and reason.",
    aiCategory: "Delay / SLA",
    aiSeverity: "High",
    aiResponsePreview:
      "We understand the urgency. Based on the latest hub scan and weather advisories, a delay of ~7 hours is likely. Your parcel is actively being prioritized and will move on the next feasible dispatch. You will receive an update after the next scan.",
    status: "In Review",
  },
  {
    id: "CMP-23994",
    trackingId: "RPL7Q2D1IN",
    submittedAt: "2025-12-18 08:20 IST",
    summary: "Change of delivery attempt requested",
    description:
      "Please attempt delivery after 5 PM as nobody is available before then.",
    aiCategory: "Delivery Attempt",
    aiSeverity: "Medium",
    aiResponsePreview:
      "Your request has been recorded. While delivery attempts follow the beat schedule, we will flag your request for the destination office. If a reschedule is possible, the updated attempt time will reflect in tracking.",
    status: "Open",
  },
];

export const mockAdminDashboard: AdminDashboardMock = {
  dateLabel: "18 Dec 2025",
  totals: {
    parcelsToday: 128420,
    delayedParcels: 9120,
    avgDelayHours: 3.4,
    slaCompliancePercent: 92.6,
  },
  delayByHub: [
    {
      hub: "Nagpur RMS Hub",
      hubCode: "NAG-RMS",
      avgDelayHours: 6.2,
      delayedCount: 840,
      region: "Central",
    },
    {
      hub: "Mumbai FPO",
      hubCode: "BOM-FPO",
      avgDelayHours: 4.8,
      delayedCount: 710,
      region: "West",
    },
    {
      hub: "Delhi AMO",
      hubCode: "DEL-AMO",
      avgDelayHours: 3.1,
      delayedCount: 560,
      region: "North",
    },
    {
      hub: "Bengaluru City PO",
      hubCode: "BLR-CPO",
      avgDelayHours: 2.4,
      delayedCount: 430,
      region: "South",
    },
    {
      hub: "Kolkata GPO",
      hubCode: "CCU-GPO",
      avgDelayHours: 2.9,
      delayedCount: 390,
      region: "East",
    },
  ],
  delayVsWeather: [
    { label: "Clear", delayHours: 1.6, probability: 18 },
    { label: "Cloudy", delayHours: 2.4, probability: 30 },
    { label: "Rain", delayHours: 3.8, probability: 52 },
    { label: "Heavy Rain", delayHours: 6.1, probability: 74 },
  ],
  regionalDelayHeatmap: [
    { region: "North", delayIndex: 38 },
    { region: "West", delayIndex: 52 },
    { region: "Central", delayIndex: 71 },
    { region: "East", delayIndex: 46 },
    { region: "South", delayIndex: 33 },
  ],
  bottleneckHubs: [
    {
      hub: "Nagpur RMS Hub",
      hubCode: "NAG-RMS",
      avgDelayHours: 6.2,
      delayedCount: 840,
      region: "Central",
      note: "Weather + inbound surge. Recommend temporary lane expansion.",
    },
    {
      hub: "Mumbai FPO",
      hubCode: "BOM-FPO",
      avgDelayHours: 4.8,
      delayedCount: 710,
      region: "West",
      note: "Customs line variability. Prioritize triage queue for time-sensitive articles.",
    },
    {
      hub: "Delhi AMO",
      hubCode: "DEL-AMO",
      avgDelayHours: 3.1,
      delayedCount: 560,
      region: "North",
      note: "Peak-hour saturation. Use staggered dispatch windows.",
    },
  ],
};

export function getParcelByTrackingId(trackingId: string): Parcel | undefined {
  const normalized = trackingId.trim().toUpperCase();
  return mockParcels.find((p) => p.trackingId === normalized);
}
