import { Clock, Package, ShieldCheck, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatItem = {
  label: string;
  value: string;
  icon: typeof Package;
  valueClassName?: string;
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
    },
  ] as const;

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Card key={it.label} className="border-primary/10">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                {it.label}
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={it.valueClassName ? `text-2xl font-semibold ${it.valueClassName}` : "text-2xl font-semibold"}>
                {it.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
