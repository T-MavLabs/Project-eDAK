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
    <Card className="border-primary/15">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" />
          Predictive Delay (AI)
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={highRisk ? "destructive" : "secondary"}>
            {prediction.estimatedDelayHours}h estimated delay
          </Badge>
          <Badge variant={highRisk ? "destructive" : "default"}>
            {prediction.probabilityPercent}% probability
          </Badge>
          <Badge variant="secondary">ETA: {prediction.etaWindow}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            {highRisk ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 text-[#FF9933]" />
            ) : (
              <ShieldCheck className="mt-0.5 h-4 w-4 text-[#138808]" />
            )}
            <div>
              <div className="font-medium text-foreground">Model note</div>
              <div className="mt-1">{prediction.modelNote}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold">Risk factors</div>
          <div className="mt-2 grid gap-2">
            {prediction.riskFactors.map((rf) => (
              <div
                key={`${rf.label}-${rf.severity}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
              >
                <div>
                  <div className="text-sm font-medium">{rf.label}</div>
                  <div className="text-xs text-muted-foreground">{rf.note}</div>
                </div>
                <Badge variant={severityToBadgeVariant(rf.severity)}>{rf.severity}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
