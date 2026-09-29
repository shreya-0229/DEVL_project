import { Fragment } from "react";
import { circadianValue, heatColor } from "./bioData";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CircadianHeatmap() {
  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: "44px repeat(24, 1fr)" }}
          >
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="text-center text-[9px] font-bold text-slate-400"
              >
                {h % 3 === 0 ? h : ""}
              </div>
            ))}
            {DAYS.map((d, day) => (
              <Fragment key={d}>
                <div className="flex items-center text-[10px] font-extrabold text-slate-500">
                  {d}
                </div>
                {Array.from({ length: 24 }, (_, h) => {
                  const t = circadianValue(day, h);
                  const color = heatColor(t);
                  return (
                    <div
                      key={h}
                      title={`${d} ${h}:00 — intensity ${Math.round(t * 100)}%`}
                      className="aspect-square rounded-[4px] transition-transform hover:scale-125"
                      style={{
                        background: color,
                        boxShadow: t > 0.75 ? `0 0 10px ${color}` : "none",
                      }}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="text-[10px] font-bold text-slate-400">REST</span>
        <div
          className="h-2 w-48 rounded-full"
          style={{
            background: "linear-gradient(90deg, #1E1B4B, #06B6D4, #F43F5E)",
          }}
        />
        <span className="text-[10px] font-bold text-slate-400">STRESS SPIKE</span>
      </div>
    </div>
  );
}
