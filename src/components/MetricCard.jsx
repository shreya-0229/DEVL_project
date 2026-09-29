export default function MetricCard({ icon: Icon, label, value, unit, sub, accent }) {
  return (
    <div className="glass-card group p-5 hover:-translate-y-0.5">
      <div className={`grid h-10 w-10 place-items-center rounded-2xl ${accent.tile}`}>
        <Icon size={20} className={accent.icon} />
      </div>
      <p className="mt-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
        {value}
        <span className="ml-1 text-base font-bold text-slate-400">{unit}</span>
      </p>
      <p className={`mt-1 text-xs font-bold ${accent.text}`}>{sub}</p>
    </div>
  );
}
