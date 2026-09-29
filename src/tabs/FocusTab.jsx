import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Check,
  ArrowRight,
  Clock,
  CloudRain,
  AudioWaveform,
  X,
  Wind,
  ShieldCheck,
} from "lucide-react";
import { useHealth } from "../store/HealthContext";

const GATEWAY = 120; // 2-minute micro-commitment
const LOCKOUT = 25 * 60; // 25-minute deep focus

function format(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Generated ambient soundscapes (Web Audio) — no audio assets needed. */
function useAmbient() {
  const ctxRef = useRef(null);
  const nodeRef = useRef(null);
  const [active, setActive] = useState(null); // 'rain' | 'brown' | null

  const stop = () => {
    const n = nodeRef.current;
    const ctx = ctxRef.current;
    if (n && ctx) {
      try {
        n.gain.gain.cancelScheduledValues(ctx.currentTime);
        n.gain.gain.setValueAtTime(n.gain.gain.value, ctx.currentTime);
        n.gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        setTimeout(() => {
          try {
            n.source.stop();
          } catch {
            /* already stopped */
          }
        }, 600);
      } catch {
        /* noop */
      }
    }
    nodeRef.current = null;
    setActive(null);
  };

  const play = (kind) => {
    if (active === kind) {
      stop();
      return;
    }
    stop();
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctxRef.current) ctxRef.current = new AC();
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const len = 4 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    if (kind === "rain") {
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    } else {
      // brown noise: integrated random walk
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    if (kind === "rain") {
      filter.type = "highpass";
      filter.frequency.value = 1400;
    } else {
      filter.type = "lowpass";
      filter.frequency.value = 420;
    }
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(kind === "rain" ? 0.1 : 0.22, ctx.currentTime + 1);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    nodeRef.current = { source, gain };
    setActive(kind);
  };

  useEffect(() => () => stop(), []);
  return { active, play, stop };
}

function AmbientToggles({ ambient, compact = false }) {
  const opts = [
    { id: "rain", label: "Rain", icon: CloudRain },
    { id: "brown", label: "Brown Noise", icon: AudioWaveform },
  ];
  return (
    <div className={`flex items-center justify-center gap-2 ${compact ? "mt-4" : "mt-6"}`}>
      <span className="mr-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
        Ambience
      </span>
      {opts.map(({ id, label, icon: Icon }) => {
        const on = ambient.active === id;
        return (
          <button
            key={id}
            onClick={() => ambient.play(id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
              on
                ? "bg-slate-900 text-white shadow-md"
                : "border border-slate-200 bg-white/70 text-slate-500 hover:border-indigo-300 hover:text-indigo-700"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function TimerRing({ secondsLeft, total, gradId, size = 264 }) {
  const progress = 1 - secondsLeft / total;
  const R = 110;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 240 240" className="absolute inset-0 h-full w-full -rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle cx="120" cy="120" r={R} fill="none" stroke="#E2E8F0" strokeWidth="12" />
        <circle
          cx="120"
          cy="120"
          r={R}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - C * progress}
          className="transition-all duration-1000 ease-linear"
        />
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
  );
}

export default function FocusTab() {
  const {
    focusTask,
    setActiveTab,
    focusLockout,
    setFocusLockout,
    stressScore,
    toggleTask,
    zone,
  } = useHealth();

  const [stage, setStage] = useState("gateway"); // gateway | lockout | done
  const [gatewayLeft, setGatewayLeft] = useState(GATEWAY);
  const [gatewayRunning, setGatewayRunning] = useState(false);
  const [lockoutLeft, setLockoutLeft] = useState(LOCKOUT);
  const [lockoutDone, setLockoutDone] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const ambient = useAmbient();

  // Reset when the focus target changes
  useEffect(() => {
    setStage("gateway");
    setGatewayLeft(GATEWAY);
    setGatewayRunning(false);
    setLockoutLeft(LOCKOUT);
    setLockoutDone(false);
    setBannerDismissed(false);
    setFocusLockout(false);
    ambient.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusTask?.id]);

  // Gateway countdown (tick only; transition handled below)
  useEffect(() => {
    if (!gatewayRunning) return;
    const t = setInterval(() => setGatewayLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [gatewayRunning]);

  // Gateway → Deep Focus Lockout transition
  useEffect(() => {
    if (gatewayRunning && gatewayLeft === 0) {
      setGatewayRunning(false);
      setStage("lockout");
      setLockoutLeft(LOCKOUT);
      setFocusLockout(true);
    }
  }, [gatewayLeft, gatewayRunning, setFocusLockout]);

  // Lockout countdown
  useEffect(() => {
    if (stage !== "lockout" || lockoutDone) return;
    const t = setInterval(() => setLockoutLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [stage, lockoutDone]);

  // Lockout completion
  useEffect(() => {
    if (stage === "lockout" && lockoutLeft === 0 && !lockoutDone) {
      setLockoutDone(true);
      setFocusLockout(false);
      ambient.stop();
      setStage("done");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockoutLeft, stage, lockoutDone]);

  // Re-engage lockout chrome if returning to the tab mid-session
  useEffect(() => {
    if (stage === "lockout" && !lockoutDone && !focusLockout) setFocusLockout(true);
  }, [stage, lockoutDone, focusLockout, setFocusLockout]);

  const endSession = () => {
    setFocusLockout(false);
    ambient.stop();
    setStage("done");
  };

  const takeBreathingPause = () => {
    setFocusLockout(false);
    ambient.stop();
    setActiveTab("recovery");
  };

  const showBanner = stage === "lockout" && stressScore > 70 && !bannerDismissed;

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

  /* ---------- STAGE 2: DEEP FOCUS LOCKOUT ---------- */
  if (stage === "lockout") {
    return (
      <div className="flex flex-col items-center">
        <div className="glass-card flex w-full flex-col items-center p-8 md:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Deep Focus State
          </span>
          <h1 className="mt-4 max-w-md text-center text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
            {focusTask.title}
          </h1>
          <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-500">
            <Clock size={14} /> {focusTask.course} · {focusTask.dueDate}
          </p>

          <div className="mt-8">
            <TimerRing secondsLeft={lockoutLeft} total={LOCKOUT} gradId="lockoutGrad" size={288} />
          </div>

          <AmbientToggles ambient={ambient} compact />

          <button
            onClick={endSession}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-6 py-3 text-sm font-extrabold text-slate-500 transition-all hover:bg-white hover:text-rose-600"
          >
            <X size={16} /> End session
          </button>
          <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <ShieldCheck size={13} /> Sidebar & header hidden — zero distractions
          </p>
        </div>

        {showBanner && (
          <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 animate-fade-slide rounded-3xl border border-rose-200 bg-white/90 p-5 shadow-2xl shadow-rose-500/20 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white">
                <Wind size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-900">
                  High physiological stress detected ({Math.round(stressScore)}%)
                </p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Take a 60-second breathing pause?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={takeBreathingPause}
                    className="rounded-xl bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-rose-500/30 transition-transform hover:scale-[1.03]"
                  >
                    Take breathing pause
                  </button>
                  <button
                    onClick={() => setBannerDismissed(true)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-500 transition-all hover:bg-slate-50"
                  >
                    Keep focusing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------- DONE ---------- */
  if (stage === "done") {
    const focusedSecs = lockoutDone ? LOCKOUT : LOCKOUT - lockoutLeft;
    return (
      <div className="glass-card mx-auto w-full max-w-2xl p-8 text-center md:p-12">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-white shadow-xl shadow-emerald-500/30">
          <Check size={36} strokeWidth={3} />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          {lockoutDone ? "Deep focus complete" : "Session banked"}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-slate-500">
          {lockoutDone
            ? `25 unbroken minutes on “${focusTask.title}”. That's a real rep.`
            : `You banked ${format(focusedSecs)} of deep focus on “${focusTask.title}”.`}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {!focusTask.done && (
            <button
              onClick={() => toggleTask(focusTask.id)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-[1.02]"
            >
              <Check size={16} strokeWidth={3} /> Mark task complete
            </button>
          )}
          <button
            onClick={() => setActiveTab("overview")}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-extrabold text-white transition-transform hover:scale-[1.02]"
          >
            Back to overview <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  /* ---------- STAGE 1: 2-MINUTE GATEWAY ---------- */
  const started = gatewayLeft < GATEWAY;
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="glass-card w-full max-w-2xl p-6 text-center md:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
          <Zap size={13} /> The 2-Minute Gateway
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
        <p className="max-w-md text-center text-lg font-bold leading-relaxed text-slate-700 md:text-xl">
          “Just commit to 2 minutes. You can stop after that if you want.”
        </p>

        <div className="mt-8">
          <TimerRing secondsLeft={gatewayLeft} total={GATEWAY} gradId="gatewayGrad" />
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={() => setGatewayRunning((r) => !r)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            {gatewayRunning ? (
              <>
                <Pause size={18} /> Pause
              </>
            ) : started ? (
              <>
                <Play size={18} /> Resume
              </>
            ) : (
              <>🚀 Launch 2-Minute Micro-Commitment</>
            )}
          </button>
          {started && (
            <button
              onClick={() => {
                setGatewayRunning(false);
                setGatewayLeft(GATEWAY);
              }}
              aria-label="Reset timer"
              className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white/70 text-slate-500 transition-all hover:bg-white hover:text-slate-900"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>

        <AmbientToggles ambient={ambient} />

        <p className="mt-4 text-xs font-semibold text-slate-400">
          Finish the gateway and you'll drop straight into a 25-minute deep focus lockout.
        </p>
      </div>
    </div>
  );
}
