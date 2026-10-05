import { useMemo, useState } from "react";
import { Sigma } from "lucide-react";
import {
  correlationSeries,
  pearson,
  corrStrength,
  CORR_PAIRS,
} from "./procData";

const W = 660;
const H = 320;
const ML = 46; // left margin
const MR = 16; // right margin
const MT = 14; // top margin
const MB = 42; // bottom margin

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

function ticks(min, max, count = 5) {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}

function fmt(v) {
  const a = Math.abs(v);
  if (a >= 100) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

export default function CorrelationLab() {
  const [pairId, setPairId] = useState(CORR_PAIRS[0].id);
  const pair = CORR_PAIRS.find((p) => p.id === pairId);

  const { points, r, line, xDomain, yDomain } = useMemo(() => {
    const series = correlationSeries();
    const xs = series.map((s) => s[pair.x]);
    const ys = series.map((s) => s[pair.y]);
    const rr = pearson(xs, ys);
    const { slope, intercept } = linreg(xs, ys);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const padX = (maxX - minX) * 0.08 || 1;
    const padY = (maxY - minY) * 0.12 || 1;
    return {
      points: series.map((s, i) => ({ x: s[pair.x], y: s[pair.y], day: i + 1 })),
      r: rr,
      line: [
        { x: minX, y: slope * minX + intercept },
        { x: maxX, y: slope * maxX + intercept },
      ],
      xDomain: [minX - padX, maxX + padX],
      yDomain: [minY - padY, maxY + padY],
    };
  }, [pair]);

  const strength = corrStrength(r);
  const dir = r >= 0 ? "positive" : "negative";

  const plotW = W - ML - MR;
  const plotH = H - MT - MB;
  const sx = (v) => ML + ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * plotW;
  const sy = (v) => MT + (1 - (v - yDomain[0]) / (yDomain[1] - yDomain[0])) * plotH;
  const xTicks = ticks(xDomain[0], xDomain[1]);
  const yTicks = ticks(yDomain[0], yDomain[1]);

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
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-[300px] w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`${pair.xLabel} versus ${pair.yLabel} scatter plot`}
          >
            {/* gridlines */}
            {yTicks.map((t) => (
              <g key={`y${t}`}>
                <line x1={ML} y1={sy(t)} x2={W - MR} y2={sy(t)} stroke="#E2E8F0" strokeDasharray="3 3" />
                <text x={ML - 8} y={sy(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="#64748B">
                  {fmt(t)}
                </text>
              </g>
            ))}
            {xTicks.map((t) => (
              <g key={`x${t}`}>
                <line x1={sx(t)} y1={MT} x2={sx(t)} y2={H - MB} stroke="#E2E8F0" strokeDasharray="3 3" />
                <text x={sx(t)} y={H - MB + 16} textAnchor="middle" fontSize={11} fill="#64748B">
                  {fmt(t)}
                </text>
              </g>
            ))}

            {/* axes */}
            <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke="#94A3B8" strokeWidth={1.5} />
            <line x1={ML} y1={H - MB} x2={W - MR} y2={H - MB} stroke="#94A3B8" strokeWidth={1.5} />
            <text x={(ML + W - MR) / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="#94A3B8" fontWeight={700}>
              {pair.xLabel}
            </text>

            {/* regression line */}
            <line
              x1={sx(line[0].x)}
              y1={sy(line[0].y)}
              x2={sx(line[1].x)}
              y2={sy(line[1].y)}
              stroke="#0F172A"
              strokeWidth={2}
              strokeDasharray="6 4"
            />

            {/* scatter points */}
            {points.map((p, i) => (
              <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={5.5} fill={pair.color} fillOpacity={0.75} stroke="#fff" strokeWidth={1.2}>
                <title>{`Day ${p.day}: ${pair.xLabel} ${fmt(p.x)}, ${pair.yLabel} ${fmt(p.y)}`}</title>
              </circle>
            ))}
          </svg>
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
