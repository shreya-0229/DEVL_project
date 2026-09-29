import { createContext, useContext, useMemo, useState } from "react";

const HealthContext = createContext(null);

/**
 * Stress-zone accent system (0–100 stressScore scale)
 * flow:     0–35  → neon emerald & cyan
 * moderate: 36–65 → radiant gold & amber
 * acute:    66–100 → sunset rose & crimson
 */
export const ZONES = {
  flow: {
    id: "flow",
    label: "Flow State Ready",
    range: "0–35%",
    gradient: "from-emerald-400 to-cyan-500",
    text: "text-emerald-600",
    ring: "#10B981",
    glow: "rgba(16,185,129,0.45)",
    sphere: ["#6EE7B7", "#06B6D4"],
    advice: "Peak focus capacity. Schedule deep work now.",
  },
  moderate: {
    id: "moderate",
    label: "Moderate Tension",
    range: "36–65%",
    gradient: "from-amber-400 to-orange-500",
    text: "text-amber-600",
    ring: "#F59E0B",
    glow: "rgba(245,158,11,0.45)",
    sphere: ["#FCD34D", "#F97316"],
    advice: "Steady capacity. Work in short sprints with breaks.",
  },
  acute: {
    id: "acute",
    label: "High Tension Alert",
    range: "66–100%",
    gradient: "from-rose-500 to-red-600",
    text: "text-rose-600",
    ring: "#F43F5E",
    glow: "rgba(244,63,94,0.45)",
    sphere: ["#FDA4AF", "#E11D48"],
    advice: "Capacity is low. Recover first, then re-engage.",
  },
};

const initialTasks = [
  {
    id: 1,
    course: "MATH 201",
    title: "Problem Set 4: Multi-Variable Calculus",
    dueDate: "Today, 11:59 PM",
    format: "8 Exercises",
    userTimeMins: 45,
    budgetMins: 45,
    priorityScore: 95,
    done: false,
    icon: "book",
  },
  {
    id: 2,
    course: "CS 102",
    title: "Lab 3: Sorting Algorithm Benchmarks",
    dueDate: "Tomorrow, 5:00 PM",
    format: "Code Submission",
    userTimeMins: 30,
    budgetMins: 30,
    priorityScore: 80,
    done: false,
    icon: "code",
  },
  {
    id: 3,
    course: "PHYS 150",
    title: "Chapter 4: Kinematics Reading",
    dueDate: "In 2 Days",
    format: "22-Page Chapter",
    userTimeMins: 15,
    budgetMins: 15,
    priorityScore: 60,
    done: false,
    isAudioConverted: true,
    icon: "audio",
  },
  {
    id: 4,
    course: "ENG 101",
    title: "Research Paper Draft Outline",
    dueDate: "In 4 Days",
    format: "Essay Draft",
    userTimeMins: 60,
    budgetMins: 60,
    priorityScore: 40,
    done: false,
    icon: "doc",
  },
];

export function HealthProvider({ children }) {
  const [stressScore, setStressScore] = useState(38);
  const [hrv, setHrv] = useState(65);
  const [gsr, setGsr] = useState(3.2);
  const [co2, setCo2] = useState(780);
  const [tasks, setTasks] = useState(initialTasks);
  const [focusTaskId, setFocusTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [focusLockout, setFocusLockout] = useState(false);

  // Cognitive Readiness Index: computed, 100 - stressScore
  const criScore = useMemo(
    () => Math.max(0, Math.min(100, Math.round(100 - stressScore))),
    [stressScore]
  );

  const zone =
    stressScore <= 35 ? ZONES.flow : stressScore <= 65 ? ZONES.moderate : ZONES.acute;

  const priorityTasks = useMemo(
    () => [...tasks].sort((a, b) => b.priorityScore - a.priorityScore),
    [tasks]
  );

  const focusTask = tasks.find((t) => t.id === focusTaskId) || null;

  const toggleTask = (id) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const setBudgetMins = (id, mins) =>
    setTasks((ts) =>
      ts.map((t) =>
        t.id === id
          ? { ...t, budgetMins: Math.max(5, Math.min(180, Math.round(mins))) }
          : t
      )
    );

  const startFocus = (id) => {
    setFocusTaskId(id);
    setActiveTab("focus");
  };

  const resetBiometrics = () => {
    setStressScore(38);
    setHrv(65);
    setGsr(3.2);
    setCo2(780);
  };

  const value = {
    stressScore,
    setStressScore,
    hrv,
    setHrv,
    gsr,
    setGsr,
    co2,
    setCo2,
    criScore,
    zone,
    tasks,
    priorityTasks,
    toggleTask,
    setBudgetMins,
    focusTask,
    focusTaskId,
    startFocus,
    activeTab,
    setActiveTab,
    focusLockout,
    setFocusLockout,
    resetBiometrics,
  };

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export const useHealth = () => {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error("useHealth must be used within HealthProvider");
  return ctx;
};
