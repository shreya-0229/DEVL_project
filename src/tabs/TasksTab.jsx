import {
  BookOpen,
  Braces,
  FileText,
  Headphones,
  Check,
  Clock,
  Zap,
  ListChecks,
  Timer,
} from "lucide-react";
import { useHealth } from "../store/HealthContext";

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

export default function TasksTab() {
  const { priorityTasks, toggleTask, startFocus } = useHealth();
  const open = priorityTasks.filter((t) => !t.done).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-6 md:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
          <ListChecks size={13} /> Google Classroom · mock sync
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          Task Manager
        </h1>
        <p className="mt-1.5 text-sm font-medium text-slate-500">
          {open} open assignment{open === 1 ? "" : "s"} · ranked by priority score
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {priorityTasks.map((task) => {
          const FormatIcon = FORMAT_ICONS[task.icon] ?? FileText;
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
                  </div>
                  <h3
                    className={`mt-1.5 text-base font-extrabold tracking-tight md:text-lg ${
                      task.done ? "text-slate-400 line-through" : "text-slate-900"
                    }`}
                  >
                    {task.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={13} /> {task.dueDate}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Timer size={13} /> {task.userTimeMins} mins
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                        style={{ width: `${task.priorityScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-extrabold text-slate-500">
                      {task.priorityScore}
                    </span>
                  </div>
                </div>

                {!task.done && (
                  <button
                    onClick={() => startFocus(task.id)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-500/25 transition-transform hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <Zap size={14} /> Focus
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
