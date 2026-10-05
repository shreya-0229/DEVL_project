import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ComposedChart,
} from "recharts";
import { Sigma } from "lucide-react";
import {
  correlationSeries,
  pearson,
  corrStrength,
  CORR_PAIRS,
} from "./procData";

function linreg(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0,
    den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den ? num / den : 0;
  return { slope, intercept: my - slope * mx };
}

export default function CorrelationLab() {
  const [pairId, setPairId] = useState(CORR_PAIRS[0].id);
  const pair = CORR_PAIRS.find((p) => p.id === pairId);

  const { points, r, line } = useMemo(() => {
    const series = correlationSeries();
    const xs = series.map((s) => s[pair.x]);
    const ys = series.map((s) => s[pair.y]);
    const rr = pearson(xs, ys);
    const { slope, intercept } = linreg(xs, ys);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    return {
      points: series.map((s, i) => ({ x: s[pair.x], y: s[pair.y], day: i + 1 })),
      r: rr,
      line: [
        { x: minX, y: slope * minX + intercept },
        { x: maxX, y: slope * maxX + intercept },
      ],
    };
  }, [pair]);

  const strength = corrStrength(r);
  const dir = r >= 0 ? "positive" : "negative";

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {CORR_PAIRS.map((p) => {
          const on = p.id === pairId;
          return (
            <button
              key={p.id}
              onClick={() => setPairId(p.id)}
              className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
                on
                  ? "text-white shadow-md"
                  : "border border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
              }`}
              style={on ? { background: p.color } : undefined}
            >
              {p.xLabel} → {p.yLabel}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart margin={{ top: 8, right: 12, bottom: 8, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="x"
                type="number"
                name={pair.xLabel}
                tick={{ fontSize: 11, fill: "#64748B" }}
                label={{ value: pair.xLabel, position: "bottom", fontSize: 11, fill: "#94A3B8" }}
              />
              <YAxis
                dataKey="y"
                type="number"
                name={pair.yLabel}
                tick={{ fontSize: 11, fill: "#64748B" }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid #E2E8F0",
                  fontSize: 12,
                  fontWeight: 600,
                }}
                formatter={(v, name) => [v, name === "y" ? pair.yLabel : pair.xLabel]}
                labelFormatter={(_, p) => `Day ${p?.[0]?.payload?.day ?? ""}`}
              />
              <Scatter data={points} fill={pair.color} fillOpacity={0.75} />
              <Line
                data={line}
                dataKey="y"
                stroke="#0F172A"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col justify-center rounded-2xl bg-slate-50 p-5">
          <span
            className="grid h-10 w-10 place-items-center rounded-xl text-white shadow-md"
            style={{ background: pair.color }}
          >
            <Sigma size={18} />
          </span>
          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Pearson r · 30 days
          </p>
          <p className="text-4xl font-black tabular-nums tracking-tight text-slate-900">
            {r >= 0 ? "+" : ""}
            {r.toFixed(2)}
          </p>
          <p className="mt-1 text-xs font-extrabold" style={{ color: pair.color }}>
            {strength} {dir} correlation
          </p>
          <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
            {pair.insight}
          </p>
        </div>
      </div>
    </div>
  );
}
