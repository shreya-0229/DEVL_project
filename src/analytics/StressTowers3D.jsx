import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { weeklyTowers, stressColor } from "./procData";

/**
 * 3D bar towers: 7 days × 3 dayparts of stress intensity.
 * Bar height = stress, color = emerald → amber → rose ramp.
 */
export default function StressTowers3D() {
  const mountRef = useRef(null);
  const [tip, setTip] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const HEIGHT = 380;
    const width = mount.clientWidth;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / HEIGHT, 0.1, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, HEIGHT);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7;

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(8, 14, 6);
    scene.add(dir);

    const grid = new THREE.GridHelper(28, 14, 0x94a3b8, 0xe2e8f0);
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    scene.add(grid);

    const world = new THREE.Group();
    scene.add(world);

    const data = weeklyTowers();
    const bars = [];
    const cellX = 3.2;
    const cellZ = 4.0;

    data.forEach((d, i) => {
      const dayIdx = Math.floor(i / 3);
      const partIdx = i % 3;
      const h = (d.value / 100) * 9 + 0.25;
      const geo = new THREE.BoxGeometry(1.7, h, 2.2);
      // round feel: translate so base sits on floor
      const mat = new THREE.MeshStandardMaterial({
        color: stressColor(d.value),
        roughness: 0.35,
        metalness: 0.15,
        transparent: true,
        opacity: 0.92,
      });
      const bar = new THREE.Mesh(geo, mat);
      bar.position.set(
        (dayIdx - 3) * cellX,
        h / 2,
        (partIdx - 1) * cellZ
      );
      // emissive glow for high-stress bars
      if (d.value >= 66) {
        mat.emissive = new THREE.Color(stressColor(d.value));
        mat.emissiveIntensity = 0.35;
      }
      bar.userData.node = d;
      world.add(bar);
      bars.push(bar);
    });

    // day labels as canvas sprites
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const labelTex = (text) => {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 48;
      const g = c.getContext("2d");
      g.font = "700 28px system-ui";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = "#64748B";
      g.fillText(text, 64, 24);
      const t = new THREE.CanvasTexture(c);
      return t;
    };
    const labelTexes = [];
    days.forEach((d, i) => {
      const tex = labelTex(d);
      labelTexes.push(tex);
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
      );
      sp.scale.set(2.4, 0.9, 1);
      sp.position.set((i - 3) * cellX, 0.15, cellZ + 2.8);
      world.add(sp);
    });

    // Fit the camera to the scene so the towers fill the frame on any screen
    const bbox = new THREE.Box3().setFromObject(world);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera.fov * Math.PI) / 180;
    const fitH = maxDim / (2 * Math.tan(fov / 2));
    const fitW = fitH / camera.aspect;
    const dist = 1.3 * Math.max(fitH, fitW);
    const viewDir = new THREE.Vector3(0.85, 0.6, 1).normalize();
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
      const hits = raycaster.intersectObjects(bars);
      if (hits.length) {
        const bar = hits[0].object;
        if (hovered && hovered !== bar) hovered.scale.set(1, 1, 1);
        hovered = bar;
        hovered.scale.set(1.12, 1, 1.12);
        const mRect = mount.getBoundingClientRect();
        setTip({
          x: e.clientX - mRect.left,
          y: e.clientY - mRect.top,
          node: bar.userData.node,
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
      labelTexes.forEach((t) => t.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, []);

  const tipLeft = tip
    ? Math.min(Math.max(tip.x, 96), (mountRef.current?.clientWidth ?? 400) - 96)
    : 0;

  return (
    <div className="relative">
      <div
        ref={mountRef}
        className="h-[380px] w-full cursor-grab overflow-hidden rounded-2xl bg-slate-50/60"
      />
      <div className="pointer-events-none absolute left-4 top-3 flex gap-3 rounded-2xl bg-white/70 px-3 py-2 backdrop-blur-xl">
        {["Morning", "Afternoon", "Night"].map((p) => (
          <span key={p} className="text-[11px] font-bold text-slate-500">
            {p}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-3 left-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
        7 days · bar height = stress
      </div>
      {tip && (
        <div
          className="pointer-events-none absolute z-10 w-44 -translate-x-1/2 rounded-2xl border border-white/60 bg-white/85 p-3 shadow-xl backdrop-blur-xl"
          style={{ left: tipLeft, top: Math.max(tip.y - 120, 8) }}
        >
          <p className="text-xs font-extrabold text-slate-900">
            {tip.node.day} · {tip.node.part}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            Stress{" "}
            <span
              className="font-extrabold"
              style={{ color: stressColor(tip.node.value) }}
            >
              {tip.node.value}%
            </span>
          </p>
        </div>
      )}
      <p className="mt-2 text-center text-[11px] font-semibold text-slate-400">
        Drag to orbit · Scroll to zoom · Hover a tower for the reading
      </p>
    </div>
  );
}
