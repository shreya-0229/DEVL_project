import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { NAV_ITEMS } from "../nav";
import { useHealth } from "../store/HealthContext";

/** Slide-in navigation drawer for mobile — replaces the pill bar. */
export default function MobileDrawer() {
  const { drawerOpen, setDrawerOpen, activeTab, setActiveTab } = useHealth();

  const go = (id) => {
    setActiveTab(id);
    setDrawerOpen(false);
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
          />
          <motion.aside
            className="fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col bg-white/95 p-5 shadow-2xl backdrop-blur-xl md:hidden"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-black text-white">
                  EH
                </span>
                <p className="text-sm font-extrabold tracking-tight text-slate-900">
                  EduHealth AI
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1.5">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                const on = activeTab === id;
                return (
                  <motion.button
                    key={id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => go(id)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition-all ${
                      on
                        ? "bg-slate-900 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </motion.button>
                );
              })}
            </nav>

            <p className="mt-auto pt-6 text-center text-[11px] font-medium text-slate-400">
              EduHealth AI · simulated demo data
            </p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
