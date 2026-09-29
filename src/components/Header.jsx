import { Bluetooth, BatteryMedium } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 px-4 pt-4 md:px-8">
      <div className="glass-card flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <Bluetooth size={14} />
            <span className="hidden sm:inline">BLE Connected</span>
            <span className="sm:hidden">BLE</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-700">
            <BatteryMedium size={16} className="text-emerald-500" />
            82%
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-slate-900">Alex Chen</p>
            <p className="text-xs font-medium text-slate-500">Student · Cohort A</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25">
            AC
          </div>
        </div>
      </div>
    </header>
  );
}
