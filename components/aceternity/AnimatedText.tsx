"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  type?: "fade" | "slide" | "scale";
}

export function AnimatedText({ 
  children, 
  className, 
  delay = 0,
  type = "fade"
}: AnimatedTextProps) {
  const animationClass = {
    fade: "aceternityFadeIn",
    slide: "aceternitySlideUp",
    scale: "aceternityScaleIn",
  }[type];

  return (
    <div
      className={cn("aceternity-text", className)}
      style={{
        animation: `${animationClass} 0.8s ease-out ${delay}ms both`,
      }}
    >
      {children}
    </div>
  );
}
