import { BellRing } from "lucide-react";

import { mockNotifications } from "@/lib/mockData";
import { NotificationCard } from "@/components/NotificationCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2 daksh-fade-in">
        <div className="daksh-kicker">System Advisories</div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <BellRing className="h-5 w-5 text-primary" />
          Proactive Notification System
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          System advisories generated proactively based on predicted operational risk factors 
          including delay probabilities, hub congestion, and route anomalies.
        </p>
      </div>

      <Card className="mt-6 border-primary/10 daksh-glass daksh-elevated daksh-transition daksh-slide-up">
        <CardHeader>
          <CardTitle className="text-base">Active System Advisories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-2">
            {mockNotifications.map((n, idx) => (
              <div key={n.id} className="daksh-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                <NotificationCard notification={n} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-xs text-muted-foreground leading-relaxed">
        Note: In production, alerts can be delivered via SMS, email, WhatsApp, and India Post app notifications with explicit consent and audit trails.
      </div>
    </div>
  );
}
