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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        const errorMessage = err instanceof Error 
          ? err.message 
          : "Failed to load analytics data. Please ensure the analytics API endpoints are configured.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAdmin]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      {/* Operations control room header */}
      <div className="flex flex-col gap-2 daksh-fade-in">
        <div className="daksh-kicker">Operations Control Center</div>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <BarChart3 className="h-5 w-5 text-primary" />
          Operational Overview Dashboard
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          National logistics intelligence for hub operations, delay analysis, and service level 
          compliance monitoring. Structured data panels for operational decision-making.
        </p>
      </div>

      {!isAdmin ? (
        <Card className="mt-6 border-primary/15 daksh-glass daksh-elevated daksh-transition daksh-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LockKeyhole className="h-4 w-4 text-primary" />
              Admin access (demo)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border daksh-glass bg-muted/40 p-4 daksh-elevated daksh-transition">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-4 w-4 text-[#FF9933]" />
                <div>
                  <div className="text-sm font-semibold">Restricted view</div>
                  <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    This page is visible in the hackathon demo only when the role is set to Admin.
                    Use the toggle in the top navigation, or enable Admin demo mode below.
                  </div>
                </div>
              </div>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 daksh-elevated daksh-focus-ring"
              onClick={() => {
                setDemoRole("admin");
              }}
            >
              Enable Admin demo mode
            </Button>
          </CardContent>
        </Card>
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
            <Card className="mt-6 border-primary/15 daksh-glass daksh-elevated">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-[#FF9933]" />
                  Analytics API Not Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4 space-y-2">
                  <p>{error}</p>
                  <p className="text-xs">
                    The analytics API endpoints need to be configured. Expected endpoints:
                  </p>
                  <ul className="text-xs list-disc list-inside space-y-1 ml-2">
                    <li><code className="daksh-code">GET /api/v1/summary</code></li>
                    <li><code className="daksh-code">GET /api/v1/hubs/top?limit=10</code></li>
                    <li><code className="daksh-code">GET /api/v1/mode-comparison</code></li>
                    <li><code className="daksh-code">GET /api/v1/routes/search</code></li>
                  </ul>
                </div>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </CardContent>
            </Card>
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
                    <div className="daksh-rule" />
                    <div className="mt-4 flex flex-col gap-1 pb-4">
                      <div className="daksh-kicker">Hub Congestion Analysis</div>
                      <div className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                        Bottleneck identification across the logistics network. Higher congestion 
                        scores indicate critical capacity constraints requiring operational intervention.
                      </div>
                    </div>
                  </div>
                  <Card className="daksh-glass daksh-elevated daksh-transition daksh-fade-in">
                    <CongestedHubsChart data={congestedHubs} />
                  </Card>
                </div>
              )}

              {/* 3. Efficiency Overview - Delivery Mode Comparison */}
              {modeComparison.length > 0 && (
                <div className="mt-10 daksh-slide-up">
                  <div className="daksh-sticky-header mb-6">
                    <div className="daksh-rule" />
                    <div className="mt-4 flex flex-col gap-1 pb-4">
                      <div className="daksh-kicker">Delivery Mode Efficiency Analysis</div>
                      <div className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                        Comparative performance analysis across Surface, Air, and Express delivery
                        modes. Identifies optimization opportunities and reliability variance.
                      </div>
                    </div>
                  </div>
                  <Card className="daksh-glass daksh-elevated daksh-transition daksh-fade-in">
                    <ModeComparisonChart data={modeComparison} />
                  </Card>
                </div>
              )}

              {/* 4. Smart Lane Search - Route Reliability Explorer */}
              <div className="mt-10 daksh-slide-up">
                <div className="daksh-sticky-header mb-6">
                  <div className="daksh-rule" />
                  <div className="mt-4 flex flex-col gap-1 pb-4">
                      <div className="daksh-kicker">Route Reliability Analysis</div>
                      <div className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                        Route performance metrics and reliability assessment. High variance routes 
                        indicate operational risks requiring intervention and resource reallocation.
                      </div>
                  </div>
                </div>
                <Card className="daksh-glass daksh-elevated daksh-transition daksh-fade-in border-primary/15">
                  <RouteReliabilityExplorer />
                </Card>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
