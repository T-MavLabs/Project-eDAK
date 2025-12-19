import { BellRing } from "lucide-react";
import type { ProactiveNotification } from "@/lib/mockData";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function severityVariant(
  sev: ProactiveNotification["severity"],
): "secondary" | "default" | "destructive" {
  if (sev === "High") return "destructive";
  if (sev === "Medium") return "default";
  return "secondary";
}

export function NotificationCard({ notification }: { notification: ProactiveNotification }) {
  return (
    <Card className="daksh-glass daksh-elevated daksh-transition">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between gap-3 text-base">
          <span className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-primary daksh-transition" />
            {notification.title}
          </span>
          <Badge variant={severityVariant(notification.severity)} className="daksh-transition">
            {notification.severity}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground leading-relaxed">{notification.message}</p>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{notification.cityContext}</span>
          <span className="daksh-code">{notification.createdAt}</span>
        </div>
        {notification.trackingId ? (
          <div className="text-xs text-muted-foreground">
            Tracking: <span className="daksh-code font-medium">{notification.trackingId}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
