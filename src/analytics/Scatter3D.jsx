import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { scatterNodes } from "./bioData";

const LEGEND = [
  ["#10B981", "Flow State"],
  ["#F59E0B", "Moderate Fatigue"],
  ["#F43F5E", "Acute Stress"],
];

export default function Scatter3D() {
  const mountRef = useRef(null);
  const [tip, setTip] = useState(null); // { x, y, node }

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const HEIGHT = 420;
    const width = mount.clientWidth;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / HEIGHT, 0.1, 200);
    camera.position.set(16, 10, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, HEIGHT);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.9;

    // Bounding box + floor grid
    const box = new THREE.Box3(
      new THREE.Vector3(-10, -2, -10),
      new THREE.Vector3(10, 10, 10)
    );
    const boxHelper = new THREE.Box3Helper(box, 0xcbd5e1);
    boxHelper.material.transparent = true;
    boxHelper.material.opacity = 0.5;
    scene.add(boxHelper);
    const grid = new THREE.GridHelper(20, 10, 0x94a3b8, 0xe2e8f0);
    grid.position.y = -2;
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    scene.add(grid);

    // Soft radial glow sprite texture
    const glowTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d");
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.35, "rgba(255,255,255,0.55)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();

    const toXYZ = (n) =>
      new THREE.Vector3(
        (n.stress / 100) * 20 - 10,
        ((n.hrv - 20) / 80) * 12 - 2,
        (n.energy / 100) * 20 - 10
      );

    const groups = [];
    scatterNodes().forEach((n) => {
      const group = new THREE.Group();
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 16, 16),
        new THREE.MeshBasicMaterial({ color: n.color })
      );
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTex,
          color: n.color,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
        })
      );
      glow.scale.set(1.7, 1.7, 1);
      group.add(core);
      group.add(glow);
      group.position.copy(toXYZ(n));
      group.userData.node = n;
      scene.add(group);
      groups.push(group);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered = null;

    const onMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(groups, true);
      let target = null;
      if (hits.length) {
        let g = hits[0].object;
        while (g && !g.userData.node) g = g.parent;
        target = g;
      }
      if (target) {
        if (hovered && hovered !== target) hovered.scale.setScalar(1);
        hovered = target;
        hovered.scale.setScalar(1.55);
        const mRect = mount.getBoundingClientRect();
        setTip({
          x: e.clientX - mRect.left,
          y: e.clientY - mRect.top,
          node: target.userData.node,
        });
        mount.style.cursor = "pointer";
      } else {
        if (hovered) {
          hovered.scale.setScalar(1);
          hovered = null;
        }
        setTip(null);
        mount.style.cursor = "grab";
      }
    };
    const onLeave = () => {
      if (hovered) {
        hovered.scale.setScalar(1);
        hovered = null;
      }
      setTip(null);
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
        if (o.geometry) o.geometry.dispose();
        if (o.material)
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            m.dispose()
          );
      });
      glowTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, []);

  const tipLeft = tip
    ? Math.min(Math.max(tip.x, 104), (mountRef.current?.clientWidth ?? 400) - 104)
    : 0;

  return (
    <div className="relative">
      <div
        ref={mountRef}
        className="h-[420px] w-full cursor-grab overflow-hidden rounded-2xl bg-slate-50/60"
      />
      <div className="pointer-events-none absolute bottom-3 left-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
        X · Stress Index
      </div>
      <div className="pointer-events-none absolute left-4 top-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
        Y · HRV (ms)
      </div>
      <div className="pointer-events-none absolute bottom-3 right-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
        Z · Cognitive Energy
      </div>
      <div className="pointer-events-none absolute right-4 top-3 flex flex-col gap-1.5 rounded-2xl bg-white/70 p-3 backdrop-blur-xl">
        {LEGEND.map(([c, l]) => (
          <span
            key={l}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-600"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: c, boxShadow: `0 0 8px ${c}` }}
            />
            {l}
          </span>
        ))}
      </div>
      {tip && (
        <div
          className="pointer-events-none absolute z-10 w-52 -translate-x-1/2 rounded-2xl border border-white/60 bg-white/85 p-3 shadow-xl backdrop-blur-xl"
          style={{ left: tipLeft, top: Math.max(tip.y - 138, 8) }}
        >
          <p className="text-xs font-extrabold" style={{ color: tip.node.color }}>
            {tip.node.label}
          </p>
          <div className="mt-1.5 space-y-1 text-[11px] font-semibold text-slate-500">
            <p className="flex justify-between">
              Stress <span className="font-extrabold text-slate-900">{tip.node.stress}%</span>
            </p>
            <p className="flex justify-between">
              HRV <span className="font-extrabold text-slate-900">{tip.node.hrv} ms</span>
            </p>
            <p className="flex justify-between">
              Energy <span className="font-extrabold text-slate-900">{tip.node.energy}</span>
            </p>
          </div>
        </div>
      )}
      <p className="mt-2 text-center text-[11px] font-semibold text-slate-400">
        Drag to orbit · Scroll to zoom · Hover a node for details
      </p>
    </div>
  );
}
