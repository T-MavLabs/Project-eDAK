"use client";

import { AlertTriangle, MapPin, Route, TrendingDown } from "lucide-react";
import type { SummaryMetrics } from "@/lib/analyticsApi";
import { KpiCard } from "@/components/ux4g/KpiCard";

/**
 * National Logistics KPIs Component
 * Displays 4 KPI cards using UX4G-compliant KpiCard component
 */
export function NationalLogisticsKPIs({ metrics }: { metrics: SummaryMetrics }) {
  const kpis = [
    {
      label: "Avg National Transit (Days)",
      value: `${metrics.avgNationalTransitDays.toFixed(1)} days`,
      icon: Route,
      isRisk: metrics.avgNationalTransitDays > 3.0,
    },
    {
      label: "Total Active Routes",
      value: metrics.totalActiveRoutes.toLocaleString("en-IN"),
      icon: MapPin,
      isRisk: false,
    },
    {
      label: "Critical Hub (Most Congested)",
      value: `${metrics.criticalHub.name} (${metrics.criticalHub.code})`,
      icon: AlertTriangle,
      isRisk: metrics.criticalHub.congestionScore > 7.0,
    },
    {
      label: "Low Reliability Mode",
      value: `${metrics.lowestReliabilityMode.mode} (${(metrics.lowestReliabilityMode.reliabilityScore * 100).toFixed(0)}%)`,
      icon: TrendingDown,
      isRisk: metrics.lowestReliabilityMode.reliabilityScore < 0.75,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <div 
          className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-2"
          style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
        >
          National Logistics Snapshot
        </div>
        <p 
          className="text-sm text-neutral-600 max-w-3xl leading-relaxed"
          style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
        >
          High-level operational metrics for national logistics intelligence. Values highlighted in
          red indicate risk thresholds crossed.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            isRisk={kpi.isRisk}
            aria-label={`${kpi.label}: ${kpi.value}${kpi.isRisk ? " (High Risk)" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
