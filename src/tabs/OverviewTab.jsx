import {
  Activity,
  Droplets,
  Gauge,
  Wind,
  Flame,
  Zap,
  Clock,
  ArrowRight,
  Headphones,
  Sparkles,
  Timer,
} from "lucide-react";
import { useHealth } from "../store/HealthContext";
import MetricCard from "../components/MetricCard";

const AVATARS = [
  { initials: "JK", bg: "from-indigo-500 to-purple-500" },
  { initials: "MT", bg: "from-cyan-500 to-blue-500" },
  { initials: "AS", bg: "from-emerald-500 to-teal-500" },
  { initials: "RP", bg: "from-amber-500 to-orange-500" },
];

function CriSphere() {
  const { criScore, zone } = useHealth();
  const R = 84;
  const C = 2 * Math.PI * R;

  return (
    <div className="relative h-60 w-60 shrink-0 sm:h-64 sm:w-64">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="100" cy="100" r={R} fill="none" stroke="#E2E8F0" strokeWidth="10" />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke={zone.ring}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - (C * criScore) / 100}
          className="transition-all duration-700 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${zone.glow})` }}
        />
      </svg>
      <div
        className="absolute inset-6 rounded-full transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.12) 38%, rgba(255,255,255,0) 60%), radial-gradient(circle at 50% 58%, ${zone.sphere[0]} 0%, ${zone.sphere[1]} 82%)`,
          boxShadow: `0 0 70px ${zone.glow}, inset -20px -26px 55px rgba(255,255,255,0.35), inset 16px 20px 45px rgba(255,255,255,0.45)`,
        }}
      >
        <div className="flex h-full flex-col items-center justify-center">
          <p className="text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
            {criScore}
          </p>
          <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.2em] text-white/90">
            CRI / 100
          </p>
        </div>
      </div>
    </div>
  );
}

function PeerTicker() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/25">
          <Flame size={22} />
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-900">Peer Accountability</p>
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            LIVE
          </p>
        </div>
      </div>
      <p className="mt-4 text-4xl font-black tracking-tight text-slate-900">42</p>
      <p className="mt-1 text-sm font-medium text-slate-500">
        students in your cohort are studying right now.
      </p>
      <div className="mt-4 flex items-center">
        {AVATARS.map((a) => (
          <div
            key={a.initials}
            className={`-ml-2 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${a.bg} text-[10px] font-extrabold text-white ring-2 ring-white first:ml-0`}
          >
            {a.initials}
          </div>
        ))}
        <div className="-ml-2 grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-[10px] font-extrabold text-white ring-2 ring-white">
          +38
        </div>
      </div>
    </div>
  );
}

export default function OverviewTab() {
  const {
    criScore,
    zone,
    stressScore,
    hrv,
    gsr,
    co2,
    priorityTasks,
    startFocus,
    setActiveTab,
  } = useHealth();

  const top = priorityTasks.find((t) => !t.done) ?? priorityTasks[0];

  const stressAccent =
    zone.id === "acute"
      ? { tile: "bg-rose-50", icon: "text-rose-500", text: "text-rose-600" }
      : zone.id === "moderate"
        ? { tile: "bg-amber-50", icon: "text-amber-500", text: "text-amber-600" }
        : { tile: "bg-emerald-50", icon: "text-emerald-500", text: "text-emerald-600" };

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <div className="glass-card p-6 md:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
          <Sparkles size={13} /> Daily brief
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          Welcome back, Alex.
        </h1>
        <p className="mt-1.5 max-w-xl text-sm font-medium leading-relaxed text-slate-500 md:text-base">
          Biological recovery is high — great time for deep focus.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: CRI + metrics + hero */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* CRI sphere card */}
          <div className="glass-card flex flex-col items-center gap-8 p-6 sm:flex-row md:p-8">
            <CriSphere />
            <div className="w-full text-center sm:text-left">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">
                Cognitive Readiness Index
              </p>
              <span
                className={`mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${zone.gradient} px-4 py-1.5 text-sm font-bold text-white shadow-lg`}
              >
                {zone.label}
              </span>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
                {zone.advice}
              </p>
              <div className="mt-5 space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-500">Focus capacity</span>
                  <span className={`font-extrabold ${zone.text}`}>{criScore}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${zone.gradient} transition-all duration-700`}
                    style={{ width: `${criScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-500">Stress load</span>
                  <span className={`font-extrabold ${zone.text}`}>{Math.round(stressScore)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${zone.gradient} transition-all duration-700`}
                    style={{ width: `${stressScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              icon={Activity}
              label="HRV"
              value={Math.round(hrv)}
              unit="ms"
              sub="Parasympathetic tone strong"
              accent={{ tile: "bg-emerald-50", icon: "text-emerald-500", text: "text-emerald-600" }}
            />
            <MetricCard
              icon={Droplets}
              label="GSR / Sweat"
              value={gsr.toFixed(1)}
              unit="µS"
              sub="Arousal within normal band"
              accent={{ tile: "bg-cyan-50", icon: "text-cyan-500", text: "text-cyan-600" }}
            />
            <MetricCard
              icon={Gauge}
              label="Stress Score"
              value={Math.round(stressScore)}
              unit="%"
              sub={zone.label}
              accent={stressAccent}
            />
            <MetricCard
              icon={Wind}
              label="Ambient CO2"
              value={Math.round(co2)}
              unit="ppm"
              sub="Air quality optimal"
              accent={{ tile: "bg-violet-50", icon: "text-violet-500", text: "text-violet-600" }}
            />
          </div>

          {/* DO THIS FIRST hero */}
          {top && (
            <div className="rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 p-[2px] shadow-xl shadow-indigo-500/10">
              <div className="rounded-[calc(1.5rem-2px)] bg-white/85 p-6 backdrop-blur-xl md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-600">
                    Do this first
                  </p>
                  <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-700">
                    {top.course}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
                  {top.title}
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={16} /> {top.dueDate}
                  </span>
                  <span>{top.format}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                    <Timer size={14} /> {top.userTimeMins} mins allocated
                  </span>
                  {top.isAudioConverted && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                      <Headphones size={14} /> Audio ready
                    </span>
                  )}
                </div>
                <button
                  onClick={() => startFocus(top.id)}
                  className="group relative mt-5 inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="animate-soft-ping absolute inset-0 rounded-2xl bg-indigo-500/40" aria-hidden="true" />
                  <Zap size={18} className="relative" />
                  <span className="relative">Start 2-Minute Micro-Commitment</span>
                  <ArrowRight size={16} className="relative transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-6">
          <PeerTicker />
          <div className="glass-card bg-gradient-to-br from-violet-500/10 to-pink-500/10 p-5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-pink-500/25">
              <Wind size={22} />
            </div>
            <p className="mt-3 text-sm font-extrabold text-slate-900">60-second reset</p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
              Box breathing: in 4s · hold 4s · out 4s · repeat 4x.
            </p>
            <button
              onClick={() => setActiveTab("recovery")}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2.5 text-xs font-extrabold text-violet-700 shadow-sm transition-all hover:bg-white hover:shadow-md"
            >
              Open Recovery Hub <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
