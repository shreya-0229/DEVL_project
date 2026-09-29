import { Activity, TrendingUp, Brain, Bell } from "lucide-react";
import { useHealth } from "../store/HealthContext";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "HRV & stress trend charts",
    desc: "Continuous biometric timelines with anomaly flags.",
  },
  {
    icon: Brain,
    title: "Tension heatmap",
    desc: "See when stress peaks across your day and week.",
  },
  {
    icon: Bell,
    title: "Recovery correlation insights",
    desc: "Which habits actually move your CRI — quantified.",
  },
];

export default function AnalyticsTab() {
  const { stressScore, hrv, gsr, co2, criScore } = useHealth();

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-8 text-center md:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
          <Activity size={28} />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          Bio-Stress Analytics
        </h1>
        <span className="mt-3 inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-600">
          Arriving in Phase 2
        </span>
        <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-relaxed text-slate-500">
          Deep biometric intelligence is on the roadmap. Your live state engine is already
          streaming below.
        </p>
      </div>

      <div className="glass-card p-5 md:p-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">
          Live stream · now
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Stress", value: `${Math.round(stressScore)}%` },
            { label: "HRV", value: `${Math.round(hrv)} ms` },
            { label: "GSR", value: `${gsr.toFixed(1)} µS` },
            { label: "CRI", value: `${criScore}/100` },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-xl font-extrabold tabular-nums text-slate-900">{s.value}</p>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs font-semibold text-slate-400">
          CO2 {Math.round(co2)} ppm · Tune these live in the Demo Simulator
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass-card p-5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Icon size={20} />
            </div>
            <p className="mt-3 text-sm font-extrabold text-slate-900">{title}</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
