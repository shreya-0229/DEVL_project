# EduHealth AI

An integrated behavioral health, adaptive productivity, and recovery platform for students.

## Phase 1 — Foundation

- Canvas glassmorphism theme: aurora gradient orbs, neon stress-zone accent system, Plus Jakarta Sans, Lucide icons
- Global React Context state engine: biometrics (`stressScore`, `hrv`, `gsr`, `co2`, computed `criScore`) + Google Classroom mock array
- Navigation: 6-tab sidebar with glowing active indicators + global header (BLE status, cognitive battery, profile)
- **Command Overview**: welcome banner, 3D spherical CRI gauge, 4 metric cards, "DO THIS FIRST" priority hero, peer accountability ticker
- **Task Manager**: priority-ranked classroom tasks with check-off and focus routing
- **Focus Mode**: 2-minute micro-commitment timer with progress ring
- **Demo Simulator**: live sliders + presets driving every screen in real time
- **Bio-Stress Analytics** & **Recovery & YouTube Hub**: Phase 2 placeholders with live-state teaser widgets

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Phase 2 — Analytics & Back-Scheduler

- **Bio-Stress Analytics**: Three.js 3D spatial scatter (stress × HRV × energy, hover tooltips), rotating wireframe brain mesh with stress-reactive color, 24×7 circadian heatmap, Recharts 24h dual-axis recovery curves, cognitive time donut, 5-point wellness radar, AI insights
- **Task Manager & Back-Scheduler**: Classroom sync simulation, per-task time budgeting (presets + slider) with live daily total, 3-column smart prioritizer (Do Right Now / Quick Wins / stress-activated Audio Queue), back-scheduler modal with draggable milestone handles

## Phase 4 — Simulator, Routing & Motion

- **Demo & Sensor Simulator**: presentation banner, 3 one-click biometric presets (Flow State / Exam Overwhelm / Late Night Burnout) with cross-tab effects (audio auto-conversion, YouTube category routing), live Stress/HRV/CO₂ sliders, smart YouTube recommendation router badge (stress slider drives Tab 5's category live)
- **Motion & navigation**: Framer Motion page transitions on every tab, spring-animated mobile navigation drawer, light glassmorphism theme throughout

## Phase 5 — Procrastination Lab, Correlation Analytics & More 3D

- **Procrastination Lab (new tab)**: live Procrastination Risk Score (animated ring, responds to stress + task state), study streak, crunch-zone counter, "Eat the Frog" hardest-task card, per-task delay-cause diagnosis (overwhelm / perfectionism / boredom / distraction / unclear / low-energy) with one-tap correction, crunch-index meters, milestone decomposition, 6-action Nudge Action Center (2-min kickoff → Focus Mode, decompose, if-then plan builder, good-enough draft mode, self-compassion reset, temptation bundling), nudge effectiveness log
- **3D Procrastination Landscape**: Three.js urgency × effort × aversiveness task nodes, color-coded by delay cause, hover delay profiles, pulsing most-urgent ring, red "danger zone" floor
- **Analytics upgrades**: 3D Stress Towers (7 days × 3 dayparts, height + color = stress), Correlation Lab (Pearson r + regression trendline across 30 days for sleep→focus, screen→stress, study→focus, HRV→focus with behavioral insights)
- **Charts**: 14-day crunch-index area, planned-vs-started intention–action gap bars, delay-cause donut
