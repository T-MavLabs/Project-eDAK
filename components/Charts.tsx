"use client";

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
    <div className="p-5">
      <div className="mb-4">
        <div className="daksh-text-label mb-1">Delay by Hub</div>
        <div className="daksh-text-secondary text-xs">Average delay hours per hub</div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hub" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(198,0,0,0.06)" }}
              contentStyle={{ borderRadius: 10, borderColor: "rgba(0,0,0,0.08)" }}
            />
            <Bar dataKey="avgDelay" name="Avg delay (hrs)" fill="#C60000" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DelayVsWeatherLineChart({
  data,
}: {
  data: WeatherDelayMetric[];
}) {
  return (
    <div className="p-5">
      <div className="mb-4">
        <div className="daksh-text-label mb-1">Delay vs Weather</div>
        <div className="daksh-text-secondary text-xs">Correlation analysis</div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 10, borderColor: "rgba(0,0,0,0.08)" }}
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
      </div>
    </div>
  );
}

export function RegionalHeatmap({ data }: { data: RegionalHeatCell[] }) {
  return (
    <div className="p-5">
      <div className="mb-4">
        <div className="daksh-text-label mb-1">Regional Delay Heatmap</div>
        <div className="daksh-text-secondary text-xs">Simplified view</div>
      </div>
      <div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data.map((cell) => (
            <div
              key={cell.region}
              className="flex items-center justify-between daksh-layered rounded-lg p-3 daksh-interactive daksh-hover-lift mb-2"
            >
              <div>
                <div className="daksh-text-secondary font-semibold mb-0.5">{cell.region}</div>
                <div className="daksh-text-meta">Delay index (0–100)</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="daksh-text-data text-base tabular-nums">{cell.delayIndex}</div>
                <div
                  className="h-3 w-20 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${heatColor(cell.delayIndex)} 0%, rgba(0,0,0,0.06) 100%)`,
                  }}
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 daksh-text-meta">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#138808" }} />
            Lower risk
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#9CA3AF" }} />
            Moderate
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#FF9933" }} />
            Elevated
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#C60000" }} />
            High
          </span>
        </div>
      </div>
    </div>
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
 * UX4G-compliant with accessibility and legend
 */
export function ModeComparisonChart({
  data,
}: {
  data: ModeComparisonData[];
}) {
  const chartData = data.map((d) => ({
    name: d.mode,
    value: d.efficiencyScore * 100, // Convert to percentage
    avgTransitDays: d.avgTransitDays,
    totalShipments: d.totalShipments,
    delayRate: d.delayRate,
  }));

  const COLORS = data.map((d) => MODE_COLORS[d.mode]);

  const highestDelayMode = data.reduce((prev, current) => 
    current.delayRate > prev.delayRate ? current : prev
  );

  // Generate accessible description for screen readers
  const chartDescription = `Efficiency overview comparing delivery modes. ` +
    chartData.map((d) => 
      `${d.name} mode has ${d.value.toFixed(0)}% efficiency score, ${d.avgTransitDays.toFixed(1)} days average transit, and ${d.delayRate.toFixed(1)}% delay rate.`
    ).join(" ");

  return (
    <div className="p-5">
      {/* Screen reader description */}
      <div className="sr-only" role="region" aria-label="Efficiency Overview Chart">
        {chartDescription}
      </div>

      <div className="mb-4">
        <div 
          className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-1"
          style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
        >
          Delivery Mode Comparison
        </div>
        <div 
          className="text-xs text-neutral-600"
          style={{ fontSize: "var(--ux4g-text-xs, 0.75rem)" }}
        >
          Efficiency score comparison across delivery modes to identify optimization opportunities.
        </div>
      </div>
      
      <div className="h-72" role="img" aria-label="Delivery Mode Efficiency Comparison Chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value.toFixed(0)}%`}
              outerRadius={80}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              aria-label="Delivery mode efficiency scores"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index]}
                  aria-label={`${entry.name}: ${entry.value.toFixed(0)}% efficiency`}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div 
                      className="rounded-lg border border-neutral-200 bg-white p-3 shadow-lg"
                      role="tooltip"
                      aria-label={`Mode details: ${data.name}`}
                    >
                      <div className="font-semibold text-neutral-900 mb-1">{data.name}</div>
                      <div className="text-sm text-neutral-600">
                        Efficiency: {data.value.toFixed(1)}%
                      </div>
                      <div className="text-sm text-neutral-600">
                        Avg Transit: {data.avgTransitDays.toFixed(1)} days
                      </div>
                      <div className="text-sm text-neutral-600">
                        Delay Rate: {data.delayRate.toFixed(1)}%
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              contentStyle={{
                borderRadius: "0.5rem",
                borderColor: "#E5E7EB",
                backgroundColor: "#FFFFFF",
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Efficiency Gap Explanation Panel */}
      <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
        <div 
          className="text-sm font-semibold text-neutral-700 mb-1"
          style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
        >
          Efficiency Gap Analysis
        </div>
        <div 
          className="text-xs text-neutral-600 leading-relaxed"
          style={{ fontSize: "var(--ux4g-text-xs, 0.75rem)" }}
        >
          <strong>{highestDelayMode.mode}</strong> mode shows the highest delay rate (
          {highestDelayMode.delayRate.toFixed(1)}%), indicating potential bottlenecks in surface
          logistics or route optimization needs.
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
 * Top Congested Hubs Horizontal Bar Chart
 * UX4G-compliant with accessibility features
 */
export function CongestedHubsChart({
  data,
}: {
  data: CongestedHubData[];
}) {
  const chartData = [...data]
    .sort((a, b) => b.congestionScore - a.congestionScore)
    .map((d) => ({
      hub: d.hub,
      hubCode: d.hubCode,
      congestionScore: d.congestionScore,
      avgDelayHours: d.avgDelayHours,
      delayedCount: d.delayedCount,
      region: d.region,
    }));

  // UX4G gradient colors: red to orange (tokenized)
  const getBarColor = (score: number) => {
    if (score >= 7) return "#E74C3C"; // Primary red
    if (score >= 5) return "#EC7063"; // Primary light
    return "#FF9933"; // Warning/Saffron
  };

  // Generate accessible description for screen readers
  const chartDescription = `Bottleneck analysis showing top ${chartData.length} congested hubs. ` +
    chartData.map((d, idx) => 
      `${idx + 1}. ${d.hub} (${d.hubCode}) has congestion score ${d.congestionScore.toFixed(1)} out of 10.`
    ).join(" ");

  return (
    <div className="p-5">
      {/* Screen reader description */}
      <div className="sr-only" role="region" aria-label="Bottleneck Analysis Chart">
        {chartDescription}
      </div>
      
      <div className="mb-4">
        <div 
          className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-1"
          style={{ fontSize: "var(--ux4g-text-sm, 0.875rem)" }}
        >
          Top Congested Hubs
        </div>
        <div 
          className="text-xs text-neutral-600"
          style={{ fontSize: "var(--ux4g-text-xs, 0.75rem)" }}
        >
          Hub congestion analysis based on delay metrics and throughput. Higher scores indicate critical capacity constraints.
        </div>
      </div>
      
      <div className="h-[400px]" role="img" aria-label="Bottleneck Analysis Bar Chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 120, right: 20, top: 10, bottom: 10 }}
            aria-label="Bottleneck Analysis Chart"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
            <XAxis
              type="number"
              domain={[0, 10]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              label={{ 
                value: "Congestion Score", 
                position: "insideBottom", 
                offset: -5,
                fill: "#374151",
                style: { fontSize: "12px", fontWeight: 500 }
              }}
            />
            <YAxis
              type="category"
              dataKey="hubCode"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6B7280", fontSize: 11 }}
              width={110}
            />
            <Tooltip
              cursor={{ fill: "rgba(231, 76, 60, 0.1)" }}
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div 
                      className="rounded-lg border border-neutral-200 bg-white p-3 shadow-lg"
                      role="tooltip"
                      aria-label={`Hub details: ${data.hub}`}
                    >
                      <div className="font-semibold text-neutral-900 mb-1">{data.hub}</div>
                      <div className="text-sm text-neutral-600">
                        Code: <span className="font-mono">{data.hubCode}</span>
                      </div>
                      <div className="text-sm text-neutral-600">
                        Region: {data.region}
                      </div>
                      <div className="mt-2 text-sm font-medium text-neutral-900">
                        Congestion: {data.congestionScore.toFixed(1)}/10
                      </div>
                      <div className="text-sm text-neutral-600">
                        Avg Delay: {data.avgDelayHours.toFixed(1)} hrs
                      </div>
                      <div className="text-sm text-neutral-600">
                        Delayed: {data.delayedCount.toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              contentStyle={{
                borderRadius: "0.5rem",
                borderColor: "#E5E7EB",
                backgroundColor: "#FFFFFF",
              }}
            />
            <Bar
              dataKey="congestionScore"
              name="Congestion Score"
              radius={[0, 6, 6, 0]}
              aria-label="Congestion score per hub"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.congestionScore)}
                  aria-label={`${entry.hubCode}: ${entry.congestionScore.toFixed(1)}`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible legend with patterns for color-blind users */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-600">
        <span className="inline-flex items-center gap-2">
          <span 
            className="h-3 w-12 rounded-sm" 
            style={{ background: "#E74C3C" }}
            aria-label="High congestion (score 7-10)"
          />
          High (7-10)
        </span>
        <span className="inline-flex items-center gap-2">
          <span 
            className="h-3 w-12 rounded-sm" 
            style={{ background: "#EC7063" }}
            aria-label="Moderate congestion (score 5-7)"
          />
          Moderate (5-7)
        </span>
        <span className="inline-flex items-center gap-2">
          <span 
            className="h-3 w-12 rounded-sm" 
            style={{ background: "#FF9933" }}
            aria-label="Low congestion (score below 5)"
          />
          Low (&lt;5)
        </span>
      </div>
    </div>
  );
}
