import { useState } from "react";
import {
  RefreshCw,
  Clock,
  Zap,
  Flame,
  Headphones,
  Check,
  CalendarClock,
  Play,
  Pause,
  Timer,
  BookOpen,
  Braces,
  FileText,
  ListChecks,
} from "lucide-react";
import { useHealth } from "../store/HealthContext";
import BackSchedulerModal from "../components/BackSchedulerModal";

const PRESETS = [15, 30, 45, 60];

const COURSE_STYLES = {
  "MATH 201": "border-indigo-200 bg-indigo-50 text-indigo-700",
  "CS 102": "border-cyan-200 bg-cyan-50 text-cyan-700",
  "PHYS 150": "border-violet-200 bg-violet-50 text-violet-700",
  "ENG 101": "border-amber-200 bg-amber-50 text-amber-700",
};

const FORMAT_ICONS = {
  book: BookOpen,
  code: Braces,
  audio: Headphones,
  doc: FileText,
};

function fmtTotal(mins) {
  if (mins < 60) return `${mins} mins`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function AudioSummaryCard({ task }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-pink-50 p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause summary" : "Play summary"}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-pink-500/30 transition-transform hover:scale-105 active:scale-95"
        >
          {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-extrabold text-slate-900">{task.title}</p>
          <p className="text-[10px] font-bold text-violet-600">
            {playing ? "AI summary playing…" : "2-min AI audio summary ready"}
          </p>
        </div>
        {playing && (
          <div className="flex items-end gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 animate-pulse rounded-full bg-violet-500"
                style={{ height: `${10 + i * 5}px`, animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksTab() {
  const {
    tasks,
    priorityTasks,
    toggleTask,
    startFocus,
    setBudgetMins,
    stressScore,
  } = useHealth();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("2m ago");
  const [planTask, setPlanTask] = useState(null);
  const [plans, setPlans] = useState([]);

  const open = tasks.filter((t) => !t.done);
  const totalMins = open.reduce((s, t) => s + (t.budgetMins ?? t.userTimeMins), 0);

  const sync = () => {
    if (syncing) return;
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync("just now");
    }, 1600);
  };

  const doNow = priorityTasks.filter((t) => !t.done).slice(0, 2);
  const quickWins = priorityTasks.filter(
    (t) => !t.done && (t.budgetMins ?? t.userTimeMins) <= 20
  );
  const audioActive = stressScore > 70;
  const audioQueue = audioActive
    ? priorityTasks.filter(
        (t) =>
          !t.done &&
          (t.isAudioConverted || /reading|chapter/i.test(`${t.title} ${t.format}`))
      )
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Sync header */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
              <ListChecks size={13} /> Task Manager · Back-Scheduler
            </span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              Classroom Sync
            </h1>
            <p className="mt-1.5 text-sm font-medium text-slate-500">
              {open.length} open assignment{open.length === 1 ? "" : "s"} · Last synced{" "}
              {lastSync}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 px-5 py-3 text-center shadow-lg">
              <p className="text-2xl font-black tabular-nums text-white">
                {fmtTotal(totalMins)}
              </p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                study budgeted today
              </p>
            </div>
            <button
              onClick={sync}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] disabled:opacity-70"
            >
              <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing…" : "Sync Google Classroom Data"}
            </button>
          </div>
        </div>
      </div>

      {/* Time budgeting cards */}
      <div className="flex flex-col gap-4">
        {priorityTasks.map((task) => {
          const FormatIcon = FORMAT_ICONS[task.icon] ?? FileText;
          const budget = task.budgetMins ?? task.userTimeMins;
          return (
            <div
              key={task.id}
              className={`glass-card p-5 md:p-6 ${task.done ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  aria-label={task.done ? "Mark as not done" : "Mark as done"}
                  className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-all ${
                    task.done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white text-transparent hover:border-indigo-400"
                  }`}
                >
                  <Check size={15} strokeWidth={3} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-0.5 text-xs font-extrabold ${COURSE_STYLES[task.course]}`}
                    >
                      {task.course}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                      <FormatIcon size={13} /> {task.format}
                    </span>
                    {task.isAudioConverted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-bold text-violet-700">
                        <Headphones size={12} /> Audio ready
                      </span>
                    )}
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-extrabold text-indigo-700">
                      <Timer size={12} /> {budget}m budgeted
                    </span>
                  </div>
                  <h3
                    className={`mt-1.5 text-base font-extrabold tracking-tight md:text-lg ${
                      task.done ? "text-slate-400 line-through" : "text-slate-900"
                    }`}
                  >
                    {task.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Clock size={13} /> {task.dueDate}
                  </p>

                  {!task.done && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Time budget
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {PRESETS.map((p) => (
                          <button
                            key={p}
                            onClick={() => setBudgetMins(task.id, p)}
                            className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all ${
                              budget === p
                                ? "bg-slate-900 text-white shadow-md"
                                : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
                            }`}
                          >
                            {p}m
                          </button>
                        ))}
                        <span className="ml-1 text-xs font-bold tabular-nums text-slate-500">
                          Custom:
                        </span>
                        <input
                          type="range"
                          min={5}
                          max={120}
                          step={5}
                          value={budget}
                          onChange={(e) => setBudgetMins(task.id, Number(e.target.value))}
                          className="max-w-[180px] flex-1"
                          aria-label={`Custom time budget for ${task.title}`}
                        />
                        <span className="w-14 text-right text-sm font-extrabold tabular-nums text-slate-900">
                          {budget}m
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {!task.done && (
                <div className="mt-4 flex flex-wrap gap-2 pl-11">
                  <button
                    onClick={() => startFocus(task.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-500/25 transition-transform hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <Zap size={14} /> Focus now
                  </button>
                  <button
                    onClick={() => setPlanTask(task)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-xs font-extrabold text-slate-600 transition-all hover:bg-white hover:text-indigo-700"
                  >
                    <CalendarClock size={14} /> Plan backwards
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Smart prioritizer queue */}
      <div>
        <h2 className="mb-3 text-lg font-extrabold tracking-tight text-slate-900">
          Smart Prioritizer
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30">
                <Flame size={18} />
              </span>
              <div>
                <p className="text-sm font-extrabold text-slate-900">Do Right Now</p>
                <p className="text-[11px] font-semibold text-slate-400">
                  Priority 1 · high urgency
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              {doNow.length === 0 && (
                <p className="text-xs font-medium text-slate-400">All clear.</p>
              )}
              {doNow.map((t) => (
                <button
                  key={t.id}
                  onClick={() => startFocus(t.id)}
                  className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3 text-left transition-all hover:bg-rose-50 hover:shadow-md"
                >
                  <p className="text-xs font-extrabold text-rose-700">{t.course}</p>
                  <p className="mt-0.5 truncate text-xs font-bold text-slate-800">{t.title}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/30">
                <Zap size={18} />
              </span>
              <div>
                <p className="text-sm font-extrabold text-slate-900">Quick Wins</p>
                <p className="text-[11px] font-semibold text-slate-400">
                  Priority 2 · ≤ 20 min tasks
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              {quickWins.length === 0 && (
                <p className="text-xs font-medium text-slate-400">
                  No sub-20-minute tasks right now.
                </p>
              )}
              {quickWins.map((t) => (
                <button
                  key={t.id}
                  onClick={() => startFocus(t.id)}
                  className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3 text-left transition-all hover:bg-amber-50 hover:shadow-md"
                >
                  <p className="text-xs font-extrabold text-amber-700">{t.course}</p>
                  <p className="mt-0.5 truncate text-xs font-bold text-slate-800">{t.title}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                    {t.budgetMins ?? t.userTimeMins} mins
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-md shadow-pink-500/30">
                <Headphones size={18} />
              </span>
              <div>
                <p className="text-sm font-extrabold text-slate-900">Stress-Adapted Audio</p>
                <p className="text-[11px] font-semibold text-slate-400">
                  Priority 3 · activates above 70%
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              {!audioActive ? (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-extrabold text-slate-500">Standby</p>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-400">
                    Dense readings convert to 2-minute AI audio summaries when stress
                    exceeds 70%.
                  </p>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-700"
                      style={{ width: `${Math.min(100, stressScore)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[10px] font-extrabold tabular-nums text-slate-500">
                    {Math.round(stressScore)}% / 70%
                  </p>
                </div>
              ) : audioQueue.length === 0 ? (
                <p className="text-xs font-medium text-slate-400">
                  No dense readings in the queue.
                </p>
              ) : (
                audioQueue.map((t) => <AudioSummaryCard key={t.id} task={t} />)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Saved back-scheduler plans */}
      {plans.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-extrabold tracking-tight text-slate-900">
            Scheduled Plans
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((p) => (
              <div key={p.id} className="glass-card p-5">
                <p className="text-sm font-extrabold text-slate-900">{p.name}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-400">
                  Due {p.due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
                <div className="mt-3 flex flex-col gap-1.5">
                  {p.checkpoints.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <span className="text-xs font-bold text-slate-700">{c.label}</span>
                      <span className="text-[11px] font-extrabold text-indigo-600">
                        {c.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {planTask && (
        <BackSchedulerModal
          task={planTask}
          onClose={() => setPlanTask(null)}
          onSave={(plan) => setPlans((ps) => [plan, ...ps])}
        />
      )}
    </div>
  );
}
