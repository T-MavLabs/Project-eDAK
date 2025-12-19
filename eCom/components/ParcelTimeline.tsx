import { CheckCircle2, CircleDashed, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParcelTimelineEvent } from "@/lib/mockData";

export function ParcelTimeline({ events }: { events: ParcelTimelineEvent[] }) {
  return (
    <div className="space-y-4">
      {events.map((ev, idx) => {
        const isLast = idx === events.length - 1;
        const isCompleted = ev.status === "completed";
        const isCurrent = ev.status === "current";

        return (
          <div key={`${ev.label}-${idx}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full border",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-primary/10 text-primary",
                  ev.status === "upcoming" && "border-muted-foreground/30 text-muted-foreground",
                )}
                aria-hidden="true"
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isCurrent ? (
                  <MapPin className="h-4 w-4" />
                ) : (
                  <CircleDashed className="h-4 w-4" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "mt-1 h-full w-px",
                    isCompleted ? "bg-primary/30" : "bg-border",
                  )}
                />
              )}
            </div>

            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">{ev.label}</div>
                <div className="text-xs text-muted-foreground">{ev.timestamp}</div>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {ev.location} • <span className="font-medium">{ev.hubCode}</span>
              </div>
              {ev.detail ? (
                <div className="mt-1 text-xs text-muted-foreground">{ev.detail}</div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
