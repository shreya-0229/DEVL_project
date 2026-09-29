import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const DATA = [
  { name: "Deep Study", value: 45, color: "#10B981" },
  { name: "Overwhelm", value: 15, color: "#F43F5E" },
  { name: "Recovery", value: 15, color: "#8B5CF6" },
  { name: "Rest / Sleep", value: 25, color: "#6366F1" },
];

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-2xl border border-white/60 bg-white/90 px-4 py-2.5 shadow-xl backdrop-blur-xl">
      <p className="text-xs font-extrabold" style={{ color: d.color }}>
        {d.name}: <span className="text-slate-900">{d.value}%</span>
      </p>
    </div>
  );
}

export default function TimeDonut() {
  return (
    <div>
      <div className="relative h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={DATA}
              dataKey="value"
              nameKey="name"
              innerRadius={68}
              outerRadius={102}
              paddingAngle={3}
              cornerRadius={6}
              strokeWidth={0}
            >
              {DATA.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-black tracking-tight text-slate-900">24h</p>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            distribution
          </p>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {DATA.map((d) => (
          <div key={d.name} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="text-[11px] font-bold text-slate-600">{d.name}</span>
            <span className="ml-auto text-[11px] font-extrabold text-slate-900">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
