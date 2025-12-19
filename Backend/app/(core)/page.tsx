import Link from "next/link";
import {
  BellRing,
  Bot,
  FileCheck2,
  MapPinned,
  Shield,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <div className="space-y-6 daksh-fade-in">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="daksh-transition">India Post aligned</Badge>
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 daksh-transition">
              API-first platform
            </Badge>
            <Badge variant="secondary" className="daksh-transition">Integration-ready</Badge>
          </div>

          <div className="space-y-3">
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              DAKSH
            </h1>
            <p className="text-pretty text-lg text-muted-foreground leading-relaxed">
              Delivery Analytics & Knowledge System for Shipment — smart parcel intelligence for India Post.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 daksh-elevated daksh-focus-ring">
              <Link href="/track">Track Parcel</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="daksh-elevated daksh-focus-ring">
              <Link href="/admin">View Admin Analytics</Link>
            </Button>
          </div>

          <div className="rounded-md border daksh-glass p-4 daksh-elevated daksh-transition">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary daksh-transition">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">
                  Trust-first UX for citizen services
                </div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Clear status timelines, transparent delay probabilities, and audit-friendly
                  alerts — designed for high-stakes public communications.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 daksh-slide-up">
          <Card className="border-primary/15 daksh-glass daksh-elevated">
            <CardHeader className="space-y-2">
              <CardTitle className="text-base">
                What DAKSH provides
              </CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                DAKSH is an API-first Smart Parcel Tracking & Predictive Delivery Platform built for India Post, enabling proactive logistics, analytics, and MSME integration.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Predictive Delivery Delays",
                    icon: TrendingUp,
                    desc: "Probability + risk factors (weather, hub congestion).",
                  },
                  {
                    title: "DIGIPIN-based Location Intelligence",
                    icon: MapPinned,
                    desc: "Origin/destination codes presented consistently.",
                  },
                  {
                    title: "Proactive Notifications",
                    icon: BellRing,
                    desc: "Severity badges and clear, actionable messaging.",
                  },
                  {
                    title: "AI Complaint Resolution",
                    icon: Bot,
                    desc: "Auto-categorization, severity tags, and response preview.",
                  },
                ].map((f, idx) => {
                  const Icon = f.icon;
                  return (
                    <div 
                      key={f.title} 
                      className="rounded-md border daksh-glass p-4 daksh-elevated daksh-transition daksh-fade-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary daksh-transition">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{f.title}</div>
                          <div className="mt-1 text-sm text-muted-foreground leading-relaxed">{f.desc}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-md border daksh-glass bg-accent/40 p-4 daksh-elevated daksh-transition">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-background text-primary daksh-transition">
                    <FileCheck2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Secure audit trails (UI-ready)</div>
                    <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Layout and information hierarchy prepared for future signing, event logs,
                      and role-based access — backend integration can be plugged in later.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-10 rounded-lg border daksh-glass p-6 daksh-elevated daksh-transition">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">Quick start</div>
            <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Start with tracking ID <span className="daksh-code font-medium">IPXK9A72IN</span> to
              see a realistic delay prediction and proactive alert flow.
            </div>
          </div>
          <Button asChild variant="secondary" className="daksh-elevated daksh-focus-ring">
            <Link href="/track">Open Tracking</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
