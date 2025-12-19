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

  return (
    <div className="p-5">
      <div className="mb-4">
        <div className="daksh-text-label mb-1">Delivery Mode Comparison</div>
        <div className="daksh-text-secondary text-xs">
          Efficiency score comparison across delivery modes
        </div>
      </div>
      <div className="h-72">
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
                        Efficiency: {data.value.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg Transit: {data.avgTransitDays.toFixed(1)} days
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Delay Rate: {data.delayRate.toFixed(1)}%
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
          Efficiency Gap Analysis
        </div>
        <div className="text-xs daksh-text-meta leading-relaxed">
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

  // Gradient colors from red to orange
  const getBarColor = (score: number) => {
    if (score >= 7) return "#C60000"; // India Post Red
    if (score >= 5) return "#E74C3C"; // Lighter red
    return "#FF9933"; // Saffron
  };

  return (
    <div className="p-5">
      <div className="mb-4">
        <div className="daksh-text-label mb-1">Top Congested Hubs</div>
        <div className="daksh-text-secondary text-xs">
          Hub congestion analysis based on delay metrics and throughput
        </div>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 120, right: 20, top: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              domain={[0, 10]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              label={{ value: "Congestion Score", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              type="category"
              dataKey="hubCode"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              width={110}
            />
            <Tooltip
              cursor={{ fill: "rgba(198,0,0,0.06)" }}
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md">
                      <div className="font-semibold">{data.hub}</div>
                      <div className="text-sm text-muted-foreground">
                        Code: {data.hubCode}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Region: {data.region}
                      </div>
                      <div className="mt-2 text-sm font-medium">
                        Congestion: {data.congestionScore.toFixed(1)}/10
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg Delay: {data.avgDelayHours.toFixed(1)} hrs
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Delayed: {data.delayedCount.toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              contentStyle={{
                borderRadius: 10,
                borderColor: "rgba(0,0,0,0.08)",
                backgroundColor: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(8px)",
              }}
            />
            <Bar
              dataKey="congestionScore"
              name="Congestion Score"
              radius={[0, 6, 6, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.congestionScore)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
