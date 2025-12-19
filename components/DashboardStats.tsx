import { Clock, Package, ShieldCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type StatItem = {
  label: string;
  value: string;
  icon: typeof Package;
  valueClassName?: string;
  accentColor?: string;
};

export function DashboardStats({
  parcelsToday,
  delayedParcels,
  avgDelayHours,
  slaCompliancePercent,
}: {
  parcelsToday: number;
  delayedParcels: number;
  avgDelayHours: number;
  slaCompliancePercent: number;
}) {
  const items: StatItem[] = [
    {
      label: "Total parcels (today)",
      value: parcelsToday.toLocaleString("en-IN"),
      icon: Package,
    },
    {
      label: "Delayed parcels",
      value: delayedParcels.toLocaleString("en-IN"),
      icon: TriangleAlert,
      valueClassName: "text-primary",
      accentColor: "var(--primary)",
    },
    {
      label: "Average delay",
      value: `${avgDelayHours.toFixed(1)} hrs`,
      icon: Clock,
    },
    {
      label: "SLA compliance",
      value: `${slaCompliancePercent.toFixed(1)}%`,
      icon: ShieldCheck,
      valueClassName: "text-[#138808]",
      accentColor: "#138808",
    },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((it, idx) => {
        const Icon = it.icon;
        return (
          <div
            key={it.label}
            className="daksh-layered-deep daksh-gradient-card rounded-xl p-6 daksh-interactive daksh-hover-lift daksh-fade-in border border-border/60 relative overflow-hidden"
            style={{ 
              animationDelay: `${idx * 50}ms`,
              borderLeft: it.accentColor ? `3px solid ${it.accentColor}` : undefined
            }}
          >
            {/* Subtle gradient overlay */}
            {it.accentColor && (
              <div 
                className="absolute inset-0 bg-gradient-to-br opacity-30 pointer-events-none rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${it.accentColor}08 0%, transparent 100%)`
                }}
              />
            )}
            {/* Label above value */}
            <div className="daksh-text-label mb-4 flex items-center justify-between relative z-10">
              <span>{it.label}</span>
              <div className="p-1.5 rounded-md daksh-layered bg-muted/40">
                <Icon className="h-3.5 w-3.5 text-muted-foreground/70" />
              </div>
            </div>
            {/* Value aligned vertically */}
            <div className={cn(
              "daksh-text-data relative z-10",
              it.valueClassName || "text-foreground"
            )}>
              {it.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
