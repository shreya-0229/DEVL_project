import { useRef, useState } from "react";
import { X, GripVertical, CalendarClock, Check } from "lucide-react";

const MAX_DAYS = 14;

function fmtDate(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function toISODate(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function BackSchedulerModal({ task, onClose, onSave }) {
  const [name, setName] = useState(task?.title ?? "");
  const [due, setDue] = useState(() =>
    toISODate(new Date(Date.now() + 4 * 864e5))
  );
  const [cps, setCps] = useState([
    { id: "c1", label: "Outline", daysBefore: 3, locked: false },
    { id: "c2", label: "First Draft", daysBefore: 1, locked: false },
    { id: "c3", label: "Final Submission", daysBefore: 0, locked: true },
  ]);
  const [dragId, setDragId] = useState(null);
  const [saved, setSaved] = useState(false);
  const trackRef = useRef(null);

  const dueDate = new Date(`${due}T12:00:00`);
  const dateFor = (daysBefore) => {
    const d = new Date(dueDate);
    d.setDate(d.getDate() - daysBefore);
    return d;
  };

  const onMove = (e) => {
    if (!dragId || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const days = Math.round((1 - ratio) * MAX_DAYS);
    setCps((cs) => cs.map((c) => (c.id === dragId ? { ...c, daysBefore: days } : c)));
  };

  const handleSave = () => {
    onSave({
      id: Date.now(),
      name: name.trim() || "Untitled task",
      due: dueDate,
      checkpoints: cps.map((c) => ({
        label: c.label,
        daysBefore: c.daysBefore,
        date: dateFor(c.daysBefore),
      })),
    });
    setSaved(true);
    setTimeout(onClose, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass-card relative max-h-[90vh] w-full max-w-2xl overflow-y-auto !bg-white/95 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30">
              <CalendarClock size={22} />
            </span>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                Back-Scheduler
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Milestones auto-generated backwards from your deadline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Task name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="e.g. Research Paper Draft"
            />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Final due date
            </span>
            <input
              type="date"
              value={due}
              onChange={(e) => e.target.value && setDue(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>

        <div className="mt-4 px-1 pb-10 pt-20">
          <div ref={trackRef} className="relative h-2.5 rounded-full bg-gradient-to-r from-indigo-200 via-purple-200 to-cyan-200">
            {Array.from({ length: MAX_DAYS + 1 }, (_, i) => (
              <div key={i} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                  className={`rounded-full bg-white/80 ${i % 7 === 0 ? "h-3 w-1" : "h-1.5 w-0.5"}`}
                  style={{ left: `${(i / MAX_DAYS) * 100}%`, position: "relative" }}
                />
              </div>
            ))}
            {cps.map((cp) => (
              <div
                key={cp.id}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(1 - cp.daysBefore / MAX_DAYS) * 100}%` }}
              >
                <div
                  onPointerDown={(e) => {
                    if (cp.locked) return;
                    setDragId(cp.id);
                    e.currentTarget.setPointerCapture(e.pointerId);
                  }}
                  onPointerMove={onMove}
                  onPointerUp={() => setDragId(null)}
                  onPointerCancel={() => setDragId(null)}
                  className={`grid h-10 w-10 place-items-center rounded-full text-white shadow-xl transition-transform ${
                    cp.locked
                      ? "cursor-default bg-slate-900"
                      : "cursor-grab bg-gradient-to-br from-indigo-500 to-cyan-500 active:cursor-grabbing active:scale-110"
                  }`}
                  style={
                    !cp.locked
                      ? { boxShadow: "0 8px 24px rgba(99,102,241,0.45)" }
                      : undefined
                  }
                >
                  {cp.locked ? <Check size={17} strokeWidth={3} /> : <GripVertical size={17} />}
                </div>
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                  <p className="text-xs font-extrabold text-slate-900">{cp.label}</p>
                  <p className="mt-0.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700">
                    Day -{cp.daysBefore} · {fmtDate(dateFor(cp.daysBefore))}
                  </p>
                </div>
              </div>
            ))}
            <div className="absolute -bottom-7 left-0 text-[10px] font-bold text-slate-400">
              Day -{MAX_DAYS}
            </div>
            <div className="absolute -bottom-7 right-0 text-[10px] font-bold text-slate-400">
              Due · {fmtDate(dueDate)}
            </div>
          </div>
        </div>

        <p className="-mt-2 text-center text-[11px] font-semibold text-slate-400">
          Drag the glowing handles to shift milestones · Final submission stays locked to
          the due date
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-600 transition-all hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold text-white shadow-lg transition-all ${
              saved
                ? "bg-emerald-500 shadow-emerald-500/30"
                : "bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-indigo-500/30 hover:scale-[1.02]"
            }`}
          >
            {saved ? (
              <>
                <Check size={16} strokeWidth={3} /> Plan saved
              </>
            ) : (
              "Save plan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
