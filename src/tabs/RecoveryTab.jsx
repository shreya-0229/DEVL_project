import { useEffect, useMemo, useRef, useState } from "react";
import {
  HeartPulse,
  Play,
  Pause,
  Wind,
  ChevronDown,
  Youtube,
  Search,
  Clock,
  Gauge,
} from "lucide-react";
import { prand } from "../analytics/bioData";
import { YT_CATEGORIES } from "../youtube";
import { useHealth } from "../store/HealthContext";

/* ---------------- SECTION 1: 4-7-8 BREATHING CIRCLE ---------------- */

const PHASES = [
  { key: "inhale", label: "Inhale", secs: 4, scale: 1.45, color: "#06B6D4", glow: "rgba(6,182,212,0.55)" },
  { key: "hold", label: "Hold", secs: 7, scale: 1.45, color: "#8B5CF6", glow: "rgba(139,92,246,0.55)" },
  { key: "exhale", label: "Exhale", secs: 8, scale: 1, color: "#10B981", glow: "rgba(16,185,129,0.55)" },
];

function BreathingCircle() {
  const [active, setActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secsLeft, setSecsLeft] = useState(PHASES[0].secs);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (secsLeft > 0) {
      const t = setTimeout(() => setSecsLeft(secsLeft - 1), 1000);
      return () => clearTimeout(t);
    }
    const next = (phaseIdx + 1) % PHASES.length;
    if (next === 0) setCycles((c) => c + 1);
    setPhaseIdx(next);
    setSecsLeft(PHASES[next].secs);
  }, [active, secsLeft, phaseIdx]);

  const startStop = () => {
    if (active) {
      setActive(false);
    } else {
      setPhaseIdx(0);
      setSecsLeft(PHASES[0].secs);
      setActive(true);
    }
  };

  const phase = PHASES[phaseIdx];

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-white shadow-md shadow-cyan-500/25">
          <Wind size={20} />
        </span>
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-slate-900 md:text-lg">
            4-7-8 Physiological Breathing
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Follow the sphere — inhale 4s · hold 7s · exhale 8s
          </p>
        </div>
        <span className="ml-auto rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-extrabold tabular-nums text-white">
          {cycles} {cycles === 1 ? "cycle" : "cycles"}
        </span>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative grid h-64 w-64 place-items-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              transform: `scale(${active ? phase.scale : 1})`,
              transitionProperty: "transform, background, box-shadow, border-color",
              transitionDuration: `${phase.secs}s, 0.6s, 0.6s, 0.6s`,
              transitionTimingFunction: "ease-in-out, ease, ease, ease",
              background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85), ${phase.color}44 45%, ${phase.color}18 70%)`,
              boxShadow: `0 0 90px ${phase.glow}, inset 0 0 50px ${phase.glow}`,
              border: `2px solid ${phase.color}55`,
            }}
          />
          <div className="relative text-center">
            <p className="text-xl font-black uppercase tracking-widest" style={{ color: phase.color }}>
              {active ? phase.label : "Ready"}
            </p>
            <p className="mt-1 text-6xl font-black tabular-nums tracking-tight text-slate-900">
              {active ? secsLeft : "4·7·8"}
            </p>
          </div>
        </div>

        <button
          onClick={startStop}
          className={`mt-6 inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-extrabold text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.97] ${
            active
              ? "bg-slate-900 shadow-slate-900/20"
              : "bg-gradient-to-r from-cyan-500 to-violet-500 shadow-cyan-500/30"
          }`}
        >
          {active ? (
            <>
              <Pause size={18} /> Stop session
            </>
          ) : (
            <>
              <Play size={18} /> Begin breathing
            </>
          )}
        </button>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {PHASES.map((p) => (
            <span
              key={p.key}
              className="rounded-full bg-slate-50 px-3.5 py-1.5 text-[11px] font-extrabold"
              style={{ color: p.color }}
            >
              {p.label} {p.secs}s
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- SECTION 2: AI AUDIO SUMMARY PLAYER ---------------- */

const SUMMARY_LENGTH = 120; // 2:00
const SPEEDS = [1, 1.25, 1.5, 2];

const TRANSCRIPT = `Chapter 4 — Kinematics in one breath. Position is where you are; displacement is how far you've moved from where you started, and the distinction matters the moment direction enters the picture.

Velocity is the rate of change of displacement, acceleration the rate of change of velocity. Under constant acceleration, three equations do nearly all the work: v equals u plus at; displacement equals ut plus one-half at squared; and v squared equals u squared plus 2as.

The trick examiners love: pick your sign convention once — up positive or down positive — and never switch mid-problem. Free fall is just constant acceleration with a equal to g, 9.8 meters per second squared downward.

Graph it to check yourself: the slope of a displacement-time graph is velocity, and the area under a velocity-time graph is displacement. If your numbers disagree with your graph, trust the graph and recheck the algebra.`;

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function AudioSummaryPlayer() {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState(1.25);
  const [showTranscript, setShowTranscript] = useState(false);
  const [noVoice, setNoVoice] = useState(false);
  const chainRef = useRef({ chunks: [], idx: 0, rate: 1.25 });
  const playStateRef = useRef(false);
  playStateRef.current = playing;

  const bars = useMemo(
    () => Array.from({ length: 52 }, (_, i) => 6 + Math.round(prand(i * 7 + 3) * 26)),
    []
  );

  const pickVoice = () => {
    const synth = window.speechSynthesis;
    if (!synth) return null;
    const voices = synth.getVoices();
    if (!voices.length) return null;
    return (
      voices.find((v) => /en-US/i.test(v.lang) && /google/i.test(v.name)) ||
      voices.find((v) => /en_US/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      voices[0]
    );
  };

  // Speak the transcript in paragraph chunks (avoids the long-utterance cutoff
  // some browsers apply) chained via onend.
  const startSpeech = (rate) => {
    const synth = window.speechSynthesis;
    if (!synth) {
      setNoVoice(true);
      return;
    }
    synth.cancel();
    const chunks = TRANSCRIPT.split("\n\n").filter(Boolean);
    chainRef.current = { chunks, idx: 0, rate };
    const voice = pickVoice();
    const speakChunk = () => {
      const { chunks: cs, idx, rate: r } = chainRef.current;
      if (idx >= cs.length) {
        setElapsed(SUMMARY_LENGTH);
        setPlaying(false);
        return;
      }
      const u = new SpeechSynthesisUtterance(cs[idx]);
      u.rate = r;
      u.pitch = 1;
      if (voice) u.voice = voice;
      u.onend = () => {
        if (!playStateRef.current) return; // paused/cancelled mid-chain
        chainRef.current.idx += 1;
        speakChunk();
      };
      u.onerror = () => {
        setPlaying(false);
      };
      synth.speak(u);
    };
    speakChunk();
  };

  const stopSpeech = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const handlePlayPause = () => {
    const synth = window.speechSynthesis;
    if (done) {
      setElapsed(0);
      setPlaying(true);
      startSpeech(speed);
      return;
    }
    if (playing) {
      if (synth) synth.pause();
      setPlaying(false);
    } else {
      if (synth && synth.paused) {
        synth.resume();
        setPlaying(true);
      } else {
        setElapsed(0);
        setPlaying(true);
        startSpeech(speed);
      }
    }
  };

  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(next);
    if (playing) {
      // rate only applies at speak time — restart the reading with the new rate
      setElapsed(0);
      startSpeech(next);
    }
  };

  // UI progress timer (runs while "playing")
  useEffect(() => {
    if (!playing) return;
    if (elapsed >= SUMMARY_LENGTH) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(
      () => setElapsed(Math.min(SUMMARY_LENGTH, elapsed + 0.25 * speed)),
      250
    );
    return () => clearTimeout(t);
  }, [playing, elapsed, speed]);

  // stop any speech when leaving the player
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const done = elapsed >= SUMMARY_LENGTH;

  return (
    <div className="glass-card bg-gradient-to-br from-violet-500/10 to-pink-500/10 p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-md shadow-pink-500/25">
          <HeartPulse size={20} />
        </span>
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-slate-900 md:text-lg">
            AI Audio Summary Player
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Chapter 4: Kinematics · PHYS 150 · 2-minute AI summary
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          aria-label={playing ? "Pause summary" : "Play summary"}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-pink-500/30 transition-transform hover:scale-105 active:scale-95"
        >
          {playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex h-16 items-end gap-[3px]" aria-hidden="true">
            {bars.map((h, i) => {
              const played = i / bars.length <= elapsed / SUMMARY_LENGTH;
              return (
                <span
                  key={i}
                  className="flex-1 rounded-full transition-colors duration-200"
                  style={{
                    height: `${h}px`,
                    background: played
                      ? "linear-gradient(to top, #8B5CF6, #EC4899)"
                      : "#E2E8F0",
                  }}
                />
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs font-extrabold tabular-nums text-slate-700">
              {fmtTime(elapsed)} <span className="text-slate-400">/ {fmtTime(SUMMARY_LENGTH)}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={cycleSpeed}
                className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-[11px] font-extrabold text-violet-700 transition-all hover:bg-white"
              >
                <Gauge size={12} /> {speed}×
              </button>
              {done && (
                <span className="text-[11px] font-extrabold text-emerald-600">
                  Finished — tap play to replay
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {noVoice && (
        <p className="mt-3 text-xs font-bold text-rose-600">
          Your browser couldn't provide a voice for read-aloud on this device.
        </p>
      )}

      <button
        onClick={() => setShowTranscript((s) => !s)}
        className="mt-4 inline-flex w-full items-center justify-between rounded-2xl bg-white/60 px-4 py-3 text-sm font-extrabold text-slate-700 transition-all hover:bg-white"
      >
        <span className="inline-flex items-center gap-2">
          <Clock size={15} /> Transcript
        </span>
        <ChevronDown
          size={18}
          className={`transition-transform ${showTranscript ? "rotate-180" : ""}`}
        />
      </button>
      {showTranscript && (
        <div className="mt-3 rounded-2xl bg-white/70 p-5">
          {TRANSCRIPT.split("\n\n").map((para, i) => (
            <p key={i} className="mb-3 text-sm font-medium leading-relaxed text-slate-600 last:mb-0">
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- SECTION 3: YOUTUBE RECOVERY HUB ---------------- */

function VideoCard({ title, videoId }) {
  const embed = `https://www.youtube.com/embed/${videoId}`;
  const watch = `https://www.youtube.com/watch?v=${videoId}`;
  return (
    <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-sm backdrop-blur-xl">
      <div className="aspect-video w-full bg-slate-900">
        <iframe
          src={embed}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <p className="min-w-0 text-sm font-extrabold text-slate-900">{title}</p>
        <a
          href={watch}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-extrabold text-white transition-transform hover:scale-105"
        >
          Open in YouTube ↗
        </a>
      </div>
    </div>
  );
}

function extractVideoId(url) {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return m ? m[1] : null;
}

function YouTubeHub() {
  const { ytCategory, setYtCategory } = useHealth();
  const [url, setUrl] = useState("");
  const [customIds, setCustomIds] = useState([]);
  const [urlError, setUrlError] = useState("");

  const cat = YT_CATEGORIES.find((c) => c.id === ytCategory) ?? YT_CATEGORIES[0];

  const addCustom = () => {
    const id = extractVideoId(url.trim());
    if (!id) {
      setUrlError("Couldn't find a video ID in that URL — paste a watch, share, or embed link.");
      return;
    }
    setUrlError("");
    setCustomIds((ids) => (ids.includes(id) ? ids : [id, ...ids]));
    setUrl("");
  };

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25">
          <Youtube size={20} />
        </span>
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-slate-900 md:text-lg">
            Recovery & Motivation Hub
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Curated video for every state of mind
          </p>
        </div>
      </div>

      {/* Custom URL embed */}
      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
          Embed your own video
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="Paste any YouTube URL…"
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            onClick={addCustom}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-extrabold text-white transition-transform hover:scale-[1.02]"
          >
            <Search size={15} /> Embed
          </button>
        </div>
        {urlError && (
          <p className="mt-2 text-xs font-bold text-rose-600">{urlError}</p>
        )}
      </div>

      {customIds.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-extrabold text-slate-700">Your embeds</p>
          <div className="grid gap-4 md:grid-cols-2">
            {customIds.map((id) => (
              <VideoCard key={id} title="Custom embedded video" videoId={id} />
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {YT_CATEGORIES.map((c) => {
          const on = c.id === ytCategory;
          return (
            <button
              key={c.id}
              onClick={() => setYtCategory(c.id)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-extrabold transition-all ${
                on
                  ? "bg-slate-900 text-white shadow-md"
                  : "border border-slate-200 bg-white/70 text-slate-500 hover:border-indigo-300 hover:text-indigo-700"
              }`}
            >
              {c.tab}
            </button>
          );
        })}
      </div>

      <div key={ytCategory} className="mt-4 grid animate-fade-slide gap-4 md:grid-cols-2">
        {cat.videos.map((v) => (
          <VideoCard key={v.videoId} title={v.title} videoId={v.videoId} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- TAB ---------------- */

export default function RecoveryTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-6 md:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-violet-600">
          <HeartPulse size={13} /> Physiological reset
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          Recovery Hub
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm font-medium text-slate-500">
          Downshift your nervous system — breathwork, AI audio summaries, and curated
          video for every state of mind.
        </p>
      </div>

      <BreathingCircle />
      <AudioSummaryPlayer />
      <YouTubeHub />
    </div>
  );
}
