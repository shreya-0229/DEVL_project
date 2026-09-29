import { useEffect, useState } from "react";
import { HeartPulse, Play, Pause, Moon, Music, Headphones } from "lucide-react";
import { useHealth } from "../store/HealthContext";

const ROADMAP = [
  {
    icon: Moon,
    title: "Guided breathwork sessions",
    desc: "Box breathing, 4-7-8, and NSDR protocols with haptic pacing.",
  },
  {
    icon: Music,
    title: "Curated YouTube playlists",
    desc: "Sleep stories, lo-fi focus streams, and wind-down mixes.",
  },
  {
    icon: Headphones,
    title: "Audio-converted readings",
    desc: "Course chapters converted to audio for passive review.",
  },
];

/** Teaser: mini audio player for the converted PHYS 150 reading. */
function AudioTeaser() {
  const { tasks } = useHealth();
  const audioTask = tasks.find((t) => t.isAudioConverted);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const LENGTH = 90; // 90s teaser loop

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setElapsed((s) => (s + 1) % LENGTH), 1000);
    return () => clearInterval(t);
  }, [playing]);

  if (!audioTask) return null;

  return (
    <div className="glass-card bg-gradient-to-br from-violet-500/10 to-pink-500/10 p-5 md:p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause preview" : "Play preview"}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-pink-500/30 transition-transform hover:scale-105 active:scale-95"
        >
          {playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-violet-600">
            Audio preview · {audioTask.course}
          </p>
          <p className="truncate text-sm font-extrabold text-slate-900">{audioTask.title}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-1000"
              style={{ width: `${(elapsed / LENGTH) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecoveryTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-8 text-center md:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-pink-500/30">
          <HeartPulse size={28} />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          Recovery & YouTube Hub
        </h1>
        <span className="mt-3 inline-flex items-center rounded-full bg-violet-50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-violet-600">
          Arriving in Phase 2
        </span>
        <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-relaxed text-slate-500">
          Your rest command center — breathwork, curated video, and audio-converted course
          readings, all tuned to your live stress state.
        </p>
      </div>

      <AudioTeaser />

      <div className="grid gap-4 md:grid-cols-3">
        {ROADMAP.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass-card p-5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/15 to-pink-500/15 text-pink-600">
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
