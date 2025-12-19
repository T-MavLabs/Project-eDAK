// Backend/supabase/functions/digipin/index.ts
// Reusable DIGIPIN client for Supabase Edge Functions.

const BASE_URL = "https://my-digipin.onrender.com";

export type DigipinEncodeResponse = { digipin: string };
export type DigipinDecodeResponse = { latitude: number; longitude: number };

export async function digipinEncode(latitude: number, longitude: number): Promise<string> {
  const res = await fetch(`${BASE_URL}/digipin/encode`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ latitude, longitude }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("DIGIPIN encode failed", { status: res.status, text });
    throw Object.assign(new Error("DIGIPIN encode failed"), { status: 502 });
  }

  const json = (await res.json()) as DigipinEncodeResponse;
  if (!json?.digipin || typeof json.digipin !== "string") {
    console.error("DIGIPIN encode invalid response", { json });
    throw Object.assign(new Error("DIGIPIN encode invalid response"), { status: 502 });
  }

  return json.digipin;
}

export async function digipinDecode(digipin: string): Promise<DigipinDecodeResponse> {
  const res = await fetch(`${BASE_URL}/digipin/decode`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ digipin }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("DIGIPIN decode failed", { status: res.status, text });
    throw Object.assign(new Error("DIGIPIN decode failed"), { status: 502 });
  }

  const json = (await res.json()) as DigipinDecodeResponse;
  if (
    !json ||
    typeof json.latitude !== "number" ||
    typeof json.longitude !== "number"
  ) {
    console.error("DIGIPIN decode invalid response", { json });
    throw Object.assign(new Error("DIGIPIN decode invalid response"), { status: 502 });
  }

  return json;
}
