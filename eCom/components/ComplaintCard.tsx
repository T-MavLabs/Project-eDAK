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
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {complaint.summary}
          </span>
          <Badge variant="secondary">{complaint.status}</Badge>
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>ID: {complaint.id}</span>
          <span>•</span>
          <span>Tracking: {complaint.trackingId}</span>
          <span>•</span>
          <span>{complaint.submittedAt}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{complaint.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={severityVariant(complaint.aiSeverity)}>
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> {complaint.aiCategory}
            </span>
          </Badge>
          <Badge variant={severityVariant(complaint.aiSeverity)}>
            <span className="inline-flex items-center gap-1">
              <Bot className="h-3.5 w-3.5" /> {complaint.aiSeverity}
            </span>
          </Badge>
        </div>

        <div className="rounded-md border bg-muted/40 p-3">
          <div className="text-sm font-semibold">Auto-response preview</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {complaint.aiResponsePreview}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
