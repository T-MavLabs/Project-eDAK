import { AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";
import type { DelayPrediction, DelayRiskFactor } from "@/lib/mockData";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="border-border daksh-glass daksh-elevated daksh-transition daksh-fade-in">
      {/* UX4G: System Advisory header (no gradients) */}
      <div className="border-b daksh-glass bg-muted/30 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="daksh-kicker">System Advisory Generated</div>
            <div className="mt-1 text-sm font-semibold text-foreground">
              Predicted Delivery Advisory
            </div>
            <div className="mt-1 text-xs text-muted-foreground leading-relaxed">
              System generated insight. Review the risk assessment below.
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className="daksh-stamp daksh-elevated daksh-transition"
              style={{
                borderColor: highRisk ? "var(--daksh-notice-red)" : "var(--daksh-rule)",
                color: highRisk ? "var(--daksh-notice-red)" : "var(--foreground)",
              }}
            >
              {highRisk ? "Severity: High" : "Severity: Moderate"}
            </span>
            <div className="text-[0.72rem] text-muted-foreground daksh-code">
              Ref: DAKSH-PRED-{prediction.probabilityPercent}
            </div>
          </div>
        </div>
      </div>

      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between gap-3 text-base">
          <span className="inline-flex items-center gap-2">
            <TrendingUp className="h-4 w-4 daksh-transition" aria-hidden="true" />
            Logistics Risk Assessment
          </span>
          <span className="daksh-code text-xs text-muted-foreground">
            Updated via model inference
          </span>
        </CardTitle>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-md border daksh-glass bg-background p-3 daksh-elevated daksh-transition">
            <div className="daksh-kicker">Estimated delay</div>
            <div className="mt-1 text-sm font-semibold daksh-code">
              {prediction.estimatedDelayHours}h
            </div>
          </div>
          <div className="rounded-md border daksh-glass bg-background p-3 daksh-elevated daksh-transition">
            <div className="daksh-kicker">Risk Confidence</div>
            <div
              className="mt-1 text-sm font-semibold daksh-code"
              style={{ color: highRisk ? "var(--daksh-notice-red)" : "inherit" }}
            >
              {prediction.probabilityPercent}%
            </div>
          </div>
          <div className="rounded-md border daksh-glass bg-background p-3 daksh-elevated daksh-transition">
            <div className="daksh-kicker">ETA window</div>
            <div className="mt-1 text-sm font-semibold daksh-code">
              {prediction.etaWindow}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-md border daksh-glass bg-muted/30 p-4 daksh-elevated daksh-transition">
          <div className="flex items-start gap-3">
            {highRisk ? (
              <AlertTriangle
                className="mt-0.5 h-4 w-4 daksh-transition"
                style={{ color: "var(--daksh-notice-amber)" }}
                aria-hidden="true"
              />
            ) : (
              <ShieldCheck
                className="mt-0.5 h-4 w-4 daksh-transition"
                style={{ color: "var(--daksh-notice-green)" }}
                aria-hidden="true"
              />
            )}
            <div>
              <div className="text-sm font-semibold text-foreground">
                Operational Risk Factors
              </div>
              <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {prediction.modelNote}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="daksh-kicker">Factor register</div>
          <div className="mt-2 grid gap-2">
            {prediction.riskFactors.map((rf, i) => (
              <div
                key={`${rf.label}-${rf.severity}`}
                className="grid gap-2 rounded-md border daksh-glass bg-background p-3 sm:grid-cols-[1fr_auto] daksh-elevated daksh-transition daksh-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="daksh-code text-xs text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="text-sm font-medium">{rf.label}</div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{rf.note}</div>
                </div>
                <div className="flex items-start justify-end">
                  <Badge variant={severityToBadgeVariant(rf.severity)} className="daksh-transition">{rf.severity}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
