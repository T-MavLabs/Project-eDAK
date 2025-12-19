import { TrackClient } from "@/components/core/TrackClient";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ tracking_id?: string; trackingId?: string }>;
}) {
  const sp = await searchParams;
  const initial = sp.tracking_id ?? sp.trackingId;
  return <TrackClient initialTrackingId={initial} />;
}
