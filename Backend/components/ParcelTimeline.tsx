import { CheckCircle2, CircleDashed, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParcelTimelineEvent } from "@/lib/mockData";

export function ParcelTimeline({ events }: { events: ParcelTimelineEvent[] }) {
  const completedCount = events.filter((e) => e.status === "completed").length;
  const progressPercent = (completedCount / events.length) * 100;

  return (
    <section aria-label="Parcel tracking timeline" className="space-y-4">
      <div className="daksh-rule" />
      
      {/* Progress indicator */}
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-[color:var(--daksh-notice-green)] daksh-transition"
          style={{
            width: `${progressPercent}%`,
            transition: "width 200ms ease-out",
          }}
          aria-hidden="true"
        />
      </div>

      <div className="space-y-1">
        {events.map((ev, idx) => {
          const isLast = idx === events.length - 1;
          const isCompleted = ev.status === "completed";
          const isCurrent = ev.status === "current";

          return (
            <div
              key={`${ev.label}-${idx}`}
              className={cn(
                "grid gap-3 border-b py-3 daksh-transition daksh-fade-in",
                "sm:grid-cols-[140px_1fr_170px]",
                isCurrent && "bg-[color:color-mix(in oklab, var(--daksh-notice-amber) 6%, white)] daksh-glass",
                isCompleted && "opacity-90",
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3 sm:flex-col sm:gap-1">
                <div className="daksh-kicker">Station Code</div>
                <div className="daksh-stamp daksh-elevated daksh-transition">{ev.hubCode}</div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold text-foreground">{ev.label}</div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[0.72rem] font-semibold uppercase tracking-wide daksh-transition",
                      isCompleted &&
                        "border-transparent bg-[color:color-mix(in oklab, var(--daksh-notice-green) 10%, white)] text-[color:var(--daksh-notice-green)]",
                      isCurrent &&
                        "border-transparent bg-[color:color-mix(in oklab, var(--daksh-notice-amber) 12%, white)] text-[color:color-mix(in oklab, var(--daksh-notice-amber) 80%, black)]",
                      ev.status === "upcoming" &&
                        "border-[color:var(--daksh-rule)] bg-background text-muted-foreground",
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 daksh-transition" aria-hidden="true" />
                    ) : isCurrent ? (
                      <MapPin className="h-3.5 w-3.5 daksh-transition" aria-hidden="true" />
                    ) : (
                      <CircleDashed className="h-3.5 w-3.5 daksh-transition" aria-hidden="true" />
                    )}
                    {isCompleted ? "Completed" : isCurrent ? "Current" : "Upcoming"}
                  </span>
                </div>

                <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {ev.location} • <span className="daksh-code text-xs">{ev.hubCode}</span>
                </div>
                {ev.detail ? (
                  <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{ev.detail}</div>
                ) : null}
              </div>

              <div className="sm:text-right">
                <div className="daksh-kicker">Scan time (IST)</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  <span className="daksh-code">{ev.timestamp}</span>
                </div>
                {!isLast ? (
                  <div
                    className={cn(
                      "mt-3 hidden h-px w-full sm:block daksh-transition",
                      isCompleted
                        ? "bg-[color:color-mix(in oklab, var(--daksh-notice-green) 22%, var(--daksh-rule))]"
                        : "bg-border",
                    )}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="daksh-rule" />
    </section>
  );
}
