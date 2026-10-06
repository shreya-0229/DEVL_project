import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hourglass,
  Flame,
  Zap,
  ListTree,
  CalendarClock,
  PenLine,
  HeartHandshake,
  Candy,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useHealth } from "../store/HealthContext";
import ProcLandscape3D from "../analytics/ProcLandscape3D";
import {
  CAUSES,
  classifyCause,
  crunchIndex,
  startLatencyHours,
  urgency,
  aversiveness,
  procrastinationRisk,
  riskBand,
  crunchSeries,
  intentionActionData,
  studyStreak,
} from "../analytics/procData";

function SectionCard({ index, title, sub, children, className = "" }) {
  return (
    <div className={`glass-card p-5 md:p-6 ${className}`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-black text-white shadow-md shadow-fuchsia-500/25">
          {index}
        </span>
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-slate-900 md:text-lg">
            {title}
          </h2>
          {sub && <p className="mt-0.5 text-xs font-medium text-slate-500">{sub}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function RiskRing({ score }) {
  const band = riskBand(score);
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#F1F5F9" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={band.color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - (score / 100) * C}
          style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-3xl font-black tabular-nums tracking-tight text-slate-900">
            {score}
          </p>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            risk
          </p>
        </div>
      </div>
    </div>
  );
}

const NUDGE_ACTIONS = [
  {
    id: "kickoff",
    icon: Zap,
    title: "Two-Minute Kickoff",
    desc: "Just start for 2 minutes. Starting is the hardest part — momentum does the rest.",
    gradient: "from-amber-400 to-orange-500",
    run: "kickoff",
  },
  {
    id: "decompose",
    icon: ListTree,
    title: "Decompose into Milestones",
    desc: "Split the task into 3 small wins. Big tasks shrink when cut into pieces.",
    gradient: "from-emerald-400 to-cyan-500",
    run: "decompose",
  },
  {
    id: "ifthen",
    icon: CalendarClock,
    title: "If-Then Plan",
    desc: "Pre-decide your cue: “If it's 7 PM, then I open the assignment.”",
    gradient: "from-indigo-400 to-violet-500",
    run: "ifthen",
  },
  {
    id: "draft",
    icon: PenLine,
    title: "Good-Enough Draft Mode",
    desc: "Permission to write a deliberately bad first draft. Editing is a separate job.",
    gradient: "from-violet-400 to-fuchsia-500",
    run: "draft",
  },
  {
    id: "compassion",
    icon: HeartHandshake,
    title: "Self-Compassion Reset",
    desc: "Everyone stalls. Guilt fuels the cycle — self-forgiveness breaks it.",
    gradient: "from-rose-400 to-pink-500",
    run: "compassion",
  },
  {
    id: "bundle",
    icon: Candy,
    title: "Temptation Bundling",
    desc: "Pair the dull task with something pleasant — playlist, snack, café.",
    gradient: "from-cyan-400 to-sky-500",
    run: "bundle",
  },
];

export default function ProcrastinationTab() {
  const {
    tasks,
    stressScore,
    causeOverrides,
    setTaskCause,
    taskMilestones,
    addMilestones,
    draftTaskIds,
    toggleDraftMode,
    ifThenPlans,
    addIfThenPlan,
    nudgeLog,
    logNudge,
    startFocus,
  } = useHealth();

  const open = useMemo(() => tasks.filter((t) => !t.done), [tasks]);
  const causes = useMemo(() => {
    const m = {};
    tasks.forEach((t) => {
      m[t.id] = causeOverrides[t.id] || classifyCause(t, stressScore);
    });
    return m;
  }, [tasks, causeOverrides, stressScore]);

  const risk = procrastinationRisk(tasks, stressScore);
  const band = riskBand(risk);
  const streak = studyStreak();
  const crunched = open.filter((t) => crunchIndex(t) > 40);
  const frog = useMemo(
    () =>
      [...open].sort((a, b) => aversiveness(b) - aversiveness(a))[0] || null,
    [open]
  );

  const [actionTaskId, setActionTaskId] = useState(open[0]?.id ?? null);
  const actionTask = tasks.find((t) => t.id === actionTaskId) || open[0] || null;
  const [cue, setCue] = useState("");
  const [action, setAction] = useState("");
  const [showIfThen, setShowIfThen] = useState(false);
  const [compassionDone, setCompassionDone] = useState(false);

  const causeCounts = useMemo(() => {
    const m = {};
    open.forEach((t) => {
      const c = causes[t.id];
      m[c] = (m[c] || 0) + 1;
    });
    return Object.entries(m).map(([k, v]) => ({
      name: CAUSES[k].label,
      value: v,
      color: CAUSES[k].color,
    }));
  }, [open, causes]);

  const runNudge = (kind) => {
    if (!actionTask) return;
    const label = `${actionTask.course}: ${actionTask.title}`;
    if (kind === "kickoff") {
      logNudge(`Two-minute kickoff started on ${label}`);
      startFocus(actionTask.id); // routes to Focus Mode's 2-min gateway
      return;
    }
    if (kind === "decompose") {
      addMilestones(actionTask.id, ["Scope & outline", "First pass", "Polish & submit"]);
      logNudge(`Decomposed ${label} into 3 milestones`);
      return;
    }
    if (kind === "ifthen") {
      setShowIfThen(true);
      return;
    }
    if (kind === "draft") {
      toggleDraftMode(actionTask.id);
      logNudge(
        `${draftTaskIds.includes(actionTask.id) ? "Exited" : "Entered"} good-enough draft mode on ${label}`
      );
      return;
    }
    if (kind === "compassion") {
      setCompassionDone(true);
      logNudge(`Self-compassion reset taken for ${label}`);
      return;
    }
    if (kind === "bundle") {
      logNudge(`Temptation bundle paired with ${label}`);
      return;
    }
  };

  const saveIfThen = () => {
    if (!cue.trim() || !action.trim()) return;
    addIfThenPlan(cue.trim(), action.trim());
    logNudge(`If-then plan saved: “If ${cue.trim()}, then ${action.trim()}”`);
    setCue("");
    setAction("");
    setShowIfThen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="glass-card p-6 md:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-violet-600">
          <Hourglass size={13} /> Beat the delay
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          Procrastination Lab
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm font-medium text-slate-500">
          Your delay patterns, decoded — live risk scoring, cause diagnosis, and a
          behavioral nudge toolkit that acts on real tasks.
        </p>
      </div>

      {/* Hero stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass-card flex items-center gap-4 p-5 md:col-span-2">
          <RiskRing score={risk} />
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Procrastination risk
            </p>
            <p className={`mt-1 text-xl font-black bg-gradient-to-r ${band.gradient} bg-clip-text text-transparent`}>
              {band.label}
            </p>
            <p className="mt-1.5 max-w-xs text-xs font-medium leading-relaxed text-slate-500">
              Live score from open tasks, crunch pressure, and your current stress
              ({Math.round(stressScore)}%). Drag the Simulator's stress slider and watch
              it move.
            </p>
          </div>
        </div>
        <div className="glass-card p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-md">
            <Flame size={18} />
          </span>
          <p className="mt-3 text-3xl font-black tabular-nums text-slate-900">{streak}</p>
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            day study streak
          </p>
        </div>
        <div className="glass-card p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-md">
            <TrendingUp size={18} />
          </span>
          <p className="mt-3 text-3xl font-black tabular-nums text-slate-900">
            {crunched.length}
          </p>
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            tasks in crunch zone
          </p>
        </div>
      </div>

      {/* Frog card */}
      {frog && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card flex flex-wrap items-center gap-4 border-emerald-200/60 p-5"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-2xl shadow-md">
            🐸
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">
              Eat the frog — today's hardest task first
            </p>
            <p className="mt-0.5 truncate text-sm font-extrabold text-slate-900">
              {frog.course}: {frog.title}
            </p>
            <p className="text-xs font-medium text-slate-500">
              Aversiveness {aversiveness(frog)}/100 · {frog.budgetMins} min budgeted
            </p>
          </div>
          <button
            onClick={() => {
              logNudge(`Ate the frog: ${frog.course} ${frog.title}`);
              startFocus(frog.id);
            }}
            className="rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition-transform hover:scale-105"
          >
            Start it now
          </button>
        </motion.div>
      )}

      {/* Cause diagnosis */}
      <SectionCard
        index="1"
        title="Why are you delaying?"
        sub="Auto-detected cause per task — tap to correct it, the nudges adapt"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {open.map((t) => {
            const cause = causes[t.id];
            const c = CAUSES[cause];
            const crunch = crunchIndex(t);
            return (
              <div
                key={t.id}
                className="rounded-3xl border border-white/60 bg-white/70 p-4 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      {t.course} · {t.dueDate}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-extrabold text-slate-900">
                      {t.title}
                    </p>
                  </div>
                  {draftTaskIds.includes(t.id) && (
                    <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-extrabold text-violet-700">
                      Draft mode
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold text-white"
                    style={{ background: c.color }}
                  >
                    {c.label}
                  </span>
                  <div className="relative">
                    <select
                      value={cause}
                      onChange={(e) => setTaskCause(t.id, e.target.value)}
                      className="appearance-none rounded-full border border-slate-200 bg-white py-1 pl-3 pr-7 text-[11px] font-bold text-slate-500"
                      aria-label="Correct detected cause"
                    >
                      {Object.entries(CAUSES).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs font-medium italic text-slate-500">{c.blurb}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                    <span>Crunch index</span>
                    <span className="tabular-nums">{crunch}/100</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: c.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${crunch}%` }}
                      transition={{ duration: 0.7 }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                    Waiting ~{startLatencyHours(t)}h before first touch · Suggested:{" "}
                    <span className="font-extrabold text-slate-600">
                      {c.nudges.join(" · ")}
                    </span>
                  </p>
                </div>
                {(taskMilestones[t.id]?.length > 0) && (
                  <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Milestones
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {taskMilestones[t.id].map((m, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                          <CheckCircle2 size={13} className="text-emerald-500" /> {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
          {!open.length && (
            <p className="text-sm font-semibold text-slate-500">
              All tasks complete — nothing to diagnose. 🎉
            </p>
          )}
        </div>
      </SectionCard>

      {/* Nudge action center */}
      <SectionCard
        index="2"
        title="Nudge Action Center"
        sub="Pick a task, fire a behavioral intervention — each one does something real"
      >
        <div className="mb-4 flex items-center gap-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Acting on
          </label>
          <select
            value={actionTaskId ?? ""}
            onChange={(e) => setActionTaskId(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
          >
            {open.map((t) => (
              <option key={t.id} value={t.id}>
                {t.course}: {t.title.slice(0, 34)}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NUDGE_ACTIONS.map(({ id, icon: Icon, title, desc, gradient, run }) => (
            <motion.button
              key={id}
              whileTap={{ scale: 0.97 }}
              onClick={() => runNudge(run)}
              className="rounded-3xl border border-white/60 bg-white/70 p-5 text-left backdrop-blur-xl transition-shadow hover:shadow-lg"
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}
              >
                <Icon size={18} />
              </span>
              <p className="mt-3 text-sm font-extrabold text-slate-900">{title}</p>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{desc}</p>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {showIfThen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-3xl bg-indigo-50/70 p-5">
                <p className="text-sm font-extrabold text-indigo-900">
                  Build your if-then plan
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={cue}
                    onChange={(e) => setCue(e.target.value)}
                    placeholder="If it's 7 PM after dinner…"
                    className="rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                  />
                  <input
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="…then I open the problem set."
                    className="rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                  />
                  <button
                    onClick={saveIfThen}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700"
                  >
                    Save plan
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {compassionDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-3xl bg-rose-50/70 p-5"
            >
              <p className="text-sm font-extrabold text-rose-900">
                💗 Everyone stalls. What matters is the next 10 minutes, not the last 3
                days.
              </p>
              <p className="mt-1 text-xs font-medium text-rose-700/80">
                Research note: self-forgiveness after a stall predicts less future
                procrastination — guilt predicts more. Pick one tiny next step below.
              </p>
              <button
                onClick={() => setCompassionDone(false)}
                className="mt-2 text-xs font-extrabold text-rose-600 underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {ifThenPlans.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Your if-then plans
            </p>
            <div className="flex flex-wrap gap-2">
              {ifThenPlans.map((p) => (
                <span
                  key={p.id}
                  className="rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-bold text-indigo-800"
                >
                  If {p.cue}, then {p.action}
                </span>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* 3D landscape */}
      <SectionCard
        index="3"
        title="3D Procrastination Landscape"
        sub="Every open task as a glowing node · color = delay cause"
      >
        <ProcLandscape3D tasks={tasks} causes={causes} />
      </SectionCard>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard index="4" title="Crunch Index — 14 Days" sub="Remaining work ÷ remaining time">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={crunchSeries()} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="crunchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94A3B8" }} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12, fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="crunch" stroke="#F43F5E" strokeWidth={2.5} fill="url(#crunchGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard index="5" title="Intention vs Action" sub="Planned study sessions vs actually started">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={intentionActionData()} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12, fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
              <Bar dataKey="planned" name="Planned" fill="#C4B5FD" radius={[6, 6, 0, 0]} />
              <Bar dataKey="actual" name="Started" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-[11px] font-semibold text-slate-400">
            The gap between bars is the intention–action gap — procrastination, visualized.
          </p>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard index="6" title="Delay Causes" sub="What's driving avoidance right now" className="lg:col-span-1">
          {causeCounts.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={causeCounts} dataKey="value" nameKey="name" innerRadius={52} outerRadius={85} paddingAngle={3}>
                  {causeCounts.map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12, fontWeight: 600 }} />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-sm font-semibold text-slate-400">No open tasks.</p>
          )}
        </SectionCard>

        <div className="glass-card p-5 md:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-md">
              <Sparkles size={16} />
            </span>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 md:text-lg">
              What worked — nudge log
            </h2>
          </div>
          {nudgeLog.length ? (
            <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto">
              {nudgeLog.map((n) => (
                <li key={n.id} className="flex items-start gap-2.5 rounded-2xl bg-slate-50 p-3">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">{n.text}</p>
                    <p className="text-[10px] font-semibold text-slate-400">{n.ts}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl bg-slate-50 p-4 text-xs font-medium leading-relaxed text-slate-500">
              Fire any nudge above and it lands here. Over time this becomes your
              personal evidence of which interventions actually move you — the feedback
              loop that makes the system adaptive instead of generic.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
