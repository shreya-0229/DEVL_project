import { useState } from "react";
import { SlidersHorizontal, RotateCcw, Gauge } from "lucide-react";
import { useHealth } from "../store/HealthContext";

function Slider({ label, value, display, min, max, step, onChange }) {
  return (
    <div className="glass-card p-5">
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
        className="mt-3"
        aria-label={label}
      />
      <div className="mt-1 flex justify-between text-[11px] font-semibold text-slate-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

const PRESETS = [
  { name: "Deep Flow", stress: 18, hrv: 92, gsr: 1.8, co2: 620 },
  { name: "Balanced", stress: 38, hrv: 65, gsr: 3.2, co2: 780 },
  { name: "Exam Crunch", stress: 74, hrv: 41, gsr: 6.4, co2: 1150 },
];

export default function SimulatorTab() {
  const {
    stressScore,
    setStressScore,
    hrv,
    setHrv,
    gsr,
    setGsr,
    co2,
    setCo2,
    criScore,
    zone,
    resetBiometrics,
  } = useHealth();
  const [activePreset, setActivePreset] = useState("Balanced");

  const applyPreset = (p) => {
    setActivePreset(p.name);
    setStressScore(p.stress);
    setHrv(p.hrv);
    setGsr(p.gsr);
    setCo2(p.co2);
  };

  const handleReset = () => {
    resetBiometrics();
    setActivePreset("Balanced");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-6 md:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
          <SlidersHorizontal size={13} /> Live state engine
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          Demo Simulator
        </h1>
        <p className="mt-1.5 max-w-xl text-sm font-medium text-slate-500">
          Drag the sliders to simulate biometric states. Every screen — the CRI sphere,
          metric cards, and zone tags — reacts in real time.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
                  activePreset === p.name
                    ? "bg-slate-900 text-white shadow-md"
                    : "border border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
                }`}
              >
                {p.name}
              </button>
            ))}
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-extrabold text-slate-600 transition-all hover:bg-white"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>

          <Slider
            label="Stress Score"
            value={stressScore}
            display={`${Math.round(stressScore)}%`}
            min={0}
            max={100}
            step={1}
            onChange={(v) => {
              setStressScore(v);
              setActivePreset("");
            }}
          />
          <Slider
            label="HRV"
            value={hrv}
            display={`${Math.round(hrv)} ms`}
            min={30}
            max={120}
            step={1}
            onChange={(v) => {
              setHrv(v);
              setActivePreset("");
            }}
          />
          <Slider
            label="GSR / Sweat"
            value={gsr}
            display={`${gsr.toFixed(1)} µS`}
            min={0.5}
            max={10}
            step={0.1}
            onChange={(v) => {
              setGsr(v);
              setActivePreset("");
            }}
          />
          <Slider
            label="Ambient CO2"
            value={co2}
            display={`${Math.round(co2)} ppm`}
            min={400}
            max={2000}
            step={10}
            onChange={(v) => {
              setCo2(v);
              setActivePreset("");
            }}
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
            <ul className="mt-3 space-y-2 text-xs font-semibold">
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
