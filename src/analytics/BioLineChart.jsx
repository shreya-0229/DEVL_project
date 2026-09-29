import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { dailySeries } from "./bioData";

function GlassTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="text-xs font-extrabold text-slate-900">{label}</p>
      {payload.map((p) => (
        <p
          key={String(p.dataKey)}
          className="mt-1 text-xs font-semibold"
          style={{ color: p.color }}
        >
          {p.name}:{" "}
          <span className="font-extrabold text-slate-900">
            {p.value}
            {p.dataKey === "hrv" ? " ms" : "%"}
          </span>
        </p>
      ))}
    </div>
  );
}

const LEGEND = [
  ["#F43F5E", "Stress Spikes"],
  ["#10B981", "HRV Recovery"],
  ["#06B6D4", "Focus Quality"],
];

export default function BioLineChart() {
  const data = useMemo(dailySeries, []);

  return (
    <div>
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="gStress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gHrv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gFocus" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              interval={3}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              tickLine={false}
              axisLine={false}
              domain={[20, 100]}
            />
            <Tooltip content={<GlassTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="stress"
              name="Stress"
              stroke="#F43F5E"
              strokeWidth={2.5}
              fill="url(#gStress)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="hrv"
              name="HRV"
              stroke="#10B981"
              strokeWidth={2.5}
              fill="url(#gHrv)"
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="focus"
              name="Focus"
              stroke="#06B6D4"
              strokeWidth={2.5}
              fill="url(#gFocus)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex flex-wrap justify-center gap-4">
        {LEGEND.map(([c, l]) => (
          <span
            key={l}
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
