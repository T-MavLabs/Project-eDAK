import { BellRing } from "lucide-react";
import type { ProactiveNotification } from "@/lib/mockData";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

function severityVariant(
  sev: ProactiveNotification["severity"],
): "secondary" | "default" | "destructive" {
  if (sev === "High") return "destructive";
  if (sev === "Medium") return "default";
  return "secondary";
}

export function NotificationCard({ notification }: { notification: ProactiveNotification }) {
  return (
    <div 
      className="daksh-layered-elevated daksh-gradient-card rounded-lg overflow-hidden daksh-interactive daksh-hover-lift"
      style={{
        borderLeft: `3px solid ${
          notification.severity === "High" 
            ? "#FF9933" 
            : notification.severity === "Medium"
              ? "var(--primary)"
              : "#138808"
        }`
      }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="p-1.5 rounded-md daksh-gradient-primary daksh-layered flex-shrink-0">
              <BellRing className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="daksh-text-primary flex-1 min-w-0">{notification.title}</div>
          </div>
          <Badge 
            variant={severityVariant(notification.severity)}
            className="daksh-status-indicator flex-shrink-0"
          >
            {notification.severity}
          </Badge>
        </div>
        <div className="daksh-text-secondary mb-4 leading-relaxed">{notification.message}</div>
        <div className="flex flex-wrap items-center justify-between gap-2 daksh-text-meta mb-2">
          <span>{notification.cityContext}</span>
          <span className="tabular-nums">{notification.createdAt}</span>
        </div>
        {notification.trackingId ? (
          <div className="daksh-text-meta">
            Tracking: <span className="daksh-code">{notification.trackingId}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
