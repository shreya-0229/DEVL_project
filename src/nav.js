import {
  LayoutDashboard,
  Activity,
  ListChecks,
  Zap,
  HeartPulse,
  SlidersHorizontal,
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "overview", label: "Command Overview", short: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Bio-Stress Analytics", short: "Analytics", icon: Activity },
  { id: "tasks", label: "Task Manager", short: "Tasks", icon: ListChecks },
  { id: "focus", label: "Focus Mode", short: "Focus", icon: Zap },
  { id: "recovery", label: "Recovery & YouTube Hub", short: "Recovery", icon: HeartPulse },
  { id: "simulator", label: "Demo Simulator", short: "Simulator", icon: SlidersHorizontal },
];
