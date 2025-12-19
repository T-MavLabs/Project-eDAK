import { CheckCircle2, CircleDashed, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParcelTimelineEvent } from "@/lib/mockData";

export function ParcelTimeline({ events }: { events: ParcelTimelineEvent[] }) {
  return (
    <div className="space-y-5">
      {events.map((ev, idx) => {
        const isLast = idx === events.length - 1;
        const isCompleted = ev.status === "completed";
        const isCurrent = ev.status === "current";

        return (
          <div 
            key={`${ev.label}-${idx}`} 
            className="flex gap-4 daksh-fade-in daksh-interactive group"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full border-2 daksh-interactive daksh-hover-lift",
                  "relative",
                  isCompleted && "border-primary daksh-gradient-primary text-primary-foreground shadow-md",
                  isCurrent && "border-primary bg-primary/5 text-primary daksh-layered shadow-sm",
                  ev.status === "upcoming" && "border-muted-foreground/20 bg-muted/30 text-muted-foreground",
                )}
                aria-hidden="true"
              >
                {/* Inner shadow for depth */}
                {isCompleted && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                )}
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 relative z-10" />
                ) : isCurrent ? (
                  <MapPin className="h-5 w-5 relative z-10" />
                ) : (
                  <CircleDashed className="h-5 w-5 relative z-10" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "mt-2 h-full w-0.5 daksh-interactive",
                    isCompleted 
                      ? "bg-gradient-to-b from-primary/40 via-primary/30 to-primary/20" 
                      : "bg-gradient-to-b from-border via-border/50 to-transparent",
                  )}
                  style={{ minHeight: "2rem" }}
                />
              )}
            </div>

            <div className="flex-1 pb-3 daksh-interactive group-hover:translate-x-0.5">
              <div className="daksh-layered rounded-lg p-4 daksh-hover-lift">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div className="daksh-text-primary">{ev.label}</div>
                  <div className="daksh-text-meta tabular-nums">{ev.timestamp}</div>
                </div>
                <div className="daksh-text-secondary mt-1.5">
                  <span className="font-medium text-foreground">{ev.location}</span>
                  {" • "}
                  <span className="daksh-code">{ev.hubCode}</span>
              </div>
                {ev.detail ? (
                  <div className="mt-2.5 daksh-text-meta leading-relaxed">{ev.detail}</div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
