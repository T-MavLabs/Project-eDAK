import { Bot, FileText, Tag } from "lucide-react";
import type { Complaint } from "@/lib/mockData";

import { Badge } from "@/components/ui/badge";

function severityVariant(
  sev: Complaint["aiSeverity"],
): "secondary" | "default" | "destructive" {
  if (sev === "High") return "destructive";
  if (sev === "Medium") return "default";
  return "secondary";
}

export function ComplaintCard({ complaint }: { complaint: Complaint }) {
  return (
    <div className="daksh-layered-elevated daksh-gradient-card rounded-lg overflow-hidden daksh-interactive daksh-hover-lift">
      <div className="daksh-layered border-b p-5 daksh-gradient-muted">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="p-1.5 rounded-md daksh-gradient-primary daksh-layered flex-shrink-0">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="daksh-text-primary flex-1 min-w-0">{complaint.summary}</div>
          </div>
          <Badge variant="secondary" className="daksh-status-indicator flex-shrink-0">
            {complaint.status}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 daksh-text-meta">
          <span>ID: <span className="daksh-code">{complaint.id}</span></span>
          <span>•</span>
          <span>Tracking: <span className="daksh-code">{complaint.trackingId}</span></span>
          <span>•</span>
          <span className="tabular-nums">{complaint.submittedAt}</span>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <p className="daksh-text-secondary leading-relaxed">{complaint.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant={severityVariant(complaint.aiSeverity)}
            className="daksh-status-indicator"
          >
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> {complaint.aiCategory}
            </span>
          </Badge>
          <Badge 
            variant={severityVariant(complaint.aiSeverity)}
            className="daksh-status-indicator"
          >
            <span className="inline-flex items-center gap-1">
              <Bot className="h-3.5 w-3.5" /> {complaint.aiSeverity}
            </span>
          </Badge>
        </div>

        <div className="daksh-advisory daksh-layered rounded-lg p-4">
          <div className="daksh-text-label mb-2">Auto-response Preview</div>
          <p className="daksh-text-secondary leading-relaxed">
            {complaint.aiResponsePreview}
          </p>
        </div>
      </div>
    </div>
  );
}
