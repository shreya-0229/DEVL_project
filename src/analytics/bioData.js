/** Deterministic pseudo-random in [0, 1) — stable across renders. */
export function prand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function hexLerp(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const pc = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${pc.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Circadian intensity 0..1 for a day (0=Mon..6=Sun) and hour (0..23). */
export function circadianValue(day, hour) {
  const r = prand(day * 131 + hour * 17 + 7);
  const shift = day >= 5 ? 2 : 0; // weekends run later
  if (hour < 6 || hour >= 23) return 0.04 + r * 0.08; // deep rest
  if (hour >= 6 && hour < 8) return 0.22 + r * 0.14; // wake ramp
  if (hour >= 9 + shift && hour < 12 + shift) return 0.55 + r * 0.18; // peak focus
  if (hour >= 12 && hour < 14) return 0.38 + r * 0.14;
  if (hour >= 14 && hour < 17) return 0.48 + r * 0.2;
  if (hour >= 17 && hour < 19) return 0.35 + r * 0.15;
  if (hour >= 20 && hour < 22) return r > 0.5 ? 0.82 + r * 0.16 : 0.45 + r * 0.2; // evening spikes
  return 0.28 + r * 0.16;
}

/** deep indigo (rest) → electric cyan (focus) → glowing rose (stress spike) */
export function heatColor(t) {
  const c = Math.max(0, Math.min(1, t));
  if (c < 0.5) return hexLerp("#1E1B4B", "#06B6D4", c * 2);
  return hexLerp("#06B6D4", "#F43F5E", (c - 0.5) * 2);
}

/** 24 hourly points: stress spikes, HRV recovery, focus quality. */
export function dailySeries() {
  return Array.from({ length: 24 }, (_, h) => {
    const r1 = prand(h * 3 + 1);
    const r2 = prand(h * 5 + 2);
    const r3 = prand(h * 7 + 3);
    const spike = (c, w, a) => a * Math.exp(-((h - c) ** 2) / w);
    const stress = Math.max(
      5,
      Math.min(
        98,
        26 +
          16 * Math.sin(((h - 8) * Math.PI) / 12) +
          spike(10, 2, 30) +
          spike(16, 3, 24) +
          spike(21, 2, 20) +
          (r1 - 0.5) * 6
      )
    );
    const hrv = Math.max(25, Math.min(100, 90 - stress * 0.5 + (r2 - 0.5) * 8));
    const focus = Math.max(
      5,
      Math.min(100, 96 - Math.abs(stress - 30) * 1.05 + (r3 - 0.5) * 10)
    );
    return {
      hour: `${h}:00`,
      stress: +stress.toFixed(1),
      hrv: +hrv.toFixed(1),
      focus: +focus.toFixed(1),
    };
  });
}

export const CLUSTER_LABEL = {
  flow: "Flow State",
  fatigue: "Moderate Fatigue",
  acute: "Acute Stress",
};

/** 3D scatter nodes clustered by health state. */
export function scatterNodes() {
  const clusters = [
    { key: "flow", color: "#10B981", n: 22, s: [8, 32], h: [68, 100], e: [62, 100] },
    { key: "fatigue", color: "#F59E0B", n: 20, s: [38, 62], h: [42, 66], e: [32, 62] },
    { key: "acute", color: "#F43F5E", n: 18, s: [68, 96], h: [20, 42], e: [8, 35] },
  ];
  const nodes = [];
  let id = 0;
  clusters.forEach((c, ci) => {
    for (let i = 0; i < c.n; i++) {
      const r1 = prand(id * 13 + ci * 101);
      const r2 = prand(id * 29 + ci * 37 + 5);
      const r3 = prand(id * 47 + ci * 11 + 9);
      nodes.push({
        id: id++,
        cluster: c.key,
        label: CLUSTER_LABEL[c.key],
        color: c.color,
        stress: Math.round(c.s[0] + (c.s[1] - c.s[0]) * r1),
        hrv: Math.round(c.h[0] + (c.h[1] - c.h[0]) * r2),
        energy: Math.round(c.e[0] + (c.e[1] - c.e[0]) * r3),
      });
    }
  });
  return nodes;
}
