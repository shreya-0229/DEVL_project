import { useHealth } from "../store/HealthContext";

const W = 420;
const H = 330;
const CX = 210;
const CY = 162;
const R = 112;

function vertex(i, n, radius) {
  const a = (Math.PI / 180) * (-90 + (i * 360) / n);
  return [CX + radius * Math.cos(a), CY + radius * Math.sin(a)];
}

function ringPath(frac, n) {
  return Array.from({ length: n }, (_, i) => vertex(i, n, R * frac))
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ") + " Z";
}

export default function WellnessRadar() {
  const { hrv, co2, tasks } = useHealth();
  const done = tasks.filter((t) => t.done).length;

  const data = [
    { axis: "Sleep Quality", value: 78 },
    { axis: "Ergonomics", value: 72 },
    { axis: "HRV Stability", value: Math.round(Math.max(20, Math.min(100, hrv))) },
    { axis: "LMS Progress", value: Math.min(99, 35 + done * 16) },
    {
      axis: "Air Quality",
      value: Math.round(Math.max(10, Math.min(100, 100 - (co2 - 400) / 16))),
    },
  ];
  const n = data.length;

  const poly = data
    .map((d, i) => {
      const [x, y] = vertex(i, n, (R * d.value) / 100);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ") + " Z";

  return (
    <div className="h-[300px] w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Holistic wellness radar"
      >
        <defs>
          <radialGradient id="wr-fill" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.18" />
          </radialGradient>
        </defs>

        {/* grid rings */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <path
            key={f}
            d={ringPath(f, n)}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={f === 1 ? 1.5 : 1}
          />
        ))}

        {/* spokes + labels */}
        {data.map((d, i) => {
          const [x2, y2] = vertex(i, n, R);
          const [lx, ly] = vertex(i, n, R * 1.24);
          return (
            <g key={d.axis}>
              <line x1={CX} y1={CY} x2={x2} y2={y2} stroke="#E2E8F0" strokeWidth={1} />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={11}
                fontWeight={700}
                fill="#64748B"
              >
                {d.axis}
              </text>
              <text
                x={lx}
                y={ly + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fontWeight={800}
                fill="#8B5CF6"
              >
                {d.value}
              </text>
            </g>
          );
        })}

        {/* data polygon */}
        <path d={poly} fill="url(#wr-fill)" stroke="#8B5CF6" strokeWidth={2.5} strokeLinejoin="round" />

        {/* vertex dots */}
        {data.map((d, i) => {
          const [x, y] = vertex(i, n, (R * d.value) / 100);
          return (
            <g key={d.axis}>
              <circle cx={x} cy={y} r={5} fill="#8B5CF6" stroke="#fff" strokeWidth={2}>
                <title>{`${d.axis}: ${d.value}/100`}</title>
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
