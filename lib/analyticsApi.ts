/**
 * Analytics API utilities for DAKSH Admin Dashboard
 * 
 * These functions fetch analytics data from the DAKSH backend.
 * All functions will throw errors if API calls fail - no fallbacks or mock data.
 */

// Base URL - adjust based on your DAKSH deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_ANALYTICS_API_URL || '/api/v1';

export type SummaryMetrics = {
  avgNationalTransitDays: number;
  totalActiveRoutes: number;
  criticalHub: {
    name: string;
    code: string;
    congestionScore: number;
  };
  lowestReliabilityMode: {
    mode: 'Surface' | 'Air' | 'Express';
    reliabilityScore: number;
  };
};

export type CongestedHub = {
  hub: string;
  hubCode: string;
  congestionScore: number;
  avgDelayHours: number;
  delayedCount: number;
  region: string;
};

export type ModeComparison = {
  mode: 'Surface' | 'Air' | 'Express';
  efficiencyScore: number;
  avgTransitDays: number;
  totalShipments: number;
  delayRate: number; // percentage
};

export type RouteSearchParams = {
  origin?: string;
  destination?: string;
  mode?: 'Surface' | 'Air' | 'Express';
  nature?: 'Dox' | 'Non-Dox';
};

export type RouteResult = {
  route: string; // e.g., "DEL-BLR"
  origin: string;
  destination: string;
  avgTransitDays: number;
  reliabilityStdDev: number;
  mode: 'Surface' | 'Air' | 'Express';
  nature: 'Dox' | 'Non-Dox';
};

/**
 * Fetch national logistics summary metrics
 */
export async function fetchSummaryMetrics(): Promise<SummaryMetrics> {
  const response = await fetch(`${API_BASE_URL}/summary`);
  if (!response.ok) {
    throw new Error(`Failed to fetch summary metrics: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Fetch top congested hubs
 */
export async function fetchTopCongestedHubs(limit: number = 10): Promise<CongestedHub[]> {
  const response = await fetch(`${API_BASE_URL}/hubs/top?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch congested hubs: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Fetch delivery mode comparison data
 */
export async function fetchModeComparison(): Promise<ModeComparison[]> {
  const response = await fetch(`${API_BASE_URL}/mode-comparison`);
  if (!response.ok) {
    throw new Error(`Failed to fetch mode comparison: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Search routes by filters
 */
export async function searchRoutes(params: RouteSearchParams): Promise<RouteResult[]> {
  const queryParams = new URLSearchParams();
  if (params.origin) queryParams.set('origin', params.origin);
  if (params.destination) queryParams.set('destination', params.destination);
  if (params.mode) queryParams.set('mode', params.mode);
  if (params.nature) queryParams.set('nature', params.nature);
  
  const response = await fetch(`${API_BASE_URL}/routes/search?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to search routes: ${response.statusText}`);
  }
  return await response.json();
}
