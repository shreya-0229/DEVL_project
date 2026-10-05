import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useHealth } from "../store/HealthContext";

function scoreColor(v) {
  if (v >= 75) return "#10B981";
  if (v >= 55) return "#F59E0B";
  return "#F43F5E";
}

/**
 * 3D wellness plot: five pillars arranged in a pentagon, pillar height = score.
 * A violet loop connects the pillar tops, echoing the classic radar polygon.
 */
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
  const dataKey = data.map((d) => d.value).join(",");

  const mountRef = useRef(null);
  const [tip, setTip] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const HEIGHT = 340;
    const width = mount.clientWidth || 600;

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
    controls.autoRotateSpeed = 0.8;

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(8, 14, 6);
    scene.add(dir);

    const grid = new THREE.GridHelper(18, 9, 0x94a3b8, 0xe2e8f0);
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    scene.add(grid);

    const world = new THREE.Group();
    scene.add(world);

    const R = 6;
    const pillars = [];
    const tops = [];
    const texes = [];

    const labelTex = (name, value) => {
      const c = document.createElement("canvas");
      c.width = 192;
      c.height = 84;
      const g = c.getContext("2d");
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = "700 23px system-ui";
      g.fillStyle = "#64748B";
      g.fillText(name, 96, 24);
      g.font = "800 32px system-ui";
      g.fillStyle = "#7C3AED";
      g.fillText(String(value), 96, 60);
      const t = new THREE.CanvasTexture(c);
      texes.push(t);
      return t;
    };

    data.forEach((d, i) => {
      const a = (Math.PI / 180) * (-90 + (i * 360) / data.length);
      const x = R * Math.cos(a);
      const z = R * Math.sin(a);
      const h = 0.4 + (d.value / 100) * 7;
      const geo = new THREE.CylinderGeometry(0.85, 1.05, h, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: scoreColor(d.value),
        roughness: 0.35,
        metalness: 0.1,
        transparent: true,
        opacity: 0.95,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, h / 2, z);
      m.userData.node = d;
      world.add(m);
      pillars.push(m);
      tops.push(new THREE.Vector3(x, h + 0.05, z));

      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: labelTex(d.axis, d.value), transparent: true, depthWrite: false })
      );
      sp.scale.set(3.6, 1.58, 1);
      sp.position.set(x, h + 1.9, z);
      world.add(sp);
    });

    // radar loop through the pillar tops
    const loop = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(tops),
      new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.9 })
    );
    world.add(loop);

    // Fit the camera to the scene so the plot fills the frame on any screen
    const bbox = new THREE.Box3().setFromObject(world);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera.fov * Math.PI) / 180;
    const fitH = maxDim / (2 * Math.tan(fov / 2));
    const fitW = fitH / camera.aspect;
    const dist = 1.35 * Math.max(fitH, fitW);
    const viewDir = new THREE.Vector3(0.85, 0.55, 1).normalize();
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
      const hits = raycaster.intersectObjects(pillars);
      if (hits.length) {
        const m = hits[0].object;
        if (hovered && hovered !== m) hovered.scale.set(1, 1, 1);
        hovered = m;
        hovered.scale.set(1.14, 1, 1.14);
        const mRect = mount.getBoundingClientRect();
        setTip({
          x: e.clientX - mRect.left,
          y: e.clientY - mRect.top,
          node: m.userData.node,
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
        if (o.geometry) o.geometry.dispose();
        if (o.material)
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            m.dispose()
          );
      });
      texes.forEach((t) => t.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]);

  const tipLeft = tip
    ? Math.min(Math.max(tip.x, 96), (mountRef.current?.clientWidth ?? 400) - 96)
    : 0;

  return (
    <div className="relative">
      <div
        ref={mountRef}
        className="h-[340px] w-full cursor-grab overflow-hidden rounded-2xl bg-slate-50/60"
      />
      <div className="pointer-events-none absolute bottom-3 left-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
        5 dimensions · pillar height = score · drag to orbit
      </div>
      {tip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-white/60 bg-white/90 px-3 py-1.5 shadow-xl backdrop-blur-xl"
          style={{ left: tipLeft, top: tip.y - 8 }}
        >
          <p className="whitespace-nowrap text-xs font-extrabold text-slate-900">
            {tip.node.axis}:{" "}
            <span className="text-violet-600">{tip.node.value}/100</span>
          </p>
        </div>
      )}
    </div>
  );
}
