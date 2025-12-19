/**
 * API client for the delay prediction system
 * Endpoint: https://chinmay0805-delay-postal-prediction-system.hf.space/api/v1/predictions/generate
 */

const PREDICTION_API_URL = "https://chinmay0805-delay-postal-prediction-system.hf.space/api/v1/predictions/generate";

export type PredictionApiResponse = {
  success: boolean;
  meta: {
    data_source: string;
    api_version: string;
  };
  parcel_context: {
    origin: string;
    destination: string;
    distance_km: number;
    weather_zone: string;
    route_complexity: string;
  };
  prediction: {
    tracking_id: string;
    expected_receive_date: string;
    predicted_delay_hours: number;
    risk_factors: {
      factors: Array<{
        label: string;
        severity: "Low" | "Medium" | "High";
        note: string;
        impact: string;
      }>;
      model_note: string;
      eta_window: string;
    };
  };
};

export async function fetchPrediction(trackingId: string): Promise<PredictionApiResponse | null> {
  try {
    const response = await fetch(PREDICTION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tracking_id: trackingId,
      }),
    });

    if (!response.ok) {
      console.error("Prediction API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data as PredictionApiResponse;
  } catch (error) {
    console.error("Error calling prediction API:", error);
    return null;
  }
}
