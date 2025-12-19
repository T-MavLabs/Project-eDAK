"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "./AnimatedCard";

interface BentoGridProps {
  className?: string;
  children: ReactNode;
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  className?: string;
  title?: string;
  description?: string;
  header?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  delay?: number;
  span?: 1 | 2 | 3;
}

export function BentoCard({
  className,
  title,
  description,
  header,
  icon,
  children,
  delay = 0,
  span = 1,
}: BentoCardProps) {
  return (
    <AnimatedCard
      className={cn(
        "p-6 flex flex-col",
        span === 2 && "md:col-span-2",
        span === 3 && "md:col-span-3",
        className
      )}
      delay={delay}
    >
      {header && <div className="mb-4">{header}</div>}
      {icon && <div className="mb-3">{icon}</div>}
      {title && (
        <h3 className="text-lg font-semibold mb-2 daksh-text-primary">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground mb-4 daksh-text-secondary">
          {description}
        </p>
      )}
      {children}
    </AnimatedCard>
  );
}
