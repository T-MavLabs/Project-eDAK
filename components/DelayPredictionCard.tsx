import { AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";
import type { DelayPrediction, DelayRiskFactor } from "@/lib/mockData";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

function severityToBadgeVariant(
  sev: DelayRiskFactor["severity"],
): "secondary" | "default" | "destructive" {
  if (sev === "High") return "destructive";
  if (sev === "Medium") return "default";
  return "secondary";
}

export function DelayPredictionCard({ prediction }: { prediction: DelayPrediction }) {
  const highRisk = prediction.probabilityPercent >= 70;

  return (
    <div className="daksh-intelligence-panel daksh-layered-deep daksh-slide-up border border-border/60 rounded-xl relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent pointer-events-none rounded-xl z-0" />
      
      <div className="relative z-10">
        {/* System insight header */}
        <div className="mb-5 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-md daksh-gradient-primary daksh-layered">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="daksh-kicker">System Intelligence</div>
            <div className="daksh-text-primary mt-0.5">Predictive Delay Analysis</div>
          </div>
        </div>
        
        {/* Inline stat blocks */}
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          <div className="daksh-layered rounded-lg p-3 daksh-gradient-muted daksh-interactive daksh-hover-lift relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="daksh-text-label mb-1.5">Delay</div>
              <div className={cn(
                "daksh-text-data",
                highRisk ? "text-primary" : "text-foreground"
              )}>
                {prediction.estimatedDelayHours}h
              </div>
            </div>
          </div>
          <div className="daksh-layered rounded-lg p-3 daksh-gradient-muted daksh-interactive daksh-hover-lift relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="daksh-text-label mb-1.5">Probability</div>
              <div className={cn(
                "daksh-text-data",
                highRisk ? "text-primary" : "text-foreground"
              )}>
                {prediction.probabilityPercent}%
              </div>
            </div>
          </div>
          <div className="daksh-layered rounded-lg p-3 daksh-gradient-muted daksh-interactive daksh-hover-lift relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="daksh-text-label mb-1.5">ETA Window</div>
              <div className="daksh-text-secondary text-xs font-semibold">
                {prediction.etaWindow}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model insight advisory */}
      <div className={cn(
        "mb-5 daksh-interactive daksh-hover-lift",
        highRisk ? "daksh-advisory-warning" : "daksh-advisory-success"
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-1.5 rounded-md daksh-layered flex-shrink-0",
            highRisk ? "bg-[#FF9933]/10" : "bg-[#138808]/10"
          )}>
            {highRisk ? (
              <AlertTriangle className="h-4 w-4 text-[#FF9933]" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-[#138808]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="daksh-text-label mb-1.5">Model Assessment</div>
            <div className="daksh-text-secondary leading-relaxed">{prediction.modelNote}</div>
            </div>
          </div>
        </div>

        {/* Risk factors with layered styling */}
        <div className="mt-6">
          <div className="daksh-text-label mb-4 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary/60" />
            Operational Risk Factors
          </div>
          <div className="space-y-2.5">
            {prediction.riskFactors.map((rf, idx) => (
              <div
                key={`${rf.label}-${rf.severity}`}
                className="daksh-layered rounded-lg p-3.5 daksh-interactive daksh-hover-lift daksh-fade-in relative overflow-hidden"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/40 to-primary/10 rounded-l-lg" />
                <div className="flex items-start justify-between gap-3 pl-2">
                  <div className="flex-1 min-w-0">
                    <div className="daksh-text-secondary font-semibold mb-1">{rf.label}</div>
                    <div className="daksh-text-meta leading-relaxed">{rf.note}</div>
                  </div>
                  <Badge 
                    variant={severityToBadgeVariant(rf.severity)}
                    className="daksh-status-indicator daksh-badge-enhanced flex-shrink-0"
                  >
                    {rf.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
