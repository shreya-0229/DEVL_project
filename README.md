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
