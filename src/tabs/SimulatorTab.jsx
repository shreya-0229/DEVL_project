import { useState } from "react";
import { motion } from "framer-motion";
import {
  SlidersHorizontal,
  RotateCcw,
  Gauge,
  Youtube,
  Radio,
} from "lucide-react";
import { useHealth } from "../store/HealthContext";
import { YT_NAMES } from "../youtube";

function Slider({ label, value, display, min, max, step, onChange, accent }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">{label}</p>
        <p className="text-lg font-extrabold tabular-nums text-slate-900">{display}</p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-3 w-full"
        style={{ accentColor: accent }}
        aria-label={label}
      />
      <div className="mt-1 flex justify-between text-[11px] font-semibold text-slate-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/** Smart router: stress slider position → YouTube category on Tab 5. */
const routeFor = (s) => (s > 70 ? "stress" : s >= 40 ? "motivation" : "morning");

const PRESETS = [
  {
    id: "flow",
    emoji: "🟢",
    name: "Flow State",
    stress: 20,
    hrv: 85,
    gsr: 2.0,
    co2: 500,
    yt: "morning",
    effect:
      "UI shifts to neon emerald/cyan · CRI updates to 80/100 · all focus tools unblocked",
    gradient: "from-emerald-500 to-cyan-500",
    ring: "ring-emerald-400",
  },
  {
    id: "exam",
    emoji: "🟡",
    name: "Exam Overwhelm",
    stress: 85,
    hrv: 22,
    gsr: 7.5,
    co2: 1100,
    yt: "stress",
    effect:
      "Rose/amber warning alerts · dense readings auto-convert to 2-min audio briefs · Tab 5 jumps to Immediate Stress Relief",
    gradient: "from-amber-500 to-rose-500",
    ring: "ring-amber-400",
  },
  {
    id: "burnout",
    emoji: "🔵",
    name: "Late Night Burnout",
    stress: 70,
    hrv: 35,
    gsr: 5.5,
    co2: 900,
    yt: "sleep",
    effect:
      "Recommends screen-free audio summaries · Tab 5 switches to the Before Sleeping category",
    gradient: "from-indigo-500 to-blue-600",
    ring: "ring-indigo-400",
  },
];

export default function SimulatorTab() {
  const {
    stressScore,
    setStressScore,
    hrv,
    setHrv,
    co2,
    setCo2,
    setGsr,
    criScore,
    zone,
    resetBiometrics,
    ytCategory,
    setYtCategory,
    convertDenseReadings,
  } = useHealth();
  const [activePreset, setActivePreset] = useState("");

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setStressScore(p.stress);
    setHrv(p.hrv);
    setGsr(p.gsr);
    setCo2(p.co2);
    setYtCategory(p.yt);
    if (p.id === "exam") convertDenseReadings();
  };

  const handleReset = () => {
    resetBiometrics();
    setYtCategory("morning");
    setActivePreset("");
  };

  const onStress = (v) => {
    setStressScore(v);
    setYtCategory(routeFor(v)); // router: slider drives Tab 5 in real time
    setActivePreset("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="glass-card p-6 md:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
          Live presentation control panel
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          Demo & Sensor Simulator
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm font-medium text-slate-500">
          Live Presentation Control Panel — Use these controls to demonstrate how
          EduHealth AI dynamically updates the UI in real time.
        </p>
      </div>

      {/* Preset switcher */}
      <div>
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-500">
          Biometric preset switcher
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PRESETS.map((p) => {
            const on = activePreset === p.id;
            return (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => applyPreset(p)}
                className={`rounded-3xl border bg-white/70 p-5 text-left backdrop-blur-xl transition-all ${
                  on ? `border-transparent shadow-xl ring-2 ${p.ring}` : "border-white/60 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-lg text-white shadow-md ${p.gradient}`}
                  >
                    {p.emoji}
                  </span>
                  <p className="text-base font-extrabold tracking-tight text-slate-900">
                    {p.name}
                  </p>
                </div>
                <div className="mt-3 flex gap-2 text-[11px] font-extrabold tabular-nums text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">Stress {p.stress}%</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">HRV {p.hrv}ms</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">CO₂ {p.co2}</span>
                </div>
                <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
                  {p.effect}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Smart YouTube recommendation router */}
      <div className="glass-card flex flex-wrap items-center gap-4 p-5 md:p-6">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25">
          <Youtube size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <Radio size={13} /> Smart YouTube recommendation router
          </p>
          <p className="mt-1 text-sm font-bold text-slate-700">
            Active YouTube Recommendation:{" "}
            <span className="rounded-full bg-rose-50 px-3 py-1 font-extrabold text-rose-700">
              {YT_NAMES[ytCategory]}
            </span>
          </p>
          <p className="mt-1 text-xs font-medium text-slate-400">
            Drag the Stress slider — Tab 5's category follows live: &gt;70% Stress Relief ·
            40–70% Motivation · &lt;40% Morning Energy.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-xs font-extrabold text-slate-600 transition-all hover:bg-white"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Slider
            label="Stress Index"
            value={stressScore}
            display={`${Math.round(stressScore)}%`}
            min={0}
            max={100}
            step={1}
            onChange={onStress}
            accent="#F43F5E"
          />
          <Slider
            label="Heart Rate Variability"
            value={hrv}
            display={`${Math.round(hrv)} ms`}
            min={20}
            max={100}
            step={1}
            onChange={(v) => {
              setHrv(v);
              setActivePreset("");
            }}
            accent="#10B981"
          />
          <Slider
            label="Ambient Room CO₂"
            value={co2}
            display={`${Math.round(co2)} ppm`}
            min={400}
            max={1500}
            step={10}
            onChange={(v) => {
              setCo2(v);
              setActivePreset("");
            }}
            accent="#06B6D4"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass-card p-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
              <Gauge size={24} />
            </div>
            <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">
              Live readout
            </p>
            <p className="mt-2 text-5xl font-black tracking-tight text-slate-900">{criScore}</p>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
              CRI / 100
            </p>
            <span
              className={`mt-4 inline-flex items-center rounded-full bg-gradient-to-r ${zone.gradient} px-4 py-1.5 text-sm font-bold text-white shadow-lg`}
            >
              {zone.label}
            </span>
            <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
              {zone.advice}
            </p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Zone thresholds
            </p>
            <ul className="mt-3 space-y-2 text-xs font-semibold text-slate-600">
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> 0–35% · Flow State
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> 36–65% · Moderate Tension
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> 66–100% · High Tension Alert
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
