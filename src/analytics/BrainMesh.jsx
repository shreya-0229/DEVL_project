import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Continuously rotating wireframe brain; color follows stressScore. */
export default function BrainMesh({ stressScore }) {
  const mountRef = useRef(null);
  const colorRef = useRef("#F59E0B");

  const zoneColor =
    stressScore < 35 ? "#10B981" : stressScore <= 65 ? "#F59E0B" : "#F43F5E";
  const zoneLabel =
    stressScore < 35
      ? "Emerald · Calm"
      : stressScore <= 65
        ? "Amber · Activated"
        : "Rose · Overloaded";
  colorRef.current = zoneColor;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const SIZE = 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(SIZE, SIZE);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Organic displaced sphere → brain-like wireframe
    const geo = new THREE.IcosahedronGeometry(1.5, 4);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n =
        Math.sin(v.x * 3.3 + 1.2) * Math.cos(v.y * 2.9) * Math.sin(v.z * 3.8 + 0.6) +
        0.5 * Math.sin(v.y * 6.1) * Math.cos(v.z * 5.2 + v.x);
      const groove = Math.exp(-(v.x * v.x) / 0.02) * 0.12; // interhemispheric fissure
      const s = 1 + 0.16 * n - groove;
      v.multiplyScalar(s);
      pos.setXYZ(i, v.x, v.y * 0.86, v.z * 1.12);
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: colorRef.current,
      transparent: true,
      opacity: 0.85,
    });
    const brain = new THREE.Mesh(geo, mat);
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(1.95, 24, 24),
      new THREE.MeshBasicMaterial({
        color: colorRef.current,
        transparent: true,
        opacity: 0.07,
      })
    );
    scene.add(brain);
    scene.add(halo);

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      brain.rotation.y += 0.006;
      halo.rotation.y += 0.006;
      brain.rotation.x = Math.sin(Date.now() * 0.0004) * 0.18;
      mat.color.set(colorRef.current);
      halo.material.color.set(colorRef.current);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      geo.dispose();
      mat.dispose();
      halo.geometry.dispose();
      halo.material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div ref={mountRef} className="h-[300px] w-[300px]" />
      <span
        className="mt-1 inline-flex items-center rounded-full px-4 py-1.5 text-xs font-extrabold text-white shadow-lg transition-all"
        style={{
          background: `linear-gradient(90deg, ${zoneColor}, ${zoneColor}CC)`,
          boxShadow: `0 8px 24px ${zoneColor}55`,
        }}
      >
        {zoneLabel}
      </span>
    </div>
  );
}
