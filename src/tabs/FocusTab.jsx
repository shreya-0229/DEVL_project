import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Zap, Check, ArrowRight, Clock } from "lucide-react";
import { useHealth } from "../store/HealthContext";

const DURATION = 120; // 2-minute micro-commitment

function format(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function FocusTab() {
  const { focusTask, setActiveTab, zone } = useHealth();
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setSecondsLeft(DURATION);
    setRunning(false);
    setCompleted(false);
  }, [focusTask?.id]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setRunning(false);
          setCompleted(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const progress = 1 - secondsLeft / DURATION;
  const R = 110;
  const C = 2 * Math.PI * R;

  if (!focusTask) {
    return (
      <div className="glass-card mx-auto max-w-lg p-8 text-center md:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
          <Zap size={28} />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">
          No focus target yet
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Pick a task to start a 2-minute micro-commitment — just two minutes to break the
          inertia.
        </p>
        <button
          onClick={() => setActiveTab("tasks")}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.02]"
        >
          Choose a task <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="glass-card w-full max-w-2xl p-6 text-center md:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
          <Zap size={13} /> Micro-commitment
        </span>
        <h1 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
          {focusTask.title}
        </h1>
        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-500">
          <Clock size={14} /> {focusTask.course} · {focusTask.dueDate}
        </p>
        <p className={`mt-2 text-xs font-bold ${zone.text}`}>{zone.label}</p>
      </div>

      <div className="glass-card flex w-full max-w-2xl flex-col items-center p-8 md:p-10">
        {completed ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-white shadow-xl shadow-emerald-500/30">
              <Check size={36} strokeWidth={3} />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">
              Micro-commitment complete
            </h2>
            <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">
              Two minutes done. Momentum is yours — keep going or bank the win.
            </p>
            <button
              onClick={() => setActiveTab("overview")}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-extrabold text-white transition-transform hover:scale-[1.02]"
            >
              Back to overview <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="relative h-64 w-64">
              <svg viewBox="0 0 240 240" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="120" cy="120" r={R} fill="none" stroke="#E2E8F0" strokeWidth="12" />
                <circle
                  cx="120"
                  cy="120"
                  r={R}
                  fill="none"
                  stroke="url(#focusGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C - C * progress}
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-6xl font-black tabular-nums tracking-tight text-slate-900">
                  {format(secondsLeft)}
                </p>
                <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  remaining
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => setRunning((r) => !r)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.03] active:scale-[0.97]"
              >
                {running ? <Pause size={18} /> : <Play size={18} />}
                {running ? "Pause" : secondsLeft < DURATION ? "Resume" : "Start"}
              </button>
              <button
                onClick={() => {
                  setRunning(false);
                  setSecondsLeft(DURATION);
                }}
                aria-label="Reset timer"
                className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white/70 text-slate-500 transition-all hover:bg-white hover:text-slate-900"
              >
                <RotateCcw size={18} />
              </button>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-400">
              Just start. Two minutes is enough to beat resistance.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
