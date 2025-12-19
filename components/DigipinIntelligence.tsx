"use client";

import { MapPin, Target } from "lucide-react";
import { Panel } from "@/components/ux4g/Panel";

/**
 * DIGIPIN Intelligence Component
 * UX4G-compliant card showing Last Mile precision grid visualization
 */
export function DigipinIntelligence() {
  // Target cell index (7 = center-left in 4x4 grid)
  const targetCellIndex = 7;

  return (
    <Panel
      title="Last-Mile Precision with DIGIPIN"
      description="Enhanced address intelligence for India Post"
      elevated
      aria-label="DIGIPIN Last-Mile Delivery Intelligence"
    >
      <div className="space-y-4">
        <p 
          className="text-sm text-neutral-700 leading-relaxed"
          style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
        >
          DIGIPIN (Digital Geographic Identifier for PIN) provides a <strong>4m × 4m grid</strong>{" "}
          precision for last-mile delivery, significantly reducing "Address Not Found" errors and
          delivery failures.
        </p>

        {/* Accessible 4m x 4m Grid Visualization */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-center mb-3">
            <figure className="relative" role="img" aria-label="4 meter by 4 meter precision grid visualization showing 16 cells">
              {/* 4x4 Grid Visualization - SVG for better accessibility */}
              <svg
                width="128"
                height="128"
                viewBox="0 0 128 128"
                className="block"
                aria-hidden="true"
              >
                <title>4m × 4m Precision Grid</title>
                <desc>16-cell grid where each cell represents a 4 meter by 4 meter geographic area</desc>
                {Array.from({ length: 16 }).map((_, i) => {
                  const row = Math.floor(i / 4);
                  const col = i % 4;
                  const x = col * 32;
                  const y = row * 32;
                  const isTarget = i === targetCellIndex;
                  
                  return (
                    <rect
                      key={i}
                      x={x}
                      y={y}
                      width="30"
                      height="30"
                      fill={isTarget ? "rgba(231, 76, 60, 0.2)" : "rgba(19, 136, 8, 0.1)"}
                      stroke={isTarget ? "#E74C3C" : "rgba(17, 24, 39, 0.2)"}
                      strokeWidth="1"
                      rx="2"
                      aria-label={isTarget ? `Target cell ${i + 1}` : `Grid cell ${i + 1}`}
                    />
                  );
                })}
                {/* Target pin indicator */}
                <circle
                  cx={1 * 32 + 15}
                  cy={1 * 32 + 15}
                  r="8"
                  fill="#E74C3C"
                  aria-label="Target location"
                />
                <path
                  d={`M ${1 * 32 + 15} ${1 * 32 + 23} L ${1 * 32 + 15} ${1 * 32 + 32} L ${1 * 32 + 7} ${1 * 32 + 32} Z`}
                  fill="#E74C3C"
                />
              </svg>
            </figure>
          </div>
          <figcaption className="text-center">
            <div 
              className="text-xs font-medium text-neutral-600 uppercase tracking-wide mb-1"
              style={{ fontSize: "var(--ux4g-text-xs, 0.75rem)" }}
            >
              4m × 4m Precision Grid
            </div>
            <div 
              className="text-xs text-neutral-600"
              style={{ fontSize: "var(--ux4g-text-xs, 0.75rem)" }}
            >
              Each cell represents a 4m × 4m geographic area
            </div>
          </figcaption>
        </div>

        {/* Impact panel */}
        <div className="rounded-lg border-l-4 border-l-[#E74C3C] bg-[#E74C3C]/5 p-4">
          <div 
            className="text-sm font-semibold text-neutral-900 mb-2"
            style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
          >
            Impact on Last-Mile Delivery
          </div>
          <ul 
            className="space-y-1.5 text-xs text-neutral-700 list-disc list-inside leading-relaxed"
            style={{ fontSize: "var(--ux4g-text-xs, 0.75rem)" }}
          >
            <li>Reduces "Address Not Found" errors by up to 85%</li>
            <li>Enables precise hub-to-delivery-agent routing</li>
            <li>Supports dynamic route optimization in dense urban areas</li>
            <li>Compatible with existing PIN code system (extended precision)</li>
          </ul>
        </div>

        <p 
          className="text-xs text-neutral-600 italic leading-relaxed"
          style={{ fontSize: "var(--ux4g-text-xs, 0.75rem)" }}
        >
          DIGIPIN codes are automatically generated during parcel booking and used throughout the
          DAKSH tracking and analytics pipeline for operational intelligence.
        </p>
      </div>
    </Panel>
  );
}
