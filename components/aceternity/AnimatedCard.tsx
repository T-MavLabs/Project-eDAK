"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function AnimatedCard({ children, className, delay = 0, hover = true }: AnimatedCardProps) {
  return (
    <div
      className={cn(
        "aceternity-card group relative overflow-hidden rounded-xl border border-border/60 bg-card",
        "transition-all duration-300 ease-out",
        hover && "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
      style={{
        animation: `aceternityFadeIn 0.6s ease-out ${delay}ms both`,
      }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10 group-hover:via-primary/5" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100" />
      
      <div className="relative z-10">{children}</div>
    </div>
  );
}
