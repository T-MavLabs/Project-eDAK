"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  isRisk?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * UX4G-compliant KPI Card component
 * Displays a key performance indicator with label, value, and optional icon
 */
export function KpiCard({
  label,
  value,
  icon: Icon,
  isRisk = false,
  className,
  "aria-label": ariaLabel,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-neutral-200 rounded-lg p-6",
        "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]",
        "transition-all duration-150",
        "hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]",
        "hover:-translate-y-px",
        isRisk && "border-l-[3px] border-l-[#DC2626]",
        className
      )}
      aria-label={ariaLabel || `${label}: ${value}`}
      role="region"
    >
      {/* Label and icon row */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-sm font-medium text-neutral-600 uppercase tracking-wide"
          style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
        >
          {label}
        </span>
        <div className="p-1.5 rounded-md bg-neutral-100">
          <Icon
            className="h-3.5 w-3.5 text-neutral-500"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Value */}
      <div
        className={cn(
          "text-2xl font-semibold leading-tight tracking-tight",
          isRisk ? "text-[#DC2626]" : "text-neutral-900"
        )}
        style={{ fontSize: "var(--ux4g-text-2xl, 1.5rem)" }}
      >
        {value}
      </div>
    </div>
  );
}
