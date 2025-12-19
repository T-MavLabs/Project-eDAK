"use client";

import { cn } from "@/lib/utils";

interface GridPatternProps {
  className?: string;
  squares?: number[][];
  size?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: number;
}

export function GridPattern({
  className,
  squares,
  size = 20,
  width = 40,
  height = 40,
  x = 0,
  y = 0,
  strokeDasharray = 0,
}: GridPatternProps) {
  const patternId = `grid-pattern-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/10 stroke-gray-400/10",
        className
      )}
    >
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M ${width / 2} 0 L ${width / 2} ${height}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
          <path
            d={`M 0 ${height / 2} L ${width} ${height / 2}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y], i) => (
            <rect
              key={`${x}-${y}`}
              width={size}
              height={size}
              x={x * width}
              y={y * height}
              className="fill-primary/5 stroke-primary/10"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
