export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50" aria-hidden="true">
      <div className="animate-drift absolute -left-32 -top-32 h-[34rem] w-[34rem]">
        <div className="h-full w-full rounded-full bg-cyan-300/40 blur-3xl animate-pulse" />
      </div>
      <div className="animate-drift absolute -right-40 top-1/3 h-[38rem] w-[38rem] [animation-delay:1000ms]">
        <div className="h-full w-full rounded-full bg-violet-400/30 blur-3xl animate-pulse [animation-delay:1000ms]" />
      </div>
      <div className="animate-drift absolute -bottom-40 left-1/4 h-[32rem] w-[32rem] [animation-delay:2000ms]">
        <div className="h-full w-full rounded-full bg-emerald-300/30 blur-3xl animate-pulse [animation-delay:2000ms]" />
      </div>
    </div>
  );
}
