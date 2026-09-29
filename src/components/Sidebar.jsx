import { Sparkles } from "lucide-react";
import { useHealth } from "../store/HealthContext";
import { NAV_ITEMS } from "../nav";

export default function Sidebar() {
  const { activeTab, setActiveTab } = useHealth();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col p-5 md:flex">
      <div className="flex items-center gap-3 px-2 py-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/30">
          <Sparkles size={22} />
        </div>
        <div>
          <p className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-lg font-extrabold text-transparent">
            EduHealth AI
          </p>
          <p className="text-[11px] font-semibold text-slate-500">Student Wellness OS</p>
        </div>
      </div>

      <nav className="mt-2 flex flex-col gap-1.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                active
                  ? "border border-white/60 bg-white/85 text-slate-900 shadow-xl shadow-indigo-500/10 backdrop-blur-xl"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-900"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
              )}
              <Icon
                size={19}
                className={active ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}
              />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="glass-card mt-auto p-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Phase 1 build
        </p>
        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
          Live demo data — wearable sync arrives in Phase 2.
        </p>
      </div>
    </aside>
  );
}
