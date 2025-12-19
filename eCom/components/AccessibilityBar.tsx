"use client";

import { useState, useEffect } from "react";
import { Type, Contrast, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccessibilityBar() {
  const [textSize, setTextSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedTextSize = localStorage.getItem("ux4g-text-size") as typeof textSize | null;
    const savedContrast = localStorage.getItem("ux4g-high-contrast") === "true";
    const savedKeyboardHints = localStorage.getItem("ux4g-keyboard-hints") === "true";

    if (savedTextSize) setTextSize(savedTextSize);
    if (savedContrast) setHighContrast(savedContrast);
    if (savedKeyboardHints) setShowKeyboardHints(savedKeyboardHints);
  }, []);

  useEffect(() => {
    // Apply text size
    const root = document.documentElement;
    root.classList.remove("ux4g-text-normal", "ux4g-text-large", "ux4g-text-xlarge");
    root.classList.add(`ux4g-text-${textSize}`);
    localStorage.setItem("ux4g-text-size", textSize);
  }, [textSize]);

  useEffect(() => {
    // Apply high contrast
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add("ux4g-high-contrast");
    } else {
      root.classList.remove("ux4g-high-contrast");
    }
    localStorage.setItem("ux4g-high-contrast", String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    // Apply keyboard hints
    const root = document.documentElement;
    if (showKeyboardHints) {
      root.classList.add("ux4g-keyboard-hints");
    } else {
      root.classList.remove("ux4g-keyboard-hints");
    }
    localStorage.setItem("ux4g-keyboard-hints", String(showKeyboardHints));
  }, [showKeyboardHints]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-lg border bg-background/95 backdrop-blur-sm p-2 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const sizes: typeof textSize[] = ["normal", "large", "xlarge"];
            const currentIndex = sizes.indexOf(textSize);
            setTextSize(sizes[(currentIndex + 1) % sizes.length]);
          }}
          className="h-9 w-9 p-0"
          aria-label={`Text size: ${textSize}. Click to change.`}
          title={`Text size: ${textSize}`}
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHighContrast(!highContrast)}
          className={`h-9 w-9 p-0 ${highContrast ? "bg-primary/10 text-primary" : ""}`}
          aria-label={highContrast ? "Disable high contrast" : "Enable high contrast"}
          title={highContrast ? "High contrast: On" : "High contrast: Off"}
        >
          <Contrast className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowKeyboardHints(!showKeyboardHints)}
          className={`h-9 w-9 p-0 ${showKeyboardHints ? "bg-primary/10 text-primary" : ""}`}
          aria-label={showKeyboardHints ? "Hide keyboard hints" : "Show keyboard hints"}
          title={showKeyboardHints ? "Keyboard hints: On" : "Keyboard hints: Off"}
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
