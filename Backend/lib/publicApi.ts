"use client";

import type { Parcel } from "@/lib/mockData";

const PUBLIC_PARCELS_KEY = "edak_public_parcels";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export type PublicParcelRecord = Parcel;

export function publishParcelToPublicApi(parcel: PublicParcelRecord) {
  if (typeof window === "undefined") return;
  const existing = safeParse<PublicParcelRecord[]>(
    window.localStorage.getItem(PUBLIC_PARCELS_KEY),
    [],
  );
  const normalized = parcel.trackingId.trim().toUpperCase();

  const next = [
    { ...parcel, trackingId: normalized },
    ...existing.filter((p) => p.trackingId !== normalized),
  ];

  window.localStorage.setItem(PUBLIC_PARCELS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("edak_public_parcels_change"));
}

export function fetchParcelFromPublicApi(trackingId: string): PublicParcelRecord | undefined {
  if (typeof window === "undefined") return undefined;
  const normalized = trackingId.trim().toUpperCase();
  const existing = safeParse<PublicParcelRecord[]>(
    window.localStorage.getItem(PUBLIC_PARCELS_KEY),
    [],
  );
  return existing.find((p) => p.trackingId === normalized);
}
