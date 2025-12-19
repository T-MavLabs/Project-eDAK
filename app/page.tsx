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
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Government-grade demo UI</Badge>
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
              India Post aligned
            </Badge>
            <Badge variant="secondary">Mock data only</Badge>
          </div>

          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Smart Parcel Tracking & Predictive Delivery System
          </h1>
          <p className="text-pretty text-lg text-muted-foreground">
            From tracking to prediction — proactive postal intelligence.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/track">Track Parcel</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admin">View Admin Analytics</Link>
            </Button>
          </div>

          <div className="rounded-md border bg-background p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">
                  Trust-first UX for citizen services
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Clear status timelines, transparent delay probabilities, and audit-friendly
                  alerts — designed for high-stakes public communications.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <Card className="border-primary/15">
            <CardHeader className="space-y-2">
              <CardTitle className="text-base">
                What this system demonstrates
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                A complete frontend flow for India Post: track, predict delays, notify proactively,
                and resolve complaints with AI-assisted triage.
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
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="rounded-md border bg-muted/30 p-4">
                      <div className="flex items-start gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{f.title}</div>
                          <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-md border bg-accent/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-background text-primary">
                    <FileCheck2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Secure audit trails (UI-ready)</div>
                    <div className="mt-1 text-sm text-muted-foreground">
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

      <div className="mt-10 rounded-lg border bg-background p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">Demo guidance</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Start with tracking ID <span className="font-medium">IPXK9A72IN</span> to
              see a realistic delay prediction and proactive alert flow.
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link href="/track">Open Tracking</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
