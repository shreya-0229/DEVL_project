import { AnimatePresence, motion } from "framer-motion";
import { HealthProvider, useHealth } from "./store/HealthContext";
import AuroraBackground from "./components/AuroraBackground";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MobileDrawer from "./components/MobileDrawer";
import OverviewTab from "./tabs/OverviewTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import TasksTab from "./tabs/TasksTab";
import FocusTab from "./tabs/FocusTab";
import RecoveryTab from "./tabs/RecoveryTab";
import SimulatorTab from "./tabs/SimulatorTab";

const TABS = {
  overview: OverviewTab,
  analytics: AnalyticsTab,
  tasks: TasksTab,
  focus: FocusTab,
  recovery: RecoveryTab,
  simulator: SimulatorTab,
};

function TabTransition({ tabKey, children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function Shell() {
  const { activeTab, focusLockout } = useHealth();
  const Tab = TABS[activeTab] ?? OverviewTab;

  // Deep Focus Lockout: hide all chrome for zero distractions
  if (focusLockout) {
    return (
      <div className="min-h-screen">
        <AuroraBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
          <div className="w-full max-w-2xl">
            <TabTransition tabKey={activeTab}>
              <Tab />
            </TabTransition>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AuroraBackground />
      <div className="relative z-10 mx-auto flex max-w-[1400px]">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header />
          <MobileDrawer />
          <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">
            <TabTransition tabKey={activeTab}>
              <Tab />
            </TabTransition>
          </main>
          <footer className="px-8 pb-8 text-center text-xs font-medium text-slate-400">
            EduHealth AI · simulated demo data
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
