"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
