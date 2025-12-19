import { BellRing } from "lucide-react";

import { mockNotifications } from "@/lib/mockData";
import { NotificationCard } from "@/components/NotificationCard";
import { AnimatedText } from "@/components/aceternity/AnimatedText";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { AnimatedCard } from "@/components/aceternity/AnimatedCard";

export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 relative overflow-hidden">
      {/* Spotlight background effect */}
      <Spotlight className="top-0 left-0 opacity-20" />
      
      {/* Official notifications register header */}
      <div className="daksh-sticky-header relative z-10">
        <AnimatedText type="fade" delay={0}>
          <div className="daksh-kicker mb-2">Public Communications</div>
        </AnimatedText>
        <AnimatedText type="slide" delay={100}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md daksh-gradient-primary daksh-layered aceternity-float">
              <BellRing className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="daksh-text-primary text-3xl aceternity-gradient-text">
              Proactive Notifications Register
            </h1>
          </div>
        </AnimatedText>
        <AnimatedText type="fade" delay={200}>
          <p className="daksh-text-secondary max-w-2xl">
            Alerts generated proactively based on predicted operational risk (mock dataset).
          </p>
        </AnimatedText>
      </div>

      <AnimatedCard className="daksh-layered-elevated daksh-gradient-card rounded-lg overflow-hidden aceternity-glow" delay={300}>
        <div className="daksh-layered border-b p-5 daksh-gradient-muted">
          <div className="daksh-text-label mb-1">Alerts Feed</div>
          <div className="daksh-text-secondary text-xs">Structured notification records</div>
        </div>
        <div className="p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {mockNotifications.map((n, idx) => (
              <div key={n.id} className="daksh-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                <NotificationCard notification={n} />
              </div>
            ))}
          </div>
        </div>
      </AnimatedCard>

      <AnimatedCard className="mt-6 daksh-text-meta daksh-layered rounded-lg p-4 daksh-gradient-muted" delay={400}>
        Note: In production, alerts can be delivered via SMS, email, WhatsApp, and India Post app notifications with explicit consent and audit trails.
      </AnimatedCard>
    </div>
  );
}
