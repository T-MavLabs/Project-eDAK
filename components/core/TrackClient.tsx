"use client";

import { useMemo, useState } from "react";
import { AlertCircle, MapPin, Package, Search } from "lucide-react";

import { getParcelByTrackingId, mockParcels } from "@/lib/mockData";
import { fetchParcelFromPublicApi } from "@/lib/publicApi";

import { ParcelTimeline } from "@/components/ParcelTimeline";
import { DelayPredictionCard } from "@/components/DelayPredictionCard";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "@/components/aceternity/AnimatedCard";
import { AnimatedText } from "@/components/aceternity/AnimatedText";
import { Spotlight } from "@/components/aceternity/Spotlight";

export function TrackClient({ initialTrackingId }: { initialTrackingId?: string }) {
  const defaultId = mockParcels[0]?.trackingId ?? "";
  const seeded = (initialTrackingId?.trim() || defaultId).toUpperCase();

  const [trackingId, setTrackingId] = useState(seeded);
  const [submitted, setSubmitted] = useState(seeded);

  const parcel = useMemo(() => {
    const base = getParcelByTrackingId(submitted);
    if (base) return base;
    // Public API integration: external clients provide tracking_id only.
    return fetchParcelFromPublicApi(submitted);
  }, [submitted]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 relative">
      {/* Spotlight background effect */}
      <Spotlight className="top-0 left-0 opacity-30" />
      
      {/* Intelligence console header */}
      <div className="daksh-sticky-header relative z-10">
        <AnimatedText type="fade" delay={0}>
          <div className="daksh-kicker mb-2">Citizen Tracking Interface</div>
        </AnimatedText>
        <AnimatedText type="slide" delay={100}>
          <h1 className="daksh-text-primary text-3xl mb-2 aceternity-gradient-text">
            Parcel Intelligence Console
          </h1>
        </AnimatedText>
        <AnimatedText type="fade" delay={200}>
          <p className="daksh-text-secondary max-w-2xl">
            Enter a tracking ID to view timeline, DIGIPIN locations, and predictive delay analysis.
          </p>
        </AnimatedText>
      </div>

      {/* Tracking lookup with layered styling */}
      <AnimatedCard className="daksh-layered-deep daksh-glass rounded-xl p-6 border border-border/60 relative overflow-hidden aceternity-glow" delay={300}>
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent pointer-events-none rounded-xl z-0" />
        <div className="mb-5 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary daksh-pulse" />
            <div className="daksh-text-label">Tracking Lookup</div>
          </div>
          <div className="daksh-text-secondary text-xs">Enter India Post tracking ID</div>
        </div>
        <form
          className="flex flex-col gap-3 sm:flex-row relative z-10"
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
                className="daksh-focus-ring daksh-interactive h-12 border-2 daksh-layered"
              />
            <div className="mt-2 daksh-text-meta">
              Demo IDs: <span className="daksh-code">IPXK9A72IN</span>,{" "}
              <span className="daksh-code">RPL7Q2D1IN</span>
                <span className="hidden sm:inline">
                  {" "}
                • External clients: <span className="daksh-code">/track?tracking_id=XXXX</span>
                </span>
              </div>
            </div>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 daksh-elevated daksh-focus-ring daksh-press h-12 px-8 daksh-gradient-primary"
          >
              <Search className="mr-2 h-4 w-4" />
              Track
            </Button>
          </form>
      </AnimatedCard>

      {!parcel ? (
        <AnimatedCard className="mt-6" delay={400}>
          <div className="daksh-advisory daksh-layered-elevated">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 aceternity-float" />
              <div className="flex-1">
                <div className="daksh-text-primary mb-1">Tracking ID not found</div>
                <div className="daksh-text-secondary">
                  This demo UI uses mock data only. Try one of the sample IDs shown above, or a valid tracking_id created by a client.
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Left panel: Main intelligence data */}
          <div className="space-y-6">
            {/* Proactive alert as advisory module */}
            <AnimatedCard 
              className={cn(
                "daksh-layered-elevated daksh-interactive daksh-hover-lift aceternity-glow",
                parcel.proactiveAlert.severity === "High" 
                  ? "daksh-advisory-warning" 
                  : parcel.proactiveAlert.severity === "Medium"
                    ? "daksh-advisory"
                    : "daksh-advisory-success"
              )}
              delay={400}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-md daksh-gradient-primary daksh-layered flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="daksh-kicker mb-1">Proactive System Alert</div>
                  <div className="daksh-text-primary mb-2">{parcel.proactiveAlert.title}</div>
                  <div className="daksh-text-secondary leading-relaxed">{parcel.proactiveAlert.message}</div>
                  </div>
                  <Badge
                    variant={
                      parcel.proactiveAlert.severity === "High"
                        ? "destructive"
                        : parcel.proactiveAlert.severity === "Medium"
                          ? "default"
                          : "secondary"
                    }
                  className="daksh-status-indicator flex-shrink-0"
                  >
                    {parcel.proactiveAlert.severity}
                  </Badge>
                </div>
              <div className="daksh-text-meta mt-3 pt-3 border-t border-border/50">
                Last updated: {parcel.proactiveAlert.updatedAt}
              </div>
            </AnimatedCard>

            {/* Parcel details with split panel feel */}
            <AnimatedCard className="daksh-layered-elevated daksh-gradient-card rounded-lg overflow-hidden aceternity-border-gradient" delay={500}>
              <div className="daksh-layered border-b p-5 daksh-gradient-muted">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md daksh-gradient-primary daksh-layered">
                      <Package className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="daksh-code text-sm mb-1">{parcel.trackingId}</div>
                      <div className="daksh-text-secondary">{parcel.articleType}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="daksh-status-indicator">
                    {parcel.currentStatusLabel}
                  </Badge>
                </div>
                
                {/* DIGIPIN locations as inline stat blocks */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="daksh-layered rounded-lg p-4 daksh-gradient-muted daksh-interactive daksh-hover-lift">
                    <div className="daksh-text-label mb-2">Origin (DIGIPIN)</div>
                    <div className="daksh-text-primary text-base mb-1">{parcel.originCity}</div>
                    <div className="daksh-code text-xs">{parcel.originDigipin}</div>
                  </div>
                  <div className="daksh-layered rounded-lg p-4 daksh-gradient-muted daksh-interactive daksh-hover-lift">
                    <div className="daksh-text-label mb-2">Destination (DIGIPIN)</div>
                    <div className="daksh-text-primary text-base mb-1">{parcel.destinationCity}</div>
                    <div className="daksh-code text-xs">{parcel.destinationDigipin}</div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {/* Current hub status */}
                <div className="daksh-layered rounded-lg p-4 mb-6 daksh-gradient-muted daksh-interactive">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-primary" />
                      <div>
                        <div className="daksh-text-label">Current Hub</div>
                        <div className="daksh-text-secondary mt-0.5">
                          <span className="font-semibold text-foreground">{parcel.currentHub}</span>
                          {" "}(<span className="daksh-code">{parcel.currentHubCode}</span>)
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="daksh-text-label">Booked</div>
                      <div className="daksh-text-meta mt-0.5 tabular-nums">{parcel.bookedAt}</div>
                    </div>
                  </div>
                </div>

                {/* Timeline with enhanced styling */}
                <div>
                  <div className="daksh-text-label mb-4">Scan Event Timeline</div>
                <ParcelTimeline events={parcel.timeline} />
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Intelligence insights */}
          <div className="space-y-6">
            <AnimatedCard delay={600}>
              <DelayPredictionCard prediction={parcel.prediction} />
            </AnimatedCard>

            <AnimatedCard className="daksh-layered-elevated daksh-gradient-card rounded-lg p-5" delay={700}>
              <div className="daksh-text-label mb-3">Operational Context</div>
              <div className="space-y-3 daksh-text-secondary text-sm leading-relaxed">
                <p>
                  Predictions are shown as an explainable summary (probability + factors) to support
                  citizen trust and operator triage.
                </p>
                <p>
                  DIGIPIN codes are displayed consistently to improve address intelligence and reduce
                  last-mile ambiguity.
                </p>
              </div>
            </AnimatedCard>
          </div>
        </div>
      )}
    </div>
  );
}
