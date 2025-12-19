"use client";

import { useMemo } from "react";
import { BarChart3, LockKeyhole, ShieldAlert } from "lucide-react";

import { mockAdminDashboard } from "@/lib/mockData";
import { setDemoRole, useDemoRole } from "@/lib/useDemoRole";
import { DashboardStats } from "@/components/DashboardStats";
import {
  DelayByHubBarChart,
  DelayVsWeatherLineChart,
  RegionalHeatmap,
} from "@/components/Charts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const role = useDemoRole();

  const isAdmin = role === "admin";

  const bottlenecks = useMemo(() => mockAdminDashboard.bottleneckHubs, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2 daksh-fade-in">
        <div className="daksh-kicker">Operations Control Room</div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <BarChart3 className="h-5 w-5 text-primary" />
          National Logistics Operations Dashboard
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Operational overview for hubs, delay windows, and SLA compliance. For demo purposes, access is role-gated.
        </p>
      </div>

      {!isAdmin ? (
        <Card className="mt-6 border-primary/15 daksh-glass daksh-elevated daksh-transition daksh-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LockKeyhole className="h-4 w-4 text-primary" />
              Admin access (demo)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border daksh-glass bg-muted/40 p-4 daksh-elevated daksh-transition">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-4 w-4 text-[#FF9933]" />
                <div>
                  <div className="text-sm font-semibold">Restricted view</div>
                  <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    This page is visible in the hackathon demo only when the role is set to Admin.
                    Use the toggle in the top navigation, or enable Admin demo mode below.
                  </div>
                </div>
              </div>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 daksh-elevated daksh-focus-ring"
              onClick={() => {
                setDemoRole("admin");
              }}
            >
              Enable Admin demo mode
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mt-6 daksh-slide-up">
            <DashboardStats
              parcelsToday={mockAdminDashboard.totals.parcelsToday}
              delayedParcels={mockAdminDashboard.totals.delayedParcels}
              avgDelayHours={mockAdminDashboard.totals.avgDelayHours}
              slaCompliancePercent={mockAdminDashboard.totals.slaCompliancePercent}
            />
          </div>

          <div className="mt-8 daksh-sticky-header daksh-transition">
            <div className="daksh-rule" />
            <div className="mt-4 flex flex-col gap-1 pb-4">
              <div className="daksh-kicker">Situation overview</div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                High-density views for rapid triage. Color is reserved for notices and exceptions.
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3 daksh-slide-up">
            <div className="lg:col-span-2">
              <DelayByHubBarChart data={mockAdminDashboard.delayByHub} />
            </div>
            <RegionalHeatmap data={mockAdminDashboard.regionalDelayHeatmap} />
          </div>

          <div className="mt-6 daksh-slide-up">
            <DelayVsWeatherLineChart data={mockAdminDashboard.delayVsWeather} />
          </div>

          <div className="mt-8 daksh-slide-up">
            <Card className="border-border daksh-glass daksh-elevated daksh-transition">
              <CardHeader className="space-y-2 border-b">
                <CardTitle className="text-base">Bottleneck Hubs Register</CardTitle>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Prioritized for operational action. Use for shift briefing and escalation (mock dataset).
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hub</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead className="text-right">Avg delay (hrs)</TableHead>
                      <TableHead className="text-right">Delayed count</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bottlenecks.map((h, idx) => (
                      <TableRow 
                        key={h.hubCode}
                        className="daksh-transition daksh-fade-in"
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        <TableCell className="font-medium">{h.hub}</TableCell>
                        <TableCell className="daksh-code text-xs">{h.hubCode}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="daksh-transition">{h.region}</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums daksh-code">
                          {h.avgDelayHours.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums daksh-code">
                          {h.delayedCount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground leading-relaxed">{h.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
