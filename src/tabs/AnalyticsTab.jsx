import { Activity, Sparkles, Moon, Sun, BatteryCharging } from "lucide-react";
import { useHealth } from "../store/HealthContext";
import Scatter3D from "../analytics/Scatter3D";
import BrainMesh from "../analytics/BrainMesh";
import CircadianHeatmap from "../analytics/CircadianHeatmap";
import BioLineChart from "../analytics/BioLineChart";
import TimeDonut from "../analytics/TimeDonut";
import WellnessRadar from "../analytics/WellnessRadar";
import StressTowers3D from "../analytics/StressTowers3D";
import CorrelationLab from "../analytics/CorrelationLab";

function SectionCard({ index, title, sub, children, className = "" }) {
  return (
    <div className={`glass-card p-5 md:p-6 ${className}`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-xs font-black text-white shadow-md shadow-indigo-500/25">
          {index}
        </span>
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-slate-900 md:text-lg">
            {title}
          </h2>
          {sub && <p className="mt-0.5 text-xs font-medium text-slate-500">{sub}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function AnalyticsTab() {
  const { stressScore, hrv, zone } = useHealth();

  const insights = [
    {
      icon: zone.id === "acute" ? Moon : Sun,
      tint: zone.id === "acute" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600",
      title:
        zone.id === "acute"
          ? "Stress is elevated — the Audio Queue in Task Manager is now active."
          : zone.id === "moderate"
            ? "Tension is moderate — keep sessions under 25 minutes today."
            : "Recovery is high — this is your deep-work window.",
    },
    {
      icon: BatteryCharging,
      tint: "bg-emerald-50 text-emerald-600",
      title:
        hrv >= 60
          ? `HRV at ${Math.round(hrv)} ms signals strong recovery. Load up cognitively.`
          : `HRV at ${Math.round(hrv)} ms is depressed. Prioritize sleep tonight.`,
    },
    {
      icon: Sparkles,
      tint: "bg-cyan-50 text-cyan-600",
      title: "Peak focus window detected: 9 AM – 12 PM. Schedule dense tasks there.",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-6 md:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
          <Activity size={13} /> Deep biometric intelligence
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          Bio-Stress Analytics
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm font-medium text-slate-500">
          Eight visual models of your physiology — spatial clustering, neural state,
          circadian rhythm, recovery curves, time allocation, holistic wellness, 3D stress
          towers, and a correlation lab.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          index="1"
          title="3D Spatial Scatter"
          sub="Stress × HRV × Cognitive Energy clusters"
          className="lg:col-span-2"
        >
          <Scatter3D />
        </SectionCard>
        <SectionCard index="2" title="Neural State Mesh" sub="Live wireframe · color follows stress">
          <BrainMesh stressScore={stressScore} />
          <p className="mt-2 text-center text-xs font-medium leading-relaxed text-slate-500">
            Emerald below 35% · Amber 36–65% · Rose above 65%. Tune it live in the Demo
            Simulator.
          </p>
        </SectionCard>
      </div>

      <SectionCard
        index="3"
        title="Circadian Heatmap"
        sub="24 hours × 7 days · rest → focus → stress spikes"
      >
        <CircadianHeatmap />
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          index="4"
          title="24-Hour Recovery Curves"
          sub="Stress spikes · HRV recovery · Focus quality"
          className="lg:col-span-2"
        >
          <BioLineChart />
        </SectionCard>
        <SectionCard index="5" title="Cognitive Time" sub="How the last 24h were spent">
          <TimeDonut />
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard index="6" title="Holistic Wellness" sub="5-point spider radar">
          <WellnessRadar />
        </SectionCard>
        <div className="glass-card p-5 md:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-md shadow-pink-500/25">
              <Sparkles size={16} />
            </span>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 md:text-lg">
              AI Insights
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {insights.map(({ icon: Icon, tint, title }, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tint}`}>
                  <Icon size={18} />
                </span>
                <p className="text-sm font-semibold leading-relaxed text-slate-700">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionCard
        index="7"
        title="3D Stress Towers"
        sub="7 days × morning / afternoon / night · bar height = stress intensity"
      >
        <StressTowers3D />
      </SectionCard>

      <SectionCard
        index="8"
        title="Correlation Lab"
        sub="Pearson r across 30 days · pick a pair, read the relationship"
      >
        <CorrelationLab />
      </SectionCard>
    </div>
  );
}
