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
import { AccessibilityBar } from "@/components/ux4g/AccessibilityBar";
import { Panel } from "@/components/ux4g/Panel";

import { Button } from "@/components/ui/button";

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
    <>
      {/* Accessibility widget */}
      <AccessibilityBar />

      {/* UX4G Container with max-width */}
      <main 
        className="mx-auto w-full max-w-[1536px] px-4 py-10"
        role="main"
        aria-label="Admin Analytics Dashboard"
      >
        {/* Page Header */}
        <header className="mb-8">
          <div 
            className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-2"
            style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
          >
            Operations Control Center
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-md bg-[#E74C3C]">
              <BarChart3 className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <h1 
              className="text-3xl font-semibold text-neutral-900 leading-tight"
              style={{ 
                fontFamily: "var(--ux4g-font-family-display, 'Noto Sans Display', sans-serif)",
                fontSize: "var(--ux4g-text-3xl, 1.875rem)"
              }}
            >
              Admin Analytics Dashboard
            </h1>
          </div>
          <p 
            className="text-sm text-neutral-600 max-w-2xl leading-relaxed"
            style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
          >
            Operational overview for hubs, delays, and SLA compliance. Dense but readable
            intelligence for rapid triage.
          </p>
        </header>

        {!isAdmin ? (
          <Panel
            title="Admin Access Required"
            description="This page is visible in the hackathon demo only when the role is set to Admin. Use the toggle in the top navigation, or enable Admin demo mode below."
            elevated
            className="border-l-4 border-l-[#FF9933]"
          >
            <div className="flex items-start gap-3 mb-4">
              <ShieldAlert className="h-5 w-5 text-[#FF9933] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="text-sm font-semibold text-neutral-900 mb-1">
                  Restricted view
                </div>
                <p className="text-sm text-neutral-600">
                  Enable admin mode to access operational intelligence.
                </p>
              </div>
            </div>
            <Button
              className="bg-[#E74C3C] hover:bg-[#C0392B] text-white"
              onClick={() => {
                setDemoRole("admin");
              }}
              aria-label="Enable Admin demo mode"
            >
              Enable Admin demo mode
            </Button>
          </Panel>
        ) : (
          <>
            {loading ? (
              <div className="space-y-6">
                {/* Skeleton loading states */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-32 rounded-lg bg-neutral-100 animate-pulse"
                      aria-label="Loading KPI card"
                    />
                  ))}
                </div>
                <div className="h-96 rounded-lg bg-neutral-100 animate-pulse" aria-label="Loading chart" />
              </div>
            ) : error ? (
              <Panel
                title="Error Loading Analytics"
                description={error}
                elevated
                className="border-l-4 border-l-[#DC2626]"
              >
                <Button
                  className="mt-4 bg-[#E74C3C] hover:bg-[#C0392B] text-white"
                  onClick={() => window.location.reload()}
                  aria-label="Refresh page to retry loading analytics"
                >
                  Refresh Page
                </Button>
              </Panel>
            ) : (
              <>
                {/* 1. Top KPI Header - National Logistics Snapshot */}
                {summaryMetrics && (
                  <section className="mb-10" aria-label="National Logistics KPIs">
                    <NationalLogisticsKPIs metrics={summaryMetrics} />
                  </section>
                )}

                {/* 2. Bottleneck Analysis - Top Congested Hubs */}
                {congestedHubs.length > 0 && (
                  <section className="mb-10" aria-label="Bottleneck Analysis">
                    <div className="mb-6">
                      <div 
                        className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-2"
                        style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
                      >
                        Top Congested Hubs
                      </div>
                      <p 
                        className="text-sm text-neutral-600 max-w-3xl leading-relaxed"
                        style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
                      >
                        Hub congestion analysis identifying bottlenecks in the logistics network.
                        Higher scores indicate critical capacity constraints.
                      </p>
                    </div>
                    <Panel elevated>
                      <CongestedHubsChart data={congestedHubs} />
                    </Panel>
                  </section>
                )}

                {/* 3. Efficiency Overview - Delivery Mode Comparison */}
                {modeComparison.length > 0 && (
                  <section className="mb-10" aria-label="Efficiency Overview">
                    <div className="mb-6">
                      <div 
                        className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-2"
                        style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
                      >
                        Delivery Mode Comparison
                      </div>
                      <p 
                        className="text-sm text-neutral-600 max-w-3xl leading-relaxed"
                        style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
                      >
                        Comparative efficiency analysis across Surface, Air, and Express delivery
                        modes to identify optimization opportunities.
                      </p>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                      <Panel elevated>
                        <ModeComparisonChart data={modeComparison} />
                      </Panel>
                      <DigipinIntelligence />
                    </div>
                  </section>
                )}

                {/* 4. Smart Lane Search - Route Reliability Explorer */}
                <section aria-label="Route Reliability Explorer">
                  <div className="mb-6">
                    <div 
                      className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-2"
                      style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
                    >
                      Route Reliability Explorer
                    </div>
                    <p 
                      className="text-sm text-neutral-600 max-w-3xl leading-relaxed"
                      style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
                    >
                      Search and analyze route performance metrics. High variance routes indicate
                      reliability risks requiring operational attention.
                    </p>
                  </div>
                  <RouteReliabilityExplorer />
                </section>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
