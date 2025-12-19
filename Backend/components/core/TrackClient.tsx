"use client";

import { useEffect, useState } from "react";
import { AlertCircle, MapPin, Package, Search, Receipt, Loader2 } from "lucide-react";

import { getParcelByTrackingId, mockParcels, type Parcel } from "@/lib/mockData";
import { fetchParcelFromPublicApi } from "@/lib/publicApi";
import { fetchPrediction } from "@/lib/predictionApi";
import { transformParcelData } from "@/lib/parcelTransform";
import { generateMockVariation } from "@/lib/mockVariations";
import { useDemoRole } from "@/lib/useDemoRole";

import { ParcelTimeline } from "@/components/ParcelTimeline";
import { DelayPredictionCard } from "@/components/DelayPredictionCard";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function TrackClient({ initialTrackingId }: { initialTrackingId?: string }) {
  const defaultId = mockParcels[0]?.trackingId ?? "";
  const seeded = (initialTrackingId?.trim() || defaultId).toUpperCase();

  const [trackingId, setTrackingId] = useState(seeded);
  const [submitted, setSubmitted] = useState(seeded);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const role = useDemoRole();
  const isAuthenticated = role === "admin"; // In production, check actual auth state

  useEffect(() => {
    if (!submitted || submitted.trim().length === 0) {
      setParcel(null);
      setError(null);
      return;
    }

    const fetchParcelData = async () => {
      setLoading(true);
      setError(null);

      try {
        const normalizedTrackingId = submitted.trim().toUpperCase();
        
        // Workaround: If tracking ID is not IPZKWXTYIN, show varied mock data
        if (normalizedTrackingId !== "IPZKWXTYIN") {
          const mockParcel = generateMockVariation(normalizedTrackingId);
          if (mockParcel) {
            setParcel(mockParcel);
            setLoading(false);
            return;
          }
        }

        // For IPZKWXTYIN, try to get from mock data first (for demo IDs)
        const mockParcel = getParcelByTrackingId(normalizedTrackingId);
        if (mockParcel) {
          setParcel(mockParcel);
          setLoading(false);
          return;
        }

        // Try public API (localStorage)
        const publicParcel = fetchParcelFromPublicApi(normalizedTrackingId);
        if (publicParcel) {
          setParcel(publicParcel);
          setLoading(false);
          return;
        }

        // Fetch from database (only for IPZKWXTYIN)
        const response = await fetch(`/api/parcels/${encodeURIComponent(normalizedTrackingId)}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Tracking ID not found in database. Please check the tracking ID and try again.");
            setParcel(null);
            setLoading(false);
            return;
          }
          throw new Error(`Failed to fetch parcel: ${response.statusText}`);
        }

        const data = await response.json();
        const { order: dbOrder } = data;

        // Fetch prediction from API
        const prediction = await fetchPrediction(normalizedTrackingId);

        // Transform database order data + prediction into Parcel type
        const transformedParcel = transformParcelData(dbOrder, prediction);
        setParcel(transformedParcel);
      } catch (err) {
        console.error("Error fetching parcel:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch parcel data");
        setParcel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchParcelData();
  }, [submitted]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Track Parcel</h1>
        <p className="text-sm text-muted-foreground">
          Enter a tracking ID to view timeline, DIGIPIN locations, and predictive delay.
        </p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Tracking lookup</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(trackingId);
            }}
          >
            <div className="flex-1">
              <Input
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g., IPXK9A72IN"
                aria-label="Tracking ID"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                Demo IDs: <span className="font-medium">IPXK9A72IN</span>,{" "}
                <span className="font-medium">RPL7Q2D1IN</span>
                <span className="hidden sm:inline">
                  {" "}
                  • External clients can open{" "}
                  <span className="font-medium">/track?tracking_id=XXXX</span>
                </span>
              </div>
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <Search className="mr-2 h-4 w-4" />
              Track
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="mt-6">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Fetching tracking information...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <div className="mt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : !parcel ? (
        <div className="mt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tracking ID not found</AlertTitle>
            <AlertDescription>
              This tracking ID was not found. Try one of the sample IDs shown above, or a valid tracking_id created by a client.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Alert className="border-primary/20 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">Proactive alert</AlertTitle>
              <AlertDescription className="mt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-foreground">{parcel.proactiveAlert.title}</div>
                    <div className="text-sm text-muted-foreground">{parcel.proactiveAlert.message}</div>
                  </div>
                  <Badge
                    variant={
                      parcel.proactiveAlert.severity === "High"
                        ? "destructive"
                        : parcel.proactiveAlert.severity === "Medium"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {parcel.proactiveAlert.severity}
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Last updated: {parcel.proactiveAlert.updatedAt}
                </div>
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="space-y-2">
                <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                  <span className="inline-flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    {parcel.trackingId} • {parcel.articleType}
                  </span>
                  <Badge variant="secondary">{parcel.currentStatusLabel}</Badge>
                </CardTitle>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="rounded-md border bg-muted/30 p-3">
                    <div className="text-xs">Origin (DIGIPIN)</div>
                    <div className="mt-1 font-medium text-foreground">{parcel.originCity}</div>
                    <div className="mt-1 font-mono text-xs">{parcel.originDigipin}</div>
                  </div>
                  <div className="rounded-md border bg-muted/30 p-3">
                    <div className="text-xs">Destination (DIGIPIN)</div>
                    <div className="mt-1 font-medium text-foreground">{parcel.destinationCity}</div>
                    <div className="mt-1 font-mono text-xs">{parcel.destinationDigipin}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-between gap-3 rounded-md border bg-background p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">Current hub:</span>
                    <span className="text-muted-foreground">
                      {parcel.currentHub} ({parcel.currentHubCode})
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Booked: {parcel.bookedAt}</div>
                </div>

                <ParcelTimeline events={parcel.timeline} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <DelayPredictionCard prediction={parcel.prediction} />

            {/* Order Receipt - Only shown when logged in (Backend-specific) */}
            {isAuthenticated && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Receipt className="h-4 w-4 text-primary" />
                    Order receipt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Order ID</div>
                      <div className="mt-1 font-mono font-medium">{parcel.trackingId.replace("IP", "ORD")}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Tracking ID</div>
                      <div className="mt-1 font-mono font-medium">{parcel.trackingId}</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground mb-2">Order details</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Article type:</span>
                        <span className="font-medium">{parcel.articleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Booked on:</span>
                        <span className="font-medium">{parcel.bookedAt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="secondary" className="text-xs">{parcel.currentStatusLabel}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Order receipt information is only visible to authenticated users.
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Operational notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Predictions are shown as an explainable summary (probability + factors) to support
                  citizen trust and operator triage.
                </p>
                <p>
                  DIGIPIN codes are displayed consistently to improve address intelligence and reduce
                  last-mile ambiguity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
