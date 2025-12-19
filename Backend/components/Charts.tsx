"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  HubDelayMetric,
  RegionalHeatCell,
  WeatherDelayMetric,
} from "@/lib/mockData";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function heatColor(delayIndex: number) {
  if (delayIndex >= 70) return "#C60000";
  if (delayIndex >= 50) return "#FF9933";
  if (delayIndex >= 35) return "#9CA3AF";
  return "#138808";
}

export function DelayByHubBarChart({ data }: { data: HubDelayMetric[] }) {
  const chartData = data.map((d) => ({
    hub: d.hubCode,
    avgDelay: d.avgDelayHours,
    delayed: d.delayedCount,
  }));

  return (
    <Card className="daksh-glass daksh-elevated daksh-transition daksh-fade-in">
      <CardHeader>
        <CardTitle className="text-base">Delay by hub</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(17, 24, 39, 0.08)" />
            <XAxis dataKey="hub" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "rgba(198,0,0,0.06)" }}
              contentStyle={{ borderRadius: 10, borderColor: "rgba(0,0,0,0.08)", backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)" }}
            />
            <Bar dataKey="avgDelay" name="Avg delay (hrs)" fill="#C60000" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DelayVsWeatherLineChart({
  data,
}: {
  data: WeatherDelayMetric[];
}) {
  return (
    <Card className="daksh-glass daksh-elevated daksh-transition daksh-fade-in">
      <CardHeader>
        <CardTitle className="text-base">Delay vs weather</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(17, 24, 39, 0.08)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: 10, borderColor: "rgba(0,0,0,0.08)", backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)" }}
            />
            <Line
              type="monotone"
              dataKey="delayHours"
              name="Delay (hrs)"
              stroke="#C60000"
              strokeWidth={2}
              dot={{ r: 3, fill: "#C60000" }}
            />
            <Line
              type="monotone"
              dataKey="probability"
              name="Delay probability (%)"
              stroke="#FF9933"
              strokeWidth={2}
              dot={{ r: 3, fill: "#FF9933" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function RegionalHeatmap({ data }: { data: RegionalHeatCell[] }) {
  return (
    <Card className="daksh-glass daksh-elevated daksh-transition daksh-fade-in">
      <CardHeader>
        <CardTitle className="text-base">Regional delay heatmap (simplified)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data.map((cell, idx) => (
            <div
              key={cell.region}
              className="flex items-center justify-between rounded-md border daksh-glass p-3 daksh-elevated daksh-transition daksh-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div>
                <div className="text-sm font-semibold">{cell.region}</div>
                <div className="text-xs text-muted-foreground">Delay index (0–100)</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold tabular-nums daksh-code">{cell.delayIndex}</div>
                <div
                  className="h-3 w-20 rounded-full daksh-transition"
                  style={{
                    background: `linear-gradient(90deg, ${heatColor(cell.delayIndex)} 0%, rgba(0,0,0,0.06) 100%)`,
                  }}
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full daksh-transition" style={{ background: "#138808" }} />
            Lower risk
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full daksh-transition" style={{ background: "#9CA3AF" }} />
            Moderate
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full daksh-transition" style={{ background: "#FF9933" }} />
            Elevated
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full daksh-transition" style={{ background: "#C60000" }} />
            High
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Mode comparison colors
const MODE_COLORS = {
  Surface: "#C60000", // India Post Red
  Air: "#FF9933", // Saffron
  Express: "#138808", // India Green
};

export type ModeComparisonData = {
  mode: "Surface" | "Air" | "Express";
  efficiencyScore: number;
  avgTransitDays: number;
  totalShipments: number;
  delayRate: number;
};

/**
 * Delivery Mode Comparison Doughnut Chart
 */
export function ModeComparisonChart({
  data,
}: {
  data: ModeComparisonData[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="p-5">
        <div className="mb-4">
          <div className="daksh-text-label mb-1">Delivery Mode Comparison</div>
          <div className="daksh-text-secondary text-xs">
            Average delivery days comparison across delivery modes
          </div>
        </div>
        <div className="h-72 flex items-center justify-center">
          <div className="text-center daksh-text-secondary">
            No mode comparison data available
          </div>
        </div>
      </div>
    );
  }

  // Map data to chart format - value represents average transit days
  const chartData = data.map((d) => ({
    name: d.mode,
    value: d.avgTransitDays || 0, // Average delivery days
    avgTransitDays: d.avgTransitDays || 0,
    totalShipments: d.totalShipments || 0,
    delayRate: d.delayRate || 0,
  }));

  const COLORS = data.map((d) => MODE_COLORS[d.mode] || "#9CA3AF");

  // Find mode with highest average delivery days (slowest)
  const slowestMode = data.length > 0 
    ? data.reduce((prev, current) => 
        (current.avgTransitDays || 0) > (prev.avgTransitDays || 0) ? current : prev
      )
    : { mode: "N/A" as const, avgTransitDays: 0 };

  return (
    <div className="p-5">
      <div className="mb-4">
        <div className="daksh-text-label mb-1">Delivery Mode Comparison</div>
        <div className="daksh-text-secondary text-xs">
          Average delivery days comparison across delivery modes
        </div>
      </div>
      <div className="h-72 min-h-[288px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={288}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value} days`}
              outerRadius={80}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md">
                      <div className="font-semibold">{data.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Avg Delivery: {data.value} days
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 rounded-lg border bg-muted/30 p-3">
        <div className="text-sm font-semibold daksh-text-secondary mb-1">
          Delivery Time Analysis
        </div>
        <div className="text-xs daksh-text-meta leading-relaxed">
          Comparing average delivery days across different modes. Lower days indicate faster
          delivery performance. <strong>{slowestMode.mode}</strong> mode has the highest average delivery time ({slowestMode.avgTransitDays} days).
        </div>
      </div>
    </div>
  );
}

export type CongestedHubData = {
  hub: string;
  hubCode: string;
  congestionScore: number;
  avgDelayHours: number;
  delayedCount: number;
  region: string;
};

/**
 * Top Congested Hubs Horizontal Bar Chart using Chart.js with enhanced animations
 */
export function CongestedHubsChart({
  data,
}: {
  data: CongestedHubData[];
}) {
  // Dynamic import to avoid SSR issues with Chart.js
  const [ChartComponent, setChartComponent] = React.useState<typeof import("react-chartjs-2").Bar | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    Promise.all([
      import("react-chartjs-2"),
      import("chart.js"),
    ]).then(([chartjs2, chartjs]) => {
      // Register Chart.js components
      const { Chart, registerables } = chartjs;
      Chart.register(...registerables);
      setChartComponent(() => chartjs2.Bar);
    }).catch((error) => {
      console.error("Failed to load Chart.js:", error);
    });
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="p-5">
        <div className="mb-4">
          <div className="daksh-text-label mb-1">Top Congested Hubs</div>
          <div className="daksh-text-secondary text-xs">
            Hub congestion analysis based on delay metrics and throughput
          </div>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center daksh-text-secondary">
            <div className="mb-2">No hub data available</div>
            <div className="text-xs daksh-text-meta">Please check the API connection</div>
          </div>
        </div>
      </div>
    );
  }

  // Convert congestion score (0-10) to percentage (0-100)
  const chartData = [...data]
    .filter(d => d && d.congestionScore !== undefined && d.congestionScore !== null)
    .sort((a, b) => b.congestionScore - a.congestionScore)
    .map((d) => ({
      hub: d.hub || "N/A",
      hubCode: d.hubCode || "N/A",
      congestionPercent: (d.congestionScore || 0) * 10, // Convert 0-10 scale to 0-100%
    }));

  if (chartData.length === 0) {
    return (
      <div className="p-5">
        <div className="mb-4">
          <div className="daksh-text-label mb-1">Top Congested Hubs</div>
          <div className="daksh-text-secondary text-xs">
            Hub congestion analysis based on delay metrics and throughput
          </div>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center daksh-text-secondary">
            <div className="mb-2">No valid hub data found</div>
            <div className="text-xs daksh-text-meta">Check data format</div>
          </div>
        </div>
      </div>
    );
  }

  // Gradient colors from red to orange (based on percentage)
  const getBarColor = (percent: number) => {
    if (percent >= 70) return "#C60000"; // India Post Red
    if (percent >= 50) return "#E74C3C"; // Lighter red
    return "#FF9933"; // Saffron
  };

  // Prepare Chart.js data
  const labels = chartData.map(d => d.hubCode);
  const values = chartData.map(d => d.congestionPercent);
  const colors = chartData.map(d => getBarColor(d.congestionPercent));

  const chartJsData = {
    labels,
    datasets: [
      {
        label: "Congestion (%)",
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(c => c + "CC"), // Add transparency
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const chartJsOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: "easeInOutQuad" as const,
      delay: (context: any) => {
        let delay = 0;
        if (context.type === "data" && context.mode === "default") {
          delay = context.dataIndex * 80; // Staggered animation for each bar
        }
        return delay;
      },
    },
    transitions: {
      show: {
        animations: {
          x: {
            from: 0,
            duration: 800,
            easing: "easeOutQuad" as const,
          },
        },
      },
      hide: {
        animations: {
          x: {
            duration: 400,
            easing: "easeInQuad" as const,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#111827",
        bodyColor: "#4b5563",
        borderColor: "rgba(0, 0, 0, 0.08)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            return chartData[index].hub;
          },
          label: (context: any) => {
            const index = context.dataIndex;
            return [
              `Code: ${chartData[index].hubCode}`,
              `Congestion: ${context.parsed.x.toFixed(1)}%`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: Math.max(...values, 100),
        ticks: {
          color: "var(--muted-foreground)",
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return value + "%";
          },
        },
        grid: {
          color: "rgba(17, 24, 39, 0.08)",
          drawBorder: false,
        },
        title: {
          display: true,
          text: "Congestion (%)",
          color: "var(--muted-foreground)",
          font: {
            size: 12,
          },
        },
      },
      y: {
        ticks: {
          color: "var(--muted-foreground)",
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
          drawBorder: false,
        },
      },
    },
  };

  if (!isClient || !ChartComponent) {
    return (
      <div className="p-5">
        <div className="mb-4">
          <div className="daksh-text-label mb-1">Top Congested Hubs</div>
          <div className="daksh-text-secondary text-xs">
            Hub congestion analysis based on delay metrics and throughput
          </div>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center daksh-text-secondary">
            <div className="mb-2">Loading chart...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="mb-4">
        <div className="daksh-text-label mb-1">Top Congested Hubs</div>
        <div className="daksh-text-secondary text-xs">
          Hub congestion analysis based on delay metrics and throughput
        </div>
      </div>
      <div className="h-[400px] min-h-[400px]">
        <ChartComponent data={chartJsData} options={chartJsOptions} />
      </div>
    </div>
  );
}
