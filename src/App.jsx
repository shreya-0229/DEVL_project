import { HealthProvider, useHealth } from "./store/HealthContext";
import AuroraBackground from "./components/AuroraBackground";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import OverviewTab from "./tabs/OverviewTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import TasksTab from "./tabs/TasksTab";
import FocusTab from "./tabs/FocusTab";
import RecoveryTab from "./tabs/RecoveryTab";
import SimulatorTab from "./tabs/SimulatorTab";
import { NAV_ITEMS } from "./nav";

const TABS = {
  overview: OverviewTab,
  analytics: AnalyticsTab,
  tasks: TasksTab,
  focus: FocusTab,
  recovery: RecoveryTab,
  simulator: SimulatorTab,
};

function MobileNav() {
  const { activeTab, setActiveTab } = useHealth();
  return (
    <div className="px-4 pt-3 md:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {NAV_ITEMS.map(({ id, short, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
                active
                  ? "bg-slate-900 text-white shadow-md"
                  : "border border-white/60 bg-white/70 text-slate-500 backdrop-blur-xl"
              }`}
            >
              <Icon size={14} />
              {short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Shell() {
  const { activeTab } = useHealth();
  const Tab = TABS[activeTab] ?? OverviewTab;

  return (
    <div className="min-h-screen">
      <AuroraBackground />
      <div className="relative z-10 mx-auto flex max-w-[1400px]">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header />
          <MobileNav />
          <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">
            <div key={activeTab} className="animate-fade-slide">
              <Tab />
            </div>
          </main>
          <footer className="px-8 pb-8 text-center text-xs font-medium text-slate-400">
            EduHealth AI · Phase 1 — simulated demo data
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HealthProvider>
      <Shell />
    </HealthProvider>
  );
}
