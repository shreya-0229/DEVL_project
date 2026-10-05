import { prand, hexLerp } from "./bioData";

/* ------------------------------------------------------------------ */
/* Procrastination cause taxonomy (from the behavioral literature)      */
/* ------------------------------------------------------------------ */

export const CAUSES = {
  overwhelm: {
    label: "Overwhelm",
    color: "#F59E0B",
    blurb: "The task feels too big to start.",
    nudges: ["Decompose into milestones", "Two-Minute Start"],
  },
  perfectionism: {
    label: "Perfectionism",
    color: "#8B5CF6",
    blurb: "Fear it won't be good enough.",
    nudges: ["Good-enough draft mode", "Self-compassion reset"],
  },
  boredom: {
    label: "Low value / boredom",
    color: "#06B6D4",
    blurb: "The task feels dull or pointless.",
    nudges: ["Temptation bundling", "Eat-the-frog ordering"],
  },
  distraction: {
    label: "Distraction",
    color: "#F43F5E",
    blurb: "Attention keeps fragmenting.",
    nudges: ["Focus mode session", "Environment reset"],
  },
  unclear: {
    label: "Unclear next step",
    color: "#64748B",
    blurb: "You don't know how to begin.",
    nudges: ["Clarification prompt", "Decompose into milestones"],
  },
  fatigue: {
    label: "Low energy",
    color: "#6366F1",
    blurb: "Your body needs rest first.",
    nudges: ["Energy-aware reschedule", "Recovery break"],
  },
};

/** Heuristic cause classification for a task (user can override per task). */
export function classifyCause(task, stressScore) {
  if (stressScore >= 75) return "fatigue";
  const hay = `${task.title} ${task.format}`;
  if (/essay|draft|paper|thesis/i.test(hay)) return "perfectionism";
  if (/reading|chapter/i.test(hay)) return "overwhelm";
  if (/lab|code|benchmark/i.test(hay)) return "unclear";
  if (task.budgetMins >= 45) return "overwhelm";
  if (task.priorityScore <= 55) return "boredom";
  return "distraction";
}

/* ------------------------------------------------------------------ */
/* Time helpers                                                        */
/* ------------------------------------------------------------------ */

/** Deterministic pseudo hours-until-due parsed from the task's dueDate label. */
export function dueHours(task) {
  const d = task.dueDate || "";
  if (/today/i.test(d)) return 8;
  if (/tomorrow/i.test(d)) return 30;
  const m = d.match(/in\s+(\d+)\s*day/i);
  if (m) return parseInt(m[1], 10) * 24 + 4;
  return 48;
}

/** 0–100: how badly remaining work fits remaining time. Higher = more crunched. */
export function crunchIndex(task) {
  const usable = dueHours(task) * 0.2; // ~20% of remaining time is studyable
  const need = (task.budgetMins || 30) / 60;
  return Math.max(0, Math.min(100, Math.round((need / Math.max(usable, 0.5)) * 100)));
}

/** 0–100 urgency from deadline proximity. */
export function urgency(task) {
  return Math.max(0, Math.min(100, Math.round(100 - (dueHours(task) / 110) * 100)));
}

/** 0–100 aversiveness heuristic. */
export function aversiveness(task) {
  const v =
    20 + task.priorityScore * 0.5 + (task.budgetMins >= 45 ? 15 : 0);
  return Math.max(5, Math.min(100, Math.round(v)));
}

/** Deterministic pseudo hours between task creation and first work session. */
export function startLatencyHours(task) {
  return Math.round(4 + prand(task.id * 77 + 3) * 60);
}

/* ------------------------------------------------------------------ */
/* Procrastination Risk Score 0–100 (live: responds to stress + tasks)  */
/* ------------------------------------------------------------------ */

export function procrastinationRisk(tasks, stressScore) {
  const open = tasks.filter((t) => !t.done);
  if (!open.length) return 8;
  const avgCrunch =
    open.reduce((s, t) => s + crunchIndex(t), 0) / open.length;
  const doneCount = tasks.length - open.length;
  let score =
    12 + open.length * 6 + avgCrunch * 0.35 + stressScore * 0.25 - doneCount * 8;
  return Math.max(5, Math.min(98, Math.round(score)));
}

export function riskBand(score) {
  if (score <= 35)
    return { label: "On track", color: "#10B981", gradient: "from-emerald-400 to-cyan-500" };
  if (score <= 65)
    return { label: "Drifting", color: "#F59E0B", gradient: "from-amber-400 to-orange-500" };
  return { label: "Crunch risk", color: "#F43F5E", gradient: "from-rose-500 to-red-600" };
}

/* ------------------------------------------------------------------ */
/* Time-series generators (deterministic)                              */
/* ------------------------------------------------------------------ */

/** 14-day crunch-index trend. */
export function crunchSeries() {
  return Array.from({ length: 14 }, (_, i) => {
    const base = 28 + 22 * Math.sin((i / 14) * Math.PI * 2.2);
    const v = Math.max(4, Math.min(96, base + (prand(i * 31 + 7) - 0.5) * 26));
    return { day: `D-${13 - i}`, crunch: Math.round(v) };
  });
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Planned vs actually-started study sessions per weekday (intention–action gap). */
export function intentionActionData() {
  return DAYS.map((day, i) => {
    const planned = 2 + Math.round(prand(i * 17 + 2) * 3);
    const actual = Math.max(0, planned - Math.round(prand(i * 41 + 9) * 2.4));
    return { day, planned, actual, gap: planned - actual };
  });
}

/** Study streak: consecutive active days ending today. */
export function studyStreak() {
  let streak = 0;
  for (let i = 0; i < 14; i++) {
    if (prand(900 + i * 13) > 0.28) streak++;
    else break;
  }
  return streak;
}

/** 7 days × 3 dayparts stress values for the 3D towers. */
export function weeklyTowers() {
  const parts = ["Morning", "Afternoon", "Night"];
  const out = [];
  DAYS.forEach((day, d) => {
    parts.forEach((part, p) => {
      const r = prand(d * 101 + p * 37 + 21);
      let v;
      if (p === 0) v = 30 + r * 30;
      else if (p === 1) v = 40 + r * 40;
      else v = r > 0.55 ? 62 + r * 30 : 30 + r * 30;
      if (d >= 5) v *= 0.75;
      out.push({ day, part, value: Math.round(Math.min(98, Math.max(6, v))) });
    });
  });
  return out;
}

/** Stress color ramp for towers: emerald → amber → rose. */
export function stressColor(v) {
  if (v < 50) return hexLerp("#10B981", "#F59E0B", v / 50);
  return hexLerp("#F59E0B", "#F43F5E", (v - 50) / 50);
}

/* ------------------------------------------------------------------ */
/* Correlation lab: 30-day metric pairs + Pearson r                    */
/* ------------------------------------------------------------------ */

export function correlationSeries() {
  return Array.from({ length: 30 }, (_, i) => {
    const r1 = prand(i * 11 + 1);
    const r2 = prand(i * 23 + 5);
    const r3 = prand(i * 37 + 9);
    const sleep = +(5.2 + r1 * 3.4).toFixed(1); // 5.2–8.6 h
    const screen = +(3 + r2 * 6.5).toFixed(1); // 3–9.5 h
    const study = +(r3 * 5.5).toFixed(1); // 0–5.5 h
    const stress = Math.round(
      Math.min(96, Math.max(12, 18 + screen * 6.5 - sleep * 4 + (r1 - 0.5) * 14))
    );
    const focus = Math.round(
      Math.min(98, Math.max(10, 30 + sleep * 7.5 - screen * 4.5 + (r2 - 0.5) * 12))
    );
    const hrv = Math.round(Math.min(100, Math.max(25, 96 - stress * 0.55 + (r3 - 0.5) * 8)));
    return { day: i + 1, sleep, screen, study, stress, focus, hrv };
  });
}

export function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0,
    dx = 0,
    dy = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
}

export const CORR_PAIRS = [
  {
    id: "sleep-focus",
    x: "sleep",
    y: "focus",
    xLabel: "Sleep (hrs)",
    yLabel: "Next-day focus",
    color: "#8B5CF6",
    insight:
      "Each extra hour of sleep is associated with markedly higher next-day focus. Protecting sleep is the highest-leverage anti-procrastination move.",
  },
  {
    id: "screen-stress",
    x: "screen",
    y: "stress",
    xLabel: "Screen time (hrs)",
    yLabel: "Stress index",
    color: "#F43F5E",
    insight:
      "Heavy screen days reliably precede higher stress. Capping recreational screen time is a direct lever on both stress and task avoidance.",
  },
  {
    id: "study-focus",
    x: "study",
    y: "focus",
    xLabel: "Study hours",
    yLabel: "Focus quality",
    color: "#06B6D4",
    insight:
      "More study hours correlate with better focus quality — a virtuous cycle: starting builds the focus that starting requires.",
  },
  {
    id: "hrv-focus",
    x: "hrv",
    y: "focus",
    xLabel: "HRV (ms)",
    yLabel: "Focus quality",
    color: "#10B981",
    insight:
      "Higher HRV (better recovery) predicts sharper focus. Recovery isn't the opposite of productivity — it's the foundation of it.",
  },
];

export function corrStrength(r) {
  const a = Math.abs(r);
  if (a >= 0.7) return "strong";
  if (a >= 0.4) return "moderate";
  if (a >= 0.2) return "weak";
  return "negligible";
}
