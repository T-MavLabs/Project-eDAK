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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AnimatedCard } from "@/components/aceternity/AnimatedCard";
import { AnimatedText } from "@/components/aceternity/AnimatedText";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { GridPattern } from "@/components/aceternity/GridPattern";

export default function AdminPage() {
  const role = useDemoRole();

  const isAdmin = role === "admin";

  const bottlenecks = useMemo(() => mockAdminDashboard.bottleneckHubs, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 relative overflow-hidden">
      {/* Background effects */}
      <Spotlight className="top-0 right-0 opacity-20" />
      <GridPattern className="opacity-30" />
      
      {/* Operations control room header */}
      <div className="daksh-sticky-header relative z-10">
        <AnimatedText type="fade" delay={0}>
          <div className="daksh-kicker mb-2">Operations Control Center</div>
        </AnimatedText>
        <AnimatedText type="slide" delay={100}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md daksh-gradient-primary daksh-layered aceternity-float">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="daksh-text-primary text-3xl aceternity-gradient-text">
              Admin Analytics Dashboard
            </h1>
          </div>
        </AnimatedText>
        <AnimatedText type="fade" delay={200}>
          <p className="daksh-text-secondary max-w-2xl">
            Operational overview for hubs, delays, and SLA compliance. Dense but readable intelligence for rapid triage.
          </p>
        </AnimatedText>
      </div>

      {!isAdmin ? (
        <div className="mt-6 daksh-layered-elevated daksh-advisory-warning rounded-lg p-6 daksh-slide-up">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-md daksh-gradient-primary daksh-layered flex-shrink-0">
              <LockKeyhole className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="daksh-text-primary mb-1">Admin access (demo)</div>
              <div className="daksh-text-secondary">
                    This page is visible in the hackathon demo only when the role is set to Admin.
                    Use the toggle in the top navigation, or enable Admin demo mode below.
              </div>
            </div>
          </div>
          <div className="daksh-layered rounded-lg p-4 daksh-gradient-muted mb-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-[#FF9933] flex-shrink-0" />
              <div>
                <div className="daksh-text-secondary font-semibold mb-1">Restricted view</div>
                <div className="daksh-text-meta">
                  Enable admin mode to access operational intelligence.
                  </div>
                </div>
              </div>
            </div>
            <Button
            className="bg-primary hover:bg-primary/90 daksh-elevated daksh-focus-ring daksh-press"
              onClick={() => {
                setDemoRole("admin");
              }}
            >
              Enable Admin demo mode
            </Button>
        </div>
      ) : (
        <>
          {/* Inline stat blocks */}
          <div className="mt-6 daksh-slide-up">
            <DashboardStats
              parcelsToday={mockAdminDashboard.totals.parcelsToday}
              delayedParcels={mockAdminDashboard.totals.delayedParcels}
              avgDelayHours={mockAdminDashboard.totals.avgDelayHours}
              slaCompliancePercent={mockAdminDashboard.totals.slaCompliancePercent}
            />
          </div>

          {/* Situation overview section */}
          <div className="mt-10 daksh-sticky-header">
            <div className="daksh-section-divider" />
            <div className="mt-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-2 w-2 rounded-full bg-primary daksh-pulse" />
                <div className="daksh-kicker">Situation Overview</div>
              </div>
              <div className="daksh-text-secondary max-w-3xl">
                High-density views for rapid triage. Color is reserved for notices and exceptions.
              </div>
            </div>
          </div>

          {/* Charts with layered styling */}
          <div className="grid gap-6 lg:grid-cols-3">
            <AnimatedCard 
              className="lg:col-span-2 daksh-layered-deep daksh-gradient-card rounded-xl overflow-hidden border border-border/60 aceternity-glow" 
              delay={400}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-transparent pointer-events-none rounded-xl z-0" />
              <div className="relative z-10">
                <DelayByHubBarChart data={mockAdminDashboard.delayByHub} />
              </div>
            </AnimatedCard>
            <AnimatedCard 
              className="daksh-layered-deep daksh-gradient-card rounded-xl overflow-hidden border border-border/60 aceternity-glow" 
              delay={500}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-transparent pointer-events-none rounded-xl z-0" />
              <div className="relative z-10">
                <RegionalHeatmap data={mockAdminDashboard.regionalDelayHeatmap} />
              </div>
            </AnimatedCard>
          </div>

          <AnimatedCard 
            className="mt-6 daksh-layered-deep daksh-gradient-card rounded-xl overflow-hidden border border-border/60 aceternity-glow" 
            delay={600}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-transparent pointer-events-none rounded-xl z-0" />
            <div className="relative z-10">
              <DelayVsWeatherLineChart data={mockAdminDashboard.delayVsWeather} />
            </div>
          </AnimatedCard>

          {/* Bottleneck hubs table */}
          <div className="mt-12 daksh-slide-up">
            <div className="daksh-sticky-header mb-6">
              <div className="daksh-section-divider" />
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-2 w-2 rounded-full bg-primary daksh-pulse" />
                  <div className="daksh-kicker">Operational Action Items</div>
                </div>
                <div className="daksh-text-secondary max-w-3xl">
                  Prioritized list for operational action (mock).
                </div>
              </div>
            </div>
            <AnimatedCard className="daksh-layered-deep daksh-gradient-card rounded-xl overflow-hidden border border-border/60 aceternity-border-gradient" delay={700}>
              <div className="p-6 border-b border-border/60 daksh-gradient-muted bg-gradient-to-r from-muted/40 to-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-primary animate-pulse aceternity-float" />
                  <div className="daksh-text-primary text-lg font-semibold">Bottleneck Hubs</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                  <div className="daksh-text-meta tabular-nums">{bottlenecks.length} items</div>
                </div>
              </div>
              <div className="p-2 bg-gradient-to-b from-background to-muted/10">
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
                        className="daksh-interactive daksh-table-row-enhanced daksh-fade-in"
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        <TableCell className="font-semibold daksh-text-secondary">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary/40 daksh-pulse" />
                            {h.hub}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="daksh-code">{h.hubCode}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="daksh-status-indicator daksh-badge-enhanced">
                            {h.region}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="daksh-data-emphasis inline-block tabular-nums">
                            {h.avgDelayHours.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="daksh-data-emphasis inline-block tabular-nums">
                            {h.delayedCount.toLocaleString("en-IN")}
                          </div>
                        </TableCell>
                        <TableCell className="daksh-text-secondary text-sm leading-relaxed">{h.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AnimatedCard>
          </div>
        </>
      )}
    </div>
  );
}
