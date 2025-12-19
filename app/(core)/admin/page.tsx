"use client";

import { useEffect, useState } from "react";
import { BarChart3, LockKeyhole, ShieldAlert } from "lucide-react";

import { setDemoRole, useDemoRole } from "@/lib/useDemoRole";
import {
  fetchSummaryMetrics,
  fetchTopCongestedHubs,
  fetchModeComparison,
  type SummaryMetrics,
  type CongestedHub,
  type ModeComparison,
} from "@/lib/analyticsApi";

import { NationalLogisticsKPIs } from "@/components/NationalLogisticsKPIs";
import { CongestedHubsChart, ModeComparisonChart } from "@/components/Charts";
import { RouteReliabilityExplorer } from "@/components/RouteReliabilityExplorer";
import { DigipinIntelligence } from "@/components/DigipinIntelligence";

import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/aceternity/AnimatedCard";
import { AnimatedText } from "@/components/aceternity/AnimatedText";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { GridPattern } from "@/components/aceternity/GridPattern";

export default function AdminPage() {
  const role = useDemoRole();
  const isAdmin = role === "admin";

  // State for analytics data
  const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetrics | null>(null);
  const [congestedHubs, setCongestedHubs] = useState<CongestedHub[]>([]);
  const [modeComparison, setModeComparison] = useState<ModeComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    if (!isAdmin) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summary, hubs, modes] = await Promise.all([
          fetchSummaryMetrics(),
          fetchTopCongestedHubs(10),
          fetchModeComparison(),
        ]);
        setSummaryMetrics(summary);
        setCongestedHubs(hubs);
        setModeComparison(modes);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError("Failed to load analytics data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAdmin]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 relative overflow-hidden">
      {/* Background effects */}
      <Spotlight className="top-0 right-0 opacity-20" />
      <GridPattern className="opacity-30" />

      {/* Operations control room header */}
      <div className="daksh-sticky-header relative z-10">
        <AnimatedText type="fade" delay={0}>
          <div className="daksh-kicker mb-2">Operations Control Center</div>
        </AnimatedText>
        <AnimatedText type="slide" delay={100}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md daksh-gradient-primary daksh-layered aceternity-float">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="daksh-text-primary text-3xl aceternity-gradient-text">
              Admin Analytics Dashboard
            </h1>
          </div>
        </AnimatedText>
        <AnimatedText type="fade" delay={200}>
          <p className="daksh-text-secondary max-w-2xl">
            Operational overview for hubs, delays, and SLA compliance. Dense but readable
            intelligence for rapid triage.
          </p>
        </AnimatedText>
      </div>

      {!isAdmin ? (
        <div className="mt-6 daksh-layered-elevated daksh-advisory-warning rounded-lg p-6 daksh-slide-up">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-md daksh-gradient-primary daksh-layered flex-shrink-0">
              <LockKeyhole className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="daksh-text-primary mb-1">Admin access (demo)</div>
              <div className="daksh-text-secondary">
                This page is visible in the hackathon demo only when the role is set to Admin. Use
                the toggle in the top navigation, or enable Admin demo mode below.
              </div>
            </div>
          </div>
          <div className="daksh-layered rounded-lg p-4 daksh-gradient-muted mb-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-[#FF9933] flex-shrink-0" />
              <div>
                <div className="daksh-text-secondary font-semibold mb-1">Restricted view</div>
                <div className="daksh-text-meta">
                  Enable admin mode to access operational intelligence.
                </div>
              </div>
            </div>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 daksh-elevated daksh-focus-ring daksh-press"
            onClick={() => {
              setDemoRole("admin");
            }}
          >
            Enable Admin demo mode
          </Button>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-32 rounded-xl bg-muted/50 animate-pulse"
                  />
                ))}
              </div>
              <div className="h-96 rounded-xl bg-muted/50 animate-pulse" />
            </div>
          ) : error ? (
            <div className="mt-6 daksh-layered-elevated daksh-advisory-warning rounded-lg p-6">
              <div className="daksh-text-primary mb-2">Error loading analytics</div>
              <div className="daksh-text-secondary">{error}</div>
              <Button
                className="mt-4 bg-primary hover:bg-primary/90"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          ) : (
            <>
              {/* 1. Top KPI Header - National Logistics Snapshot */}
              {summaryMetrics && (
                <div className="mt-6 daksh-slide-up">
                  <NationalLogisticsKPIs metrics={summaryMetrics} />
                </div>
              )}

              {/* 2. Bottleneck Analysis - Top Congested Hubs */}
              {congestedHubs.length > 0 && (
                <div className="mt-10 daksh-slide-up">
                  <div className="daksh-sticky-header mb-6">
                    <div className="daksh-section-divider" />
                    <div className="mt-6 mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-2 w-2 rounded-full bg-primary daksh-pulse" />
                        <div className="daksh-kicker">Top Congested Hubs</div>
                      </div>
                      <div className="daksh-text-secondary max-w-3xl">
                        Hub congestion analysis identifying bottlenecks in the logistics network.
                        Higher scores indicate critical capacity constraints.
                      </div>
                    </div>
                  </div>
                  <AnimatedCard
                    className="daksh-layered-deep daksh-gradient-card rounded-xl overflow-hidden border border-border/60 aceternity-glow"
                    delay={400}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-transparent pointer-events-none rounded-xl z-0" />
                    <div className="relative z-10">
                      <CongestedHubsChart data={congestedHubs} />
                    </div>
                  </AnimatedCard>
                </div>
              )}

              {/* 3. Efficiency Overview - Delivery Mode Comparison */}
              {modeComparison.length > 0 && (
                <div className="mt-10 daksh-slide-up">
                  <div className="daksh-sticky-header mb-6">
                    <div className="daksh-section-divider" />
                    <div className="mt-6 mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-2 w-2 rounded-full bg-primary daksh-pulse" />
                        <div className="daksh-kicker">Delivery Mode Comparison</div>
                      </div>
                      <div className="daksh-text-secondary max-w-3xl">
                        Comparative efficiency analysis across Surface, Air, and Express delivery
                        modes to identify optimization opportunities.
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <AnimatedCard
                      className="daksh-layered-deep daksh-gradient-card rounded-xl overflow-hidden border border-border/60 aceternity-glow"
                      delay={500}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-transparent pointer-events-none rounded-xl z-0" />
                      <div className="relative z-10">
                        <ModeComparisonChart data={modeComparison} />
                      </div>
                    </AnimatedCard>
                    <AnimatedCard
                      className="daksh-layered-deep daksh-gradient-card rounded-xl overflow-hidden border border-border/60 aceternity-glow"
                      delay={600}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-transparent pointer-events-none rounded-xl z-0" />
                      <div className="relative z-10 p-6">
                        <DigipinIntelligence />
                      </div>
                    </AnimatedCard>
                  </div>
                </div>
              )}

              {/* 4. Smart Lane Search - Route Reliability Explorer */}
              <div className="mt-10 daksh-slide-up">
                <div className="daksh-sticky-header mb-6">
                  <div className="daksh-section-divider" />
                  <div className="mt-6 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-2 w-2 rounded-full bg-primary daksh-pulse" />
                      <div className="daksh-kicker">Route Reliability Explorer</div>
                    </div>
                    <div className="daksh-text-secondary max-w-3xl">
                      Search and analyze route performance metrics. High variance routes indicate
                      reliability risks requiring operational attention.
                    </div>
                  </div>
                </div>
                <AnimatedCard
                  className="daksh-layered-deep daksh-gradient-card rounded-xl overflow-hidden border border-border/60 aceternity-border-gradient"
                  delay={700}
                >
                  <RouteReliabilityExplorer />
                </AnimatedCard>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
