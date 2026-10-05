import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  CAUSES,
  urgency,
  aversiveness,
  crunchIndex,
  startLatencyHours,
} from "./procData";

/**
 * 3D "procrastination landscape": every open task is a glowing node.
 * X = urgency (deadline proximity) · Y = effort (budgeted minutes) · Z = aversiveness.
 * Color = detected procrastination cause.
 */
export default function ProcLandscape3D({ tasks, causes }) {
  const mountRef = useRef(null);
  const [tip, setTip] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const HEIGHT = 420;
    const width = mount.clientWidth;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / HEIGHT, 0.1, 200);
    camera.position.set(15, 11, 17);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, HEIGHT);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;

    const box = new THREE.Box3(
      new THREE.Vector3(-10, -2, -10),
      new THREE.Vector3(10, 12, 10)
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

    // "danger zone" translucent plane: high urgency + high aversiveness corner
    const danger = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,
      })
    );
    danger.rotation.x = -Math.PI / 2;
    danger.position.set(5, -1.9, 5);
    scene.add(danger);

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

    const open = tasks.filter((t) => !t.done);
    const toXYZ = (t) =>
      new THREE.Vector3(
        (urgency(t) / 100) * 20 - 10,
        ((t.budgetMins || 30) / 180) * 12 - 1,
        (aversiveness(t) / 100) * 20 - 10
      );

    const groups = [];
    open.forEach((t) => {
      const cause = causes[t.id];
      const color = CAUSES[cause].color;
      const size = 0.42 + ((t.budgetMins || 30) / 180) * 0.55;
      const group = new THREE.Group();
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(size, 20, 20),
        new THREE.MeshBasicMaterial({ color })
      );
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTex,
          color,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
        })
      );
      glow.scale.set(size * 4.4, size * 4.4, 1);
      // vertical stem to the floor
      const p = toXYZ(t);
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, p.y + 2, 6),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35 })
      );
      stem.position.y = -(p.y + 2) / 2;
      group.add(core);
      group.add(glow);
      group.add(stem);
      group.position.copy(p);
      group.userData.node = {
        task: t,
        cause,
        causeLabel: CAUSES[cause].label,
        color,
        urgency: urgency(t),
        aversiveness: aversiveness(t),
        crunch: crunchIndex(t),
        latency: startLatencyHours(t),
      };
      scene.add(group);
      groups.push(group);
    });

    // pulsing ring on the most urgent task
    let ring = null;
    if (groups.length) {
      const top = [...groups].sort(
        (a, b) => b.userData.node.urgency - a.userData.node.urgency
      )[0];
      ring = new THREE.Mesh(
        new THREE.RingGeometry(1.1, 1.35, 40),
        new THREE.MeshBasicMaterial({
          color: top.userData.node.color,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.copy(top.position).y = -1.85;
      scene.add(ring);
    }

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
        hovered.scale.setScalar(1.4);
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
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (ring) {
        const s = 1 + Math.sin(clock.getElapsedTime() * 2.4) * 0.12;
        ring.scale.set(s, s, 1);
      }
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
  }, [tasks, causes]);

  const tipLeft = tip
    ? Math.min(Math.max(tip.x, 110), (mountRef.current?.clientWidth ?? 400) - 110)
    : 0;

  return (
    <div className="relative">
      <div
        ref={mountRef}
        className="h-[420px] w-full cursor-grab overflow-hidden rounded-2xl bg-slate-50/60"
      />
      <div className="pointer-events-none absolute bottom-3 left-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
        X · Urgency
      </div>
      <div className="pointer-events-none absolute left-4 top-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
        Y · Effort (mins)
      </div>
      <div className="pointer-events-none absolute bottom-3 right-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
        Z · Aversiveness
      </div>
      <div className="pointer-events-none absolute right-4 top-3 flex max-w-[180px] flex-col gap-1.5 rounded-2xl bg-white/70 p-3 backdrop-blur-xl">
        {Object.entries(CAUSES).map(([k, c]) => (
          <span
            key={k}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-600"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }}
            />
            {c.label}
          </span>
        ))}
      </div>
      {tip && (
        <div
          className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 rounded-2xl border border-white/60 bg-white/85 p-3 shadow-xl backdrop-blur-xl"
          style={{ left: tipLeft, top: Math.max(tip.y - 170, 8) }}
        >
          <p className="text-xs font-extrabold leading-snug text-slate-900">
            {tip.node.task.title}
          </p>
          <p className="mt-0.5 text-[11px] font-extrabold" style={{ color: tip.node.color }}>
            {tip.node.causeLabel}
          </p>
          <div className="mt-1.5 space-y-1 text-[11px] font-semibold text-slate-500">
            <p className="flex justify-between">
              Urgency <span className="font-extrabold text-slate-900">{tip.node.urgency}</span>
            </p>
            <p className="flex justify-between">
              Aversiveness{" "}
              <span className="font-extrabold text-slate-900">{tip.node.aversiveness}</span>
            </p>
            <p className="flex justify-between">
              Crunch index{" "}
              <span className="font-extrabold text-slate-900">{tip.node.crunch}</span>
            </p>
            <p className="flex justify-between">
              Start latency{" "}
              <span className="font-extrabold text-slate-900">{tip.node.latency}h</span>
            </p>
          </div>
        </div>
      )}
      <p className="mt-2 text-center text-[11px] font-semibold text-slate-400">
        Drag to orbit · Scroll to zoom · Hover a task for its delay profile · Red floor zone =
        urgent + aversive
      </p>
    </div>
  );
}
