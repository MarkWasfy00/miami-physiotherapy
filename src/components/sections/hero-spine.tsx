"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Hand } from "lucide-react";
import type { Locale } from "@/lib/i18n";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const LEVELS = 24; // C1 → L5
const SPINE_HEIGHT = 4; // world units after scaling
const PULSE_MS = 2600;
const PULSE_EVERY_MS = 5200;

const COLORS = {
  bone: new THREE.Color("#e4edf3"),
  boneLit: new THREE.Color("#bce0ff"),
  disc: new THREE.Color("#59b0fb"),
  discLit: new THREE.Color("#a3d43a"),
};

const copy = {
  ar: { tap: "المس العمود الفقري" },
  en: { tap: "Tap the spine" },
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeOutBack = (x: number) => {
  const c1 = 1.5;
  return 1 + (c1 + 1) * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/** One vertebra, built from primitives: body, neural arch, spinous and transverse processes. Posterior is -z. */
function createVertebraGeometry() {
  const body = new THREE.CylinderGeometry(1, 0.96, 0.6, 32);

  const arch = new THREE.TorusGeometry(0.55, 0.15, 10, 28, Math.PI);
  arch.rotateX(-Math.PI / 2);
  arch.translate(0, 0, -0.92);

  const spinous = new THREE.ConeGeometry(0.17, 1.15, 12);
  spinous.rotateX(-Math.PI / 2 - 0.4);
  spinous.translate(0, -0.22, -1.85);

  const transverse = [-1, 1].map((side) => {
    const g = new THREE.CapsuleGeometry(0.12, 0.62, 4, 10);
    g.rotateZ(Math.PI / 2);
    g.rotateY(side * 0.35);
    g.translate(side * 0.88, 0.02, -1.2);
    return g;
  });

  const merged = mergeGeometries([body, arch, spinous, ...transverse])!;
  [body, arch, spinous, ...transverse].forEach((g) => g.dispose());
  return merged;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function HeroSpine({ lang, fallback }: { lang: Locale; fallback: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      queueMicrotask(() => setStatus("fallback"));
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "pan-y";

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 10.5);

    /* ---- Lights ---- */
    const key = new THREE.DirectionalLight("#ffffff", 1.6);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#a3d43a", 1.4);
    rim.position.set(4, 1, -4);
    scene.add(rim);
    scene.add(new THREE.HemisphereLight("#d9edff", "#13477b", 0.9));

    /* ---- Layout of the levels (cervical small → lumbar large) ---- */
    const sizes: number[] = [];
    const ys: number[] = [];
    let y = 0;
    for (let i = 0; i < LEVELS; i++) {
      const t = i / (LEVELS - 1);
      const s = 0.42 + 0.55 * Math.pow(t, 1.15);
      if (i > 0) y += 0.3 * sizes[i - 1] + 0.24 * ((s + sizes[i - 1]) / 2) + 0.3 * s;
      sizes.push(s);
      ys.push(y);
    }
    const length = y;
    const levelU = ys.map((v) => v / length); // 0 = top, 1 = base
    const unitScale = SPINE_HEIGHT / length;

    const root = new THREE.Group(); // pointer parallax + idle sway
    const spine = new THREE.Group(); // scaled spine
    spine.scale.setScalar(unitScale);
    root.add(spine);
    scene.add(root);

    /* ---- Meshes ---- */
    const vertebraGeo = createVertebraGeometry();
    const vertebraMat = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.32,
      metalness: 0,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25,
      sheen: 0.4,
      sheenColor: new THREE.Color("#bce0ff"),
    });
    const vertebrae = new THREE.InstancedMesh(vertebraGeo, vertebraMat, LEVELS);
    vertebrae.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    spine.add(vertebrae);

    const discGeo = new THREE.SphereGeometry(1, 32, 16);
    const discMat = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.15,
      clearcoat: 1,
      transmission: 0.25,
      thickness: 0.5,
      emissive: new THREE.Color("#0f83e9"),
      emissiveIntensity: 0.25,
    });
    const discs = new THREE.InstancedMesh(discGeo, discMat, LEVELS - 1);
    discs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    spine.add(discs);

    /* ---- Orbit rings with travelling dots ---- */
    const ringGeo = new THREE.TorusGeometry(1.55, 0.006, 8, 160);
    const ringMat = new THREE.MeshBasicMaterial({ color: "#59b0fb", transparent: true, opacity: 0.45 });
    const dotGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: "#88be1f" });
    const orbits = [
      { tilt: new THREE.Euler(1.2, 0.3, 0.2), speed: 0.45, phase: 0, scale: 1 },
      { tilt: new THREE.Euler(1.75, -0.5, -0.35), speed: -0.32, phase: 2.1, scale: 1.22 },
    ].map((o) => {
      const group = new THREE.Group();
      group.rotation.copy(o.tilt);
      group.scale.setScalar(o.scale);
      group.add(new THREE.Mesh(ringGeo, ringMat));
      const dot = new THREE.Mesh(dotGeo, dotMat);
      group.add(dot);
      root.add(group);
      return { ...o, dot };
    });

    /* ---- Drifting particles ---- */
    const particleCount = 220;
    const particlePos = new Float32Array(particleCount * 3);
    const particleSeed = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const r = 1.1 + Math.random() * 1.6;
      const a = Math.random() * Math.PI * 2;
      particlePos.set([Math.cos(a) * r, (Math.random() - 0.5) * 5.5, Math.sin(a) * r], i * 3);
      particleSeed[i] = Math.random();
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({ color: "#2f93f2", size: 0.035, transparent: true, opacity: 0.55, depthWrite: false });
    const particles = new THREE.Points(particleGeo, particleMat);
    root.add(particles);

    /* ---- Flowers that bloom around the spine ---- */
    const petalGeo = new THREE.SphereGeometry(1, 20, 12);
    petalGeo.scale(0.17, 0.035, 0.4);
    petalGeo.translate(0, 0, 0.38);
    const leafGeo = new THREE.SphereGeometry(1, 16, 8);
    leafGeo.scale(0.11, 0.02, 0.34);
    leafGeo.translate(0, 0, 0.36);
    const centerGeo = new THREE.SphereGeometry(0.13, 20, 14);
    centerGeo.scale(1, 0.6, 1);
    const petalMats = ["#ff9fbb", "#59b0fb", "#ffd0dc", "#8ecdff"].map(
      (color) =>
        new THREE.MeshPhysicalMaterial({
          color,
          roughness: 0.45,
          sheen: 1,
          sheenColor: new THREE.Color("#ffffff"),
          side: THREE.DoubleSide,
        }),
    );
    const leafMat = new THREE.MeshStandardMaterial({ color: "#6b9a14", roughness: 0.6, side: THREE.DoubleSide });
    const centerMat = new THREE.MeshStandardMaterial({ color: "#a3d43a", roughness: 0.5, emissive: "#88be1f", emissiveIntensity: 0.35 });

    const flowerSpots = [
      { a: 0.3, y: 1.55, r: 1.25, s: 0.85 },
      { a: 1.5, y: 0.9, r: 1.45, s: 1 },
      { a: 2.6, y: 1.8, r: 1.35, s: 0.7 },
      { a: 3.5, y: 0.2, r: 1.3, s: 0.95 },
      { a: 4.6, y: -0.6, r: 1.5, s: 0.8 },
      { a: 5.5, y: 0.6, r: 1.2, s: 0.75 },
      { a: 0.9, y: -1.2, r: 1.4, s: 1.05 },
      { a: 2.1, y: -1.75, r: 1.3, s: 0.9 },
      { a: 4.0, y: -1.9, r: 1.25, s: 0.75 },
      { a: 5.9, y: -1.5, r: 1.5, s: 0.85 },
    ];
    const flowers = flowerSpots.map((spot, i) => {
      const group = new THREE.Group();
      const outward = new THREE.Vector3(Math.cos(spot.a), 0, Math.sin(spot.a));
      group.position.copy(outward).multiplyScalar(spot.r).setY(spot.y);
      // Face outwards and a little upwards so the bloom is visible.
      group.lookAt(group.position.clone().add(outward).add(new THREE.Vector3(0, 0.9, 0)));
      group.rotateX(Math.PI / 2);
      group.scale.setScalar(0);
      root.add(group);

      const head = new THREE.Group();
      group.add(head);
      head.add(new THREE.Mesh(centerGeo, centerMat));

      const petalCount = i % 3 === 0 ? 8 : 6;
      const petalMat = petalMats[i % petalMats.length];
      const petals = Array.from({ length: petalCount }, (_, k) => {
        const yaw = new THREE.Group();
        yaw.rotation.y = (k / petalCount) * Math.PI * 2;
        const pivot = new THREE.Group();
        pivot.add(new THREE.Mesh(petalGeo, petalMat));
        yaw.add(pivot);
        head.add(yaw);
        return pivot;
      });

      [-1, 1].forEach((side) => {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.y = -0.08;
        leaf.rotation.set(0.35, side * 2.3 + i, 0);
        group.add(leaf);
      });

      return { ...spot, group, head, petals, delay: 2.1 + i * 0.12, seed: Math.random() * 10, burst: 0 };
    });

    /* ---- Intro scatter state ---- */
    const scatter = Array.from({ length: LEVELS }, () => ({
      pos: new THREE.Vector3().randomDirection().multiplyScalar(4 + Math.random() * 3).divideScalar(unitScale),
      quat: new THREE.Quaternion().random(),
    }));

    /* ---- Pose ---- */
    const UP = new THREE.Vector3(0, 1, 0);
    const pA = new THREE.Vector3();
    const pB = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    const twistQ = new THREE.Quaternion();
    const tmpQ = new THREE.Quaternion();
    const tmpP = new THREE.Vector3();
    const tmpS = new THREE.Vector3();
    const tmpM = new THREE.Matrix4();
    const tmpC = new THREE.Color();
    const motion = { bendX: 0, bendZ: 0, twist: 0 };

    /** Centre line of the spine at u (0 = top, 1 = base), in unscaled units. */
    const centerAt = (u: number, out: THREE.Vector3) => {
      const fromBase = 1 - u;
      // Natural S-curve: cervical lordosis, thoracic kyphosis, lumbar lordosis.
      const sagittal = 0.055 * length * Math.cos((2 * Math.PI * (u - 0.1)) / 0.75);
      return out.set(
        motion.bendX * fromBase * fromBase,
        length * (0.5 - u),
        sagittal + motion.bendZ * fromBase * fromBase,
      );
    };

    const poseAt = (u: number, pos: THREE.Vector3, quat: THREE.Quaternion) => {
      centerAt(u, pos);
      centerAt(Math.max(0, u - 0.01), pA);
      centerAt(Math.min(1, u + 0.01), pB);
      tangent.subVectors(pA, pB).normalize();
      quat.setFromUnitVectors(UP, tangent);
      twistQ.setFromAxisAngle(UP, motion.twist * (1 - u));
      quat.multiply(twistQ);
    };

    const targetPos = Array.from({ length: LEVELS }, () => new THREE.Vector3());
    const targetQuat = Array.from({ length: LEVELS }, () => new THREE.Quaternion());
    const assembled = new Float32Array(LEVELS);

    const pulseAt = (u: number, pulse: number) => {
      if (pulse < 0 || pulse > 1) return 0;
      const head = pulse * 1.3 - 0.15;
      return Math.exp(-((u - head) ** 2) / 0.006);
    };

    const updateSpine = (introT: number, pulse: number) => {
      for (let i = 0; i < LEVELS; i++) {
        const u = levelU[i];
        poseAt(u, targetPos[i], targetQuat[i]);

        // Builds bottom-up, each vertebra snapping into place.
        const delay = 0.15 + (1 - u) * 1.1;
        const a = clamp01((introT - delay) / 0.9);
        assembled[i] = a;
        tmpP.lerpVectors(scatter[i].pos, targetPos[i], easeOutBack(a));
        tmpQ.slerpQuaternions(scatter[i].quat, targetQuat[i], easeOutCubic(a));
        const glow = pulseAt(u, pulse);
        const s = sizes[i] * (0.4 + 0.6 * easeOutCubic(a)) * (1 + glow * 0.06);
        tmpS.setScalar(s);
        tmpM.compose(tmpP, tmpQ, tmpS);
        vertebrae.setMatrixAt(i, tmpM);
        vertebrae.setColorAt(i, tmpC.copy(COLORS.bone).lerp(COLORS.boneLit, glow * 0.8));
      }

      for (let i = 0; i < LEVELS - 1; i++) {
        const u = (levelU[i] + levelU[i + 1]) / 2;
        poseAt(u, tmpP, tmpQ);
        const a = easeOutBack(Math.min(assembled[i], assembled[i + 1]));
        const glow = pulseAt(u, pulse);
        const r = ((sizes[i] + sizes[i + 1]) / 2) * 0.9;
        const gap = 0.24 * ((sizes[i] + sizes[i + 1]) / 2);
        tmpS.set(r * a * (1 + glow * 0.12), (gap / 2) * a * (1 + glow * 0.5), r * a * (1 + glow * 0.12));
        tmpM.compose(tmpP, tmpQ, tmpS);
        discs.setMatrixAt(i, tmpM);
        discs.setColorAt(i, tmpC.copy(COLORS.disc).lerp(COLORS.discLit, glow));
      }

      vertebrae.instanceMatrix.needsUpdate = true;
      discs.instanceMatrix.needsUpdate = true;
      if (vertebrae.instanceColor) vertebrae.instanceColor.needsUpdate = true;
      if (discs.instanceColor) discs.instanceColor.needsUpdate = true;
    };

    /* ---- Pointer parallax + tap to send a pulse ---- */
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.tx = THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1.5, 1.5);
      pointer.ty = THREE.MathUtils.clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1.5, 1.5);
    };
    let pulseStart = -Infinity;
    let kick = 0;
    const onPointerDown = () => {
      pulseStart = performance.now();
      kick = 1;
      flowers.forEach((f) => (f.burst = 1));
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    /* ---- Sizing ---- */
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = `${width}px`;
      renderer.domElement.style.height = `${height}px`;
      camera.aspect = width / height;
      // Keep the whole spine in frame on narrow viewports.
      camera.position.z = 10.5 * Math.max(1, 0.8 / camera.aspect);
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    /* ---- Render loop (only while visible) ---- */
    let raf = 0;
    let firstFrame = true;
    const start = performance.now();
    const introDuration = 2.3; // seconds until the last vertebra is in place

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const time = (now - start) / 1000;
      const introT = reduceMotion ? 99 : time;
      const live = reduceMotion ? 0 : Math.max(0, time - introDuration);

      // Gentle mobility routine once assembled: side bends, flexion, rotation.
      const ease = clamp01(live / 1.5);
      kick *= 0.94;
      motion.bendX = ease * 0.07 * length * Math.sin(live * 0.7) + kick * 0.04 * length * Math.sin(live * 14);
      motion.bendZ = ease * 0.04 * length * Math.sin(live * 0.45 + 1.2);
      motion.twist = ease * 0.35 * Math.sin(live * 0.55);

      // Energy pulse: on first assembly, then periodically, or on tap.
      const sinceIntro = (time - introDuration) * 1000;
      let pulse = -1;
      if (!reduceMotion && sinceIntro > 0) pulse = (sinceIntro % PULSE_EVERY_MS) / PULSE_MS;
      if (now - pulseStart < PULSE_MS) pulse = (now - pulseStart) / PULSE_MS;

      updateSpine(introT, pulse);

      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      root.rotation.y = -0.55 + (reduceMotion ? 0 : Math.sin(time * 0.25) * 0.45) + pointer.x * 0.35;
      root.rotation.x = pointer.y * 0.15;
      root.position.y = reduceMotion ? 0 : Math.sin(time * 0.8) * 0.06;

      for (const o of orbits) {
        const a = time * o.speed + o.phase;
        o.dot.position.set(Math.cos(a) * 1.55, Math.sin(a) * 1.55, 0);
      }
      ringMat.opacity = 0.45 * clamp01((time - 0.6) / 1.2);

      // Flowers grow in once the spine is whole, then sway and breathe; the pulse makes them swell.
      for (const f of flowers) {
        const grow = reduceMotion ? 1 : clamp01((time - f.delay) / 1.1);
        const bloom = reduceMotion ? 1 : easeOutCubic(clamp01((time - f.delay - 0.4) / 1.4));
        f.burst *= 0.95;
        const glow = pulseAt(0.5 - f.y / SPINE_HEIGHT, pulse);
        f.group.scale.setScalar(f.s * 0.55 * easeOutBack(grow) * (1 + glow * 0.18 + f.burst * 0.25));
        const breathe = reduceMotion ? 0 : Math.sin(time * 1.3 + f.seed) * 0.08;
        const open = -1.35 + bloom * (1.12 + breathe + glow * 0.15 + f.burst * 0.25);
        for (const petal of f.petals) petal.rotation.x = open;
        f.head.rotation.y = reduceMotion ? 0 : time * 0.25 + f.seed;
        f.group.position.y = f.y + (reduceMotion ? 0 : Math.sin(time * 0.9 + f.seed) * 0.05);
      }

      const pos = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let py = pos.getY(i) + 0.003 + particleSeed[i] * 0.004;
        if (py > 2.75) py = -2.75;
        pos.setY(i, py);
      }
      pos.needsUpdate = true;
      particles.rotation.y = time * 0.05;

      renderer.render(scene, camera);
      if (firstFrame) {
        firstFrame = false;
        setStatus("ready");
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !raf) raf = requestAnimationFrame(frame);
      else if (!entry.isIntersecting && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(host);

    return () => {
      io.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      [vertebraGeo, vertebraMat, discGeo, discMat, ringGeo, ringMat, dotGeo, dotMat, particleGeo, particleMat, petalGeo, leafGeo, centerGeo, ...petalMats, leafMat, centerMat, envTexture, pmrem].forEach(
        (d) => d.dispose(),
      );
      vertebrae.dispose();
      discs.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  if (status === "fallback") return <>{fallback}</>;

  return (
    <div className="relative aspect-[4/5] w-full" dir="ltr">
      {/* Soft halo behind the spine */}
      <div
        className="pointer-events-none absolute inset-[6%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-brand-200)_75%,transparent),color-mix(in_oklab,var(--color-brand-100)_40%,transparent)_60%,transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-lime-400/50"
        aria-hidden
      />
      <div
        ref={hostRef}
        className={`absolute inset-0 cursor-pointer transition-opacity duration-700 ${status === "ready" ? "opacity-100" : "opacity-0"}`}
        role="img"
        aria-label={lang === "ar" ? "عمود فقري ثلاثي الأبعاد متحرك" : "Animated 3D spine"}
      />
      <span className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-brand-100 bg-white/80 px-3 py-1 text-xs font-medium text-ink-soft shadow-sm backdrop-blur">
        <Hand className="size-3.5 text-brand-600" aria-hidden />
        {copy[lang].tap}
      </span>
    </div>
  );
}
