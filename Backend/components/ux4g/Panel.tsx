"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  title?: string;
  description?: string;
  children: ReactNode;
  elevated?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * UX4G-compliant Panel component
 * Container for related content with optional header
 */
export function Panel({
  title,
  description,
  children,
  elevated = false,
  className,
  "aria-label": ariaLabel,
}: PanelProps) {
  return (
    <div
      className={cn(
        "bg-white border border-neutral-200 rounded-xl p-6",
        elevated
          ? "shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]"
          : "shadow-[0_1px_2px_0_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.1)]",
        className
      )}
      aria-label={ariaLabel || title}
      role="region"
    >
      {/* Header */}
      {(title || description) && (
        <div className="mb-6 pb-4 border-b border-neutral-200">
          {title && (
            <h3
              className="text-xl font-semibold leading-tight mb-2 text-neutral-900"
              style={{ fontSize: "var(--ux4g-text-xl, 1.25rem)" }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              className="text-sm text-neutral-600 leading-relaxed"
              style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
            >
              {description}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}
