import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Database,
  FileCheck2,
  Globe,
  MapPinned,
  Network,
  Route,
  Shield,
  TrendingUp,
  Users,
  Crosshair,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
      {/* System Header */}
      <div className="mb-12 daksh-fade-in">
        <div className="daksh-kicker mb-3">National Logistics Intelligence Platform</div>
        <h1 className="text-4xl font-semibold tracking-tight mb-4">
          DAKSH
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mb-6">
          Delivery Analytics & Knowledge System for Shipment — an operational intelligence platform 
          for India Post officers to monitor, predict, and optimize nationwide parcel logistics.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 daksh-elevated daksh-focus-ring">
            <Link href="/track">Track Parcel</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="daksh-elevated daksh-focus-ring">
            <Link href="/admin">Operational Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="daksh-rule my-10" />

      {/* System Overview Section */}
      <section className="mb-12 daksh-slide-up">
        <div className="daksh-sticky-header mb-6 pb-4">
          <div className="daksh-kicker mb-2">System Overview</div>
          <h2 className="text-2xl font-semibold tracking-tight mb-3">
            Operational Intelligence for India Post
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
            DAKSH provides real-time visibility into parcel movements, predictive delay analysis, 
            and operational metrics across India Post's nationwide network. Designed for officers 
            managing logistics operations, route optimization, and service level compliance.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="border daksh-glass rounded-lg p-6 daksh-elevated daksh-transition">
            <div className="flex items-start gap-4 mb-4">
              <div className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-primary flex-shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">Primary Users</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  India Post operations officers, logistics coordinators, and administrative staff 
                  responsible for parcel tracking, route management, and service delivery oversight.
                </p>
              </div>
            </div>
          </div>

          <div className="border daksh-glass rounded-lg p-6 daksh-elevated daksh-transition">
            <div className="flex items-start gap-4 mb-4">
              <div className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-primary flex-shrink-0">
                <Crosshair className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">Core Objectives</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enhance delivery predictability, reduce transit delays, optimize hub capacity 
                  utilization, and maintain service level agreements across all delivery modes.
                </p>
              </div>
            </div>
          </div>

          <div className="border daksh-glass rounded-lg p-6 daksh-elevated daksh-transition">
            <div className="flex items-start gap-4 mb-4">
              <div className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-primary flex-shrink-0">
                <Network className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">Platform Scope</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Nationwide coverage across 1.5+ lakh post offices. Integration-ready for MSME 
                  e-commerce platforms and third-party logistics providers via standardized APIs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="daksh-rule my-10" />

      {/* Core Capabilities Section */}
      <section className="mb-12 daksh-slide-up">
        <div className="daksh-sticky-header mb-6 pb-4">
          <div className="daksh-kicker mb-2">Core Capabilities</div>
          <h2 className="text-2xl font-semibold tracking-tight mb-3">
            Operational Intelligence Modules
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
            Structured intelligence panels providing actionable insights for logistics operations.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              title: "Predictive Delivery Delay Analysis",
              icon: TrendingUp,
              description: "Probability-based delay predictions with risk factor identification including weather conditions, hub congestion, and route anomalies.",
              metrics: "Delay probability scoring, risk factor breakdown, predicted delay windows",
            },
            {
              title: "DIGIPIN-based Location Intelligence",
              icon: MapPinned,
              description: "Standardized origin and destination code presentation for consistent location referencing across all operational systems.",
              metrics: "DIGIPIN mapping, route correlation, geographic coverage analysis",
            },
            {
              title: "Proactive Notification System",
              icon: AlertTriangle,
              description: "Automated system advisories with severity classification and actionable messaging for operational response.",
              metrics: "Severity-based alerts, notification routing, response tracking",
            },
            {
              title: "AI-assisted Complaint Resolution",
              icon: FileCheck2,
              description: "Automated complaint categorization, severity assessment, and response generation for efficient triage and resolution.",
              metrics: "Auto-categorization accuracy, resolution time tracking, complaint analytics",
            },
            {
              title: "Route Reliability Analysis",
              icon: Route,
              description: "Comprehensive route performance metrics identifying reliability risks and optimization opportunities across delivery modes.",
              metrics: "Route variance analysis, reliability scoring, mode comparison",
            },
            {
              title: "Hub Congestion Monitoring",
              icon: Building2,
              description: "Real-time capacity constraint identification at sorting hubs to enable proactive resource allocation and routing adjustments.",
              metrics: "Congestion scoring, capacity utilization, bottleneck identification",
            },
          ].map((capability, idx) => {
            const Icon = capability.icon;
            return (
              <div
                key={capability.title}
                className="border daksh-glass rounded-lg p-6 daksh-elevated daksh-transition daksh-fade-in hover:border-primary/20"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold mb-2">{capability.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {capability.description}
                    </p>
                    <div className="text-xs text-muted-foreground daksh-code">
                      Metrics: {capability.metrics}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="daksh-rule my-10" />

      {/* Data Intelligence Highlights */}
      <section className="mb-12 daksh-slide-up">
        <div className="daksh-sticky-header mb-6 pb-4">
          <div className="daksh-kicker mb-2">Data Intelligence Highlights</div>
          <h2 className="text-2xl font-semibold tracking-tight mb-3">
            System Capabilities & Integration Readiness
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
            Production-ready features supporting nationwide logistics operations and third-party integrations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="border daksh-glass rounded-lg p-6 daksh-elevated daksh-transition">
            <div className="flex items-start gap-4 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary flex-shrink-0">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">Nationwide Coverage</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Operational intelligence spanning India Post's complete network infrastructure, 
                  including remote and urban delivery routes.
                </p>
                <div className="text-xs text-muted-foreground daksh-code">
                  Coverage: 1.5+ lakh post offices | All delivery modes | Real-time tracking
                </div>
              </div>
            </div>
          </div>

          <div className="border daksh-glass rounded-lg p-6 daksh-elevated daksh-transition">
            <div className="flex items-start gap-4 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary flex-shrink-0">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">Predictive Analytics</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Machine learning models for delay prediction, route optimization, and capacity 
                  planning based on historical patterns and real-time conditions.
                </p>
                <div className="text-xs text-muted-foreground daksh-code">
                  ML-based predictions | Risk factor analysis | SLA compliance monitoring
                </div>
              </div>
            </div>
          </div>

          <div className="border daksh-glass rounded-lg p-6 daksh-elevated daksh-transition">
            <div className="flex items-start gap-4 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary flex-shrink-0">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">Integration Readiness</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  API-first architecture designed for seamless integration with India Post backend 
                  systems, MSME platforms, and third-party logistics providers.
                </p>
                <div className="text-xs text-muted-foreground daksh-code">
                  RESTful APIs | Standardized data formats | Authentication & authorization
                </div>
              </div>
            </div>
          </div>

          <div className="border daksh-glass rounded-lg p-6 daksh-elevated daksh-transition">
            <div className="flex items-start gap-4 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary flex-shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">Audit & Compliance</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Comprehensive audit trails, event logging, and role-based access controls 
                  prepared for government compliance and security requirements.
                </p>
                <div className="text-xs text-muted-foreground daksh-code">
                  Event logging | Role-based access | Audit-friendly data structures
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="daksh-rule my-10" />

      {/* Quick Access Panel */}
      <section className="border daksh-glass rounded-lg p-6 daksh-elevated daksh-transition">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold mb-2">System Access</div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Begin operational review with tracking ID <span className="daksh-code font-medium">IPXK9A72IN</span> 
              to examine delay prediction algorithms and proactive notification workflows.
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="secondary" className="daksh-elevated daksh-focus-ring">
              <Link href="/track">Open Tracking Interface</Link>
            </Button>
            <Button asChild variant="outline" className="daksh-elevated daksh-focus-ring">
              <Link href="/admin">Access Operational Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
