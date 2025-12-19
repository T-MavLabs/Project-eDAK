import { Bot, FileText, Tag } from "lucide-react";
import type { Complaint } from "@/lib/mockData";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function severityVariant(
  sev: Complaint["aiSeverity"],
): "secondary" | "default" | "destructive" {
  if (sev === "High") return "destructive";
  if (sev === "Medium") return "default";
  return "secondary";
}

export function ComplaintCard({ complaint }: { complaint: Complaint }) {
  return (
    <Card className="daksh-glass daksh-elevated daksh-transition">
      <CardHeader className="space-y-2">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary daksh-transition" />
            {complaint.summary}
          </span>
          <Badge variant="secondary" className="daksh-transition">{complaint.status}</Badge>
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="daksh-code">ID: {complaint.id}</span>
          <span>•</span>
          <span className="daksh-code">Tracking: {complaint.trackingId}</span>
          <span>•</span>
          <span className="daksh-code">{complaint.submittedAt}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{complaint.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={severityVariant(complaint.aiSeverity)} className="daksh-transition">
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> {complaint.aiCategory}
            </span>
          </Badge>
          <Badge variant={severityVariant(complaint.aiSeverity)} className="daksh-transition">
            <span className="inline-flex items-center gap-1">
              <Bot className="h-3.5 w-3.5" /> {complaint.aiSeverity}
            </span>
          </Badge>
        </div>

        <div className="rounded-md border daksh-glass bg-muted/40 p-3 daksh-elevated daksh-transition">
          <div className="text-sm font-semibold">Auto-response preview</div>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {complaint.aiResponsePreview}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
