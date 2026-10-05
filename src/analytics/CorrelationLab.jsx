import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Sigma } from "lucide-react";
import {
  correlationSeries,
  pearson,
  corrStrength,
  CORR_PAIRS,
} from "./procData";

function linreg(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0,
    den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den ? num / den : 0;
  return { slope, intercept: my - slope * mx };
}

function fmt(v) {
  const a = Math.abs(v);
  if (a >= 100) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

/**
 * 3D correlation scatter: x = first metric, y = second metric, z = day (1-30).
 * Spheres float above a floor grid; the regression trend rides through them.
 */
export default function CorrelationLab() {
  const [pairId, setPairId] = useState(CORR_PAIRS[0].id);
  const pair = CORR_PAIRS.find((p) => p.id === pairId);

  const model = useMemo(() => {
    const series = correlationSeries();
    const xs = series.map((s) => s[pair.x]);
    const ys = series.map((s) => s[pair.y]);
    const rr = pearson(xs, ys);
    const { slope, intercept } = linreg(xs, ys);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const padX = (maxX - minX) * 0.08 || 1;
    const padY = (maxY - minY) * 0.12 || 1;
    return {
      points: series.map((s, i) => ({ x: s[pair.x], y: s[pair.y], day: i + 1 })),
      r: rr,
      slope,
      intercept,
      xDomain: [minX - padX, maxX + padX],
      yDomain: [minY - padY, maxY + padY],
    };
  }, [pair]);

  const strength = corrStrength(model.r);
  const dir = model.r >= 0 ? "positive" : "negative";

  const mountRef = useRef(null);
  const [tip, setTip] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const HEIGHT = 300;
    const width = mount.clientWidth || 600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / HEIGHT, 0.1, 300);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, HEIGHT);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7;

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(8, 14, 6);
    scene.add(dir);

    const world = new THREE.Group();
    scene.add(world);

    // scene-space mapping
    const X0 = -6,
      X1 = 6; // x metric
    const Y0 = 0.4,
      Y1 = 7.6; // y metric
    const Z0 = -5,
      Z1 = 5; // day 1..30
    const sx = (v) =>
      X0 + ((v - model.xDomain[0]) / (model.xDomain[1] - model.xDomain[0])) * (X1 - X0);
    const sy = (v) =>
      Y0 + ((v - model.yDomain[0]) / (model.yDomain[1] - model.yDomain[0])) * (Y1 - Y0);
    const sz = (day) => Z0 + ((day - 1) / 29) * (Z1 - Z0);

    const grid = new THREE.GridHelper(16, 8, 0x94a3b8, 0xe2e8f0);
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    world.add(grid);

    // axes
    const axisMat = new THREE.LineBasicMaterial({ color: 0x94a3b8 });
    const axes = [
      [new THREE.Vector3(-7.2, 0.01, 0), new THREE.Vector3(7.2, 0.01, 0)],
      [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 8.6, 0)],
      [new THREE.Vector3(0, 0.01, -6), new THREE.Vector3(0, 0.01, 6)],
    ];
    axes.forEach(([a, b]) => {
      world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), axisMat));
    });

    // axis labels as canvas sprites
    const texes = [];
    const labelTex = (text, color = "#64748B", size = 26) => {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 56;
      const g = c.getContext("2d");
      g.font = `700 ${size}px system-ui`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = color;
      g.fillText(text, 128, 28);
      const t = new THREE.CanvasTexture(c);
      texes.push(t);
      return t;
    };
    const addLabel = (text, pos, scale = 1, color) => {
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: labelTex(text, color), transparent: true, depthWrite: false })
      );
      sp.scale.set(3.4 * scale, 0.75 * scale, 1);
      sp.position.copy(pos);
      world.add(sp);
    };
    addLabel(pair.xLabel, new THREE.Vector3(7.2, 0.9, 0), 1, pair.color);
    addLabel(pair.yLabel, new THREE.Vector3(0, 9.2, 0), 1, pair.color);
    addLabel("Day 1 → 30", new THREE.Vector3(0, 0.9, 6.4), 0.9);

    // scatter spheres
    const spheres = [];
    const sphGeo = new THREE.SphereGeometry(0.24, 20, 20);
    model.points.forEach((p) => {
      const mat = new THREE.MeshStandardMaterial({
        color: pair.color,
        roughness: 0.3,
        metalness: 0.15,
        transparent: true,
        opacity: 0.9,
      });
      const s = new THREE.Mesh(sphGeo, mat);
      s.position.set(sx(p.x), sy(p.y), sz(p.day));
      s.userData.node = p;
      world.add(s);
      spheres.push(s);
    });

    // regression trend line through the cloud (at mid-depth)
    const yAt = (xv) => model.slope * xv + model.intercept;
    const trend = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(X0, sy(yAt(model.xDomain[0])), 0),
        new THREE.Vector3(X1, sy(yAt(model.xDomain[1])), 0),
      ]),
      new THREE.LineBasicMaterial({ color: 0x0f172a })
    );
    world.add(trend);

    // Fit the camera to the scene so the scatter fills the frame on any screen
    const bbox = new THREE.Box3().setFromObject(world);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera.fov * Math.PI) / 180;
    const fitH = maxDim / (2 * Math.tan(fov / 2));
    const fitW = fitH / camera.aspect;
    const dist = 1.3 * Math.max(fitH, fitW);
    const viewDir = new THREE.Vector3(0.9, 0.55, 1).normalize();
    camera.position.copy(center).addScaledVector(viewDir, dist);
    camera.near = dist / 100;
    camera.far = dist * 100;
    camera.updateProjectionMatrix();
    controls.target.copy(center);
    controls.update();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered = null;
    const onMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(spheres);
      if (hits.length) {
        const s = hits[0].object;
        if (hovered && hovered !== s) hovered.scale.set(1, 1, 1);
        hovered = s;
        hovered.scale.set(1.5, 1.5, 1.5);
        const mRect = mount.getBoundingClientRect();
        setTip({
          x: e.clientX - mRect.left,
          y: e.clientY - mRect.top,
          node: s.userData.node,
        });
        mount.style.cursor = "pointer";
      } else {
        if (hovered) {
          hovered.scale.set(1, 1, 1);
          hovered = null;
        }
        setTip(null);
        mount.style.cursor = "grab";
      }
    };
    const onLeave = () => {
      if (hovered) {
        hovered.scale.set(1, 1, 1);
        hovered = null;
      }
      setTip(null);
      mount.style.cursor = "grab";
    };
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerleave", onLeave);

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      camera.aspect = w / HEIGHT;
      camera.updateProjectionMatrix();
      renderer.setSize(w, HEIGHT);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      controls.dispose();
      scene.traverse((o) => {
        if (o.geometry && o.geometry !== sphGeo) o.geometry.dispose();
        if (o.material)
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            m.dispose()
          );
      });
      sphGeo.dispose();
      texes.forEach((t) => t.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair.id, model]);

  const tipLeft = tip
    ? Math.min(Math.max(tip.x, 110), (mountRef.current?.clientWidth ?? 400) - 110)
    : 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {CORR_PAIRS.map((p) => {
          const on = p.id === pairId;
          return (
            <button
              key={p.id}
              onClick={() => setPairId(p.id)}
              className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
                on
                  ? "text-white shadow-md"
                  : "border border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
              }`}
              style={on ? { background: p.color } : undefined}
            >
              {p.xLabel} → {p.yLabel}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative">
            <div
              ref={mountRef}
              className="h-[300px] w-full cursor-grab overflow-hidden rounded-2xl bg-slate-50/60"
            />
            <div className="pointer-events-none absolute bottom-3 left-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              30 days · drag to orbit
            </div>
            {tip && (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-white/60 bg-white/90 px-3 py-1.5 shadow-xl backdrop-blur-xl"
                style={{ left: tipLeft, top: tip.y - 8 }}
              >
                <p className="whitespace-nowrap text-xs font-extrabold text-slate-900">
                  Day {tip.node.day}: {pair.xLabel} {fmt(tip.node.x)},{" "}
                  {pair.yLabel} {fmt(tip.node.y)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-2xl bg-slate-50 p-5">
          <span
            className="grid h-10 w-10 place-items-center rounded-xl text-white shadow-md"
            style={{ background: pair.color }}
          >
            <Sigma size={18} />
          </span>
          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Pearson r · 30 days
          </p>
          <p className="text-4xl font-black tabular-nums tracking-tight text-slate-900">
            {model.r >= 0 ? "+" : ""}
            {model.r.toFixed(2)}
          </p>
          <p className="mt-1 text-xs font-extrabold" style={{ color: pair.color }}>
            {strength} {dir} correlation
          </p>
          <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
            {pair.insight}
          </p>
        </div>
      </div>
    </div>
  );
}
