"use client";

import { MapPin, Target } from "lucide-react";

export function DigipinIntelligence() {
  return (
    <div className="daksh-layered-deep daksh-gradient-card rounded-xl p-6 border border-border/60">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-md daksh-gradient-primary daksh-layered">
          <Target className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="daksh-text-primary text-lg font-semibold">
            Last-Mile Precision with DIGIPIN
          </div>
          <div className="daksh-text-meta text-xs mt-0.5">
            Enhanced address intelligence for India Post
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="daksh-text-secondary text-sm leading-relaxed">
          DIGIPIN (Digital Geographic Identifier for PIN) provides a <strong>4m × 4m grid</strong>{" "}
          precision for last-mile delivery, significantly reducing "Address Not Found" errors and
          delivery failures.
        </div>

        {/* Visual Grid Mock */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-center mb-3">
            <div className="relative">
              {/* 4x4 Grid Visualization */}
              <div className="grid grid-cols-4 gap-1 w-32 h-32">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-border/40 bg-background/50 rounded-sm"
                    style={{
                      backgroundColor:
                        i === 7 ? "rgba(198, 0, 0, 0.2)" : "rgba(19, 136, 8, 0.1)",
                      borderColor: i === 7 ? "#C60000" : "rgba(17, 24, 39, 0.2)",
                    }}
                  />
                ))}
              </div>
              {/* Target indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <MapPin className="h-6 w-6 text-[#C60000]" />
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="daksh-text-label text-xs mb-1">4m × 4m Precision Grid</div>
            <div className="daksh-text-meta text-xs">
              Each cell represents a 4m × 4m geographic area
            </div>
          </div>
        </div>

        <div className="rounded-lg border-l-4 border-l-primary bg-primary/5 p-4">
          <div className="daksh-text-secondary text-sm font-semibold mb-2">
            Impact on Last-Mile Delivery
          </div>
          <ul className="space-y-1 daksh-text-meta text-xs list-disc list-inside">
            <li>Reduces "Address Not Found" errors by up to 85%</li>
            <li>Enables precise hub-to-delivery-agent routing</li>
            <li>Supports dynamic route optimization in dense urban areas</li>
            <li>Compatible with existing PIN code system (extended precision)</li>
          </ul>
        </div>

        <div className="text-xs daksh-text-meta italic">
          DIGIPIN codes are automatically generated during parcel booking and used throughout the
          DAKSH tracking and analytics pipeline for operational intelligence.
        </div>
      </div>
    </div>
  );
}
