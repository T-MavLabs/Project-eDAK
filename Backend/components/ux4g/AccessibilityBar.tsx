"use client";

import { useState, useEffect } from "react";
import { Type, Contrast, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

type FontSize = "normal" | "small" | "large" | "xlarge";
type ContrastMode = "normal" | "high";

export function AccessibilityBar() {
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Apply font size
    document.documentElement.setAttribute("data-ux4g-font-size", fontSize);

    // Apply high contrast mode
    document.documentElement.setAttribute(
      "data-ux4g-high-contrast",
      highContrast ? "true" : "false"
    );

    // Store preferences in localStorage
    localStorage.setItem("ux4g-font-size", fontSize);
    localStorage.setItem("ux4g-high-contrast", highContrast.toString());
  }, [fontSize, highContrast]);

  useEffect(() => {
    // Load preferences from localStorage on mount
    const savedFontSize = localStorage.getItem("ux4g-font-size") as FontSize | null;
    const savedHighContrast = localStorage.getItem("ux4g-high-contrast") === "true";

    if (savedFontSize) setFontSize(savedFontSize);
    if (savedHighContrast) setHighContrast(savedHighContrast);
  }, []);

  const toggleFontSize = () => {
    const sizes: FontSize[] = ["normal", "small", "large", "xlarge"];
    const currentIndex = sizes.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setFontSize(sizes[nextIndex]);
  };

  const toggleContrast = () => {
    setHighContrast(!highContrast);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Accessibility controls */}
      <div
        className={cn(
          "bg-white border border-neutral-300 rounded-lg shadow-lg overflow-hidden transition-all duration-200",
          isOpen ? "w-64" : "w-12"
        )}
        role="region"
        aria-label="Accessibility controls"
      >
        {/* Toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full p-3 flex items-center justify-center",
            "hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "transition-colors"
          )}
          aria-label={isOpen ? "Close accessibility menu" : "Open accessibility menu"}
          aria-expanded={isOpen}
        >
          <Eye className="h-5 w-5 text-neutral-700" />
        </button>

        {/* Controls panel */}
        {isOpen && (
          <div className="border-t border-neutral-200 p-3 space-y-3">
            {/* Font size control */}
            <div>
              <label
                htmlFor="font-size-toggle"
                className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1"
              >
                <Type className="h-4 w-4" />
                Font Size
              </label>
              <button
                id="font-size-toggle"
                onClick={toggleFontSize}
                className={cn(
                  "w-full px-3 py-2 text-sm rounded-md border border-neutral-300",
                  "hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                  "transition-colors"
                )}
                aria-label={`Font size: ${fontSize}. Click to change`}
              >
                {fontSize === "small" && "Small (14px)"}
                {fontSize === "normal" && "Normal (16px)"}
                {fontSize === "large" && "Large (18px)"}
                {fontSize === "xlarge" && "Extra Large (20px)"}
              </button>
            </div>

            {/* High contrast toggle */}
            <div>
              <label
                htmlFor="contrast-toggle"
                className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1"
              >
                <Contrast className="h-4 w-4" />
                High Contrast
              </label>
              <button
                id="contrast-toggle"
                onClick={toggleContrast}
                className={cn(
                  "w-full px-3 py-2 text-sm rounded-md border transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                  highContrast
                    ? "bg-primary text-white border-primary hover:bg-primary-dark"
                    : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
                )}
                aria-label={`High contrast mode: ${highContrast ? "on" : "off"}. Click to toggle`}
                aria-pressed={highContrast}
              >
                {highContrast ? "On" : "Off"}
              </button>
            </div>

            {/* Reset button */}
            <button
              onClick={() => {
                setFontSize("normal");
                setHighContrast(false);
              }}
              className={cn(
                "w-full px-3 py-2 text-xs text-neutral-600 rounded-md border border-neutral-300",
                "hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                "transition-colors"
              )}
              aria-label="Reset accessibility settings to default"
            >
              Reset to Default
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
