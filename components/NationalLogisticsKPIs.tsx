"use client";

import { AlertTriangle, MapPin, Route, TrendingDown } from "lucide-react";
import type { SummaryMetrics } from "@/lib/analyticsApi";

interface KPICardProps {
  label: string;
  value: string;
  icon: typeof AlertTriangle;
  isRisk?: boolean;
}

function KPICard({ label, value, icon: Icon, isRisk = false }: KPICardProps) {
  return (
    <div
      className={`daksh-layered-deep daksh-gradient-card rounded-xl p-6 daksh-interactive daksh-hover-lift daksh-fade-in border border-border/60 relative overflow-hidden ${
        isRisk ? "border-l-3" : ""
      }`}
      style={{
        borderLeft: isRisk ? "3px solid #E74C3C" : undefined,
      }}
    >
      {isRisk && (
        <div
          className="absolute inset-0 bg-gradient-to-br opacity-30 pointer-events-none rounded-xl"
          style={{
            background: "linear-gradient(135deg, #E74C3C08 0%, transparent 100%)",
          }}
        />
      )}
      <div className="daksh-text-label mb-4 flex items-center justify-between relative z-10">
        <span>{label}</span>
        <div className="p-1.5 rounded-md daksh-layered bg-muted/40">
          <Icon className="h-3.5 w-3.5 text-muted-foreground/70" />
        </div>
      </div>
      <div
        className={`daksh-text-data relative z-10 ${
          isRisk ? "text-[#E74C3C]" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

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
      label: "Lowest Reliability Mode",
      value: `${metrics.lowestReliabilityMode.mode} (${(metrics.lowestReliabilityMode.reliabilityScore * 100).toFixed(0)}%)`,
      icon: TrendingDown,
      isRisk: metrics.lowestReliabilityMode.reliabilityScore < 0.75,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <div className="daksh-kicker mb-2">National Logistics Snapshot</div>
        <div className="daksh-text-secondary text-sm max-w-3xl">
          High-level operational metrics for national logistics intelligence. Values highlighted in
          red indicate risk thresholds crossed.
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <KPICard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            isRisk={kpi.isRisk}
          />
        ))}
      </div>
    </div>
  );
}
