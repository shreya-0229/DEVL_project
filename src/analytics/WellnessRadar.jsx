import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useHealth } from "../store/HealthContext";

function RadarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-2xl border border-white/60 bg-white/90 px-4 py-2.5 shadow-xl backdrop-blur-xl">
      <p className="text-xs font-extrabold text-slate-900">
        {d.axis}: <span className="text-violet-600">{d.value}/100</span>
      </p>
    </div>
  );
}

export default function WellnessRadar() {
  const { hrv, co2, tasks } = useHealth();
  const done = tasks.filter((t) => t.done).length;

  const data = [
    { axis: "Sleep Quality", value: 78 },
    { axis: "Ergonomics", value: 72 },
    { axis: "HRV Stability", value: Math.round(Math.max(20, Math.min(100, hrv))) },
    { axis: "LMS Progress", value: Math.min(99, 35 + done * 16) },
    {
      axis: "Air Quality",
      value: Math.round(Math.max(10, Math.min(100, 100 - (co2 - 400) / 16))),
    },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fontSize: 11, fill: "#64748B", fontWeight: 700 }}
          />
          <Radar
            dataKey="value"
            stroke="#8B5CF6"
            fill="#8B5CF6"
            fillOpacity={0.35}
            strokeWidth={2.5}
          />
          <Tooltip content={<RadarTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
