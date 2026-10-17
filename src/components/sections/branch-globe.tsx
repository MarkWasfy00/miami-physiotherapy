"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CalendarCheck, Clock, MapPin, MousePointer2, Navigation, Phone } from "lucide-react";
import { branches, mapLink, type Branch, type City } from "@/lib/data";
import { href, t, type Locale } from "@/lib/i18n";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const CITIES: { id: City; lat: number; lon: number; side: "left" | "right" }[] = [
  { id: "alexandria", lat: 31.2, lon: 29.92, side: "left" },
  { id: "cairo", lat: 30.04, lon: 31.1, side: "right" },
];

/** Point the camera settles on (between the two cities, slightly south so the coast shows). */
const FOCUS = { lat: 29.2, lon: 30.6 };
const CAMERA_DISTANCE = 2.8;
const START_DISTANCE = 7;
const INTRO_MS = 3200;

const copy = {
  ar: {
    alexandria: "الإسكندرية",
    cairo: "القاهرة والجيزة",
    branchesCount: (n: number) => (n === 2 ? "فرعان" : `${n} فروع`),
    hintTitle: "5 فروع في مدينتين",
    hint: "مرّر على أي مدينة على الكرة الأرضية لعرض فروعها، أو اسحب لتدوير الكرة.",
    book: "احجز",
    directions: "الاتجاهات",
    hours: "يومياً 10 ص – 12 منتصف الليل",
    drag: "اسحب للتدوير",
  },
  en: {
    alexandria: "Alexandria",
    cairo: "Cairo & Giza",
    branchesCount: (n: number) => `${n} branches`,
    hintTitle: "5 branches in two cities",
    hint: "Hover a city on the globe to see its branches, or drag to spin the Earth.",
    book: "Book",
    directions: "Directions",
    hours: "Daily 10 AM – 12 midnight",
    drag: "Drag to rotate",
  },
};

function latLonToVector(lat: number, lon: number, radius = 1) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function BranchGlobe({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Record<City, HTMLDivElement | null>>({ alexandria: null, cairo: null });
  const activeRef = useRef<City | null>(null);

  const [activeCity, setActiveCity] = useState<City | null>(null);
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    activeRef.current = activeCity;
  }, [activeCity]);

  useEffect(() => {
    const host = canvasHostRef.current;
    const wrap = wrapRef.current;
    if (!host || !wrap) return;

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
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "pan-y";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    camera.position.set(0, 0, reduceMotion ? CAMERA_DISTANCE : START_DISTANCE);

    /* ---- Globe hierarchy: tilt (x) → spin (y) → earth + markers ---- */
    const tilt = new THREE.Group();
    const spin = new THREE.Group();
    tilt.add(spin);
    scene.add(tilt);

    const focusVec = latLonToVector(FOCUS.lat, FOCUS.lon);
    const targetSpin = -Math.atan2(focusVec.x, focusVec.z);
    tilt.rotation.x = THREE.MathUtils.degToRad(FOCUS.lat);
    spin.rotation.y = reduceMotion ? targetSpin : targetSpin + Math.PI * 1.35;

    const loader = new THREE.TextureLoader();
    const dayMap = loader.load("/textures/earth-day.jpg", () => queueMicrotask(() => setStatus("ready")));
    dayMap.colorSpace = THREE.SRGBColorSpace;
    dayMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const lightsMap = loader.load("/textures/earth-lights.jpg");
    lightsMap.colorSpace = THREE.SRGBColorSpace;
    const bumpMap = loader.load("/textures/earth-bump.jpg");

    const earthGeo = new THREE.SphereGeometry(1, 96, 96);
    const earthMat = new THREE.MeshPhongMaterial({
      map: dayMap,
      bumpMap,
      bumpScale: 0.012,
      emissiveMap: lightsMap,
      emissive: new THREE.Color("#ffd28a"),
      emissiveIntensity: 0.55,
      specular: new THREE.Color("#1d4f7a"),
      shininess: 14,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    spin.add(earth);

    /* ---- Atmosphere (fresnel glow) ---- */
    const atmoGeo = new THREE.SphereGeometry(1.14, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: { glowColor: { value: new THREE.Color("#3ea2ff") } },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2);
          gl_FragColor = vec4(glowColor, 1.0) * intensity;
        }`,
    });
    scene.add(new THREE.Mesh(atmoGeo, atmoMat));

    /* ---- Stars ---- */
    const starCount = 1400;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(18 + Math.random() * 20);
      starPositions.set([v.x, v.y, v.z], i * 3);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: "#cfe8ff", size: 0.06, transparent: true, opacity: 0.75, depthWrite: false });
    scene.add(new THREE.Points(starGeo, starMat));

    /* ---- Lights ---- */
    scene.add(new THREE.AmbientLight("#9cc8ff", 0.55));
    const sun = new THREE.DirectionalLight("#ffffff", 2.1);
    sun.position.set(-3, 2, 4);
    scene.add(sun);

    /* ---- City markers ---- */
    const disposables: { dispose: () => void }[] = [earthGeo, earthMat, atmoGeo, atmoMat, starGeo, starMat, dayMap, lightsMap, bumpMap];
    const markers = CITIES.map((city) => {
      const pos = latLonToVector(city.lat, city.lon, 1.001);
      const normal = pos.clone().normalize();
      const group = new THREE.Group();
      group.position.copy(pos);
      group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      spin.add(group);

      const coreGeo = new THREE.CircleGeometry(0.007, 32);
      const coreMat = new THREE.MeshBasicMaterial({ color: "#a3d43a" });
      group.add(new THREE.Mesh(coreGeo, coreMat));

      const ringGeo = new THREE.RingGeometry(0.009, 0.012, 48);
      const ringMat = new THREE.MeshBasicMaterial({ color: "#a3d43a", transparent: true, side: THREE.DoubleSide, depthWrite: false });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      group.add(ring);

      const beamGeo = new THREE.CylinderGeometry(0.0016, 0.0016, 0.09, 8);
      beamGeo.rotateX(Math.PI / 2);
      beamGeo.translate(0, 0, 0.045);
      const beamMat = new THREE.MeshBasicMaterial({ color: "#d9ff8a", transparent: true, opacity: 0.85 });
      group.add(new THREE.Mesh(beamGeo, beamMat));

      // Anchor at the top of the beam, used for the HTML label position.
      const anchor = new THREE.Object3D();
      anchor.position.set(0, 0, 0.09);
      group.add(anchor);

      disposables.push(coreGeo, coreMat, ringGeo, ringMat, beamGeo, beamMat);
      return { city, ring, ringMat, coreMat, beamMat, anchor, normal };
    });

    /* ---- Arc between the cities + travelling comet ---- */
    const a = latLonToVector(CITIES[0].lat, CITIES[0].lon, 1.001);
    const b = latLonToVector(CITIES[1].lat, CITIES[1].lon, 1.001);
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(1.06);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const arcGeo = new THREE.TubeGeometry(curve, 64, 0.0018, 8, false);
    const arcMat = new THREE.MeshBasicMaterial({ color: "#59b0fb", transparent: true, opacity: 0.9 });
    const arc = new THREE.Mesh(arcGeo, arcMat);
    arcGeo.setDrawRange(0, 0);
    spin.add(arc);
    const cometGeo = new THREE.SphereGeometry(0.0055, 16, 16);
    const cometMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const comet = new THREE.Mesh(cometGeo, cometMat);
    spin.add(comet);
    disposables.push(arcGeo, arcMat, cometGeo, cometMat);
    const arcIndexCount = arcGeo.index ? arcGeo.index.count : 0;

    /* ---- Controls (gentle, limited so Egypt stays in view) ---- */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.35;
    controls.minAzimuthAngle = -0.55;
    controls.maxAzimuthAngle = 0.55;
    controls.minPolarAngle = Math.PI / 2 - 0.45;
    controls.maxPolarAngle = Math.PI / 2 + 0.45;
    controls.enabled = reduceMotion;

    /* ---- Sizing ---- */
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = `${width}px`;
      renderer.domElement.style.height = `${height}px`;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    /* ---- Render loop (only while visible) ---- */
    let raf = 0;
    let visible = false;
    let introStart = reduceMotion ? -Infinity : 0;
    const clock = new THREE.Clock();
    const tmp = new THREE.Vector3();
    const camDir = new THREE.Vector3();

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const elapsed = clock.getElapsedTime();

      // Intro: spin in and fly down towards Egypt.
      if (introStart === 0) introStart = now;
      const p = Math.min(1, (now - introStart) / INTRO_MS);
      if (p < 1) {
        const e = easeOutCubic(p);
        spin.rotation.y = targetSpin + Math.PI * 1.35 * (1 - e);
        camera.position.setLength(START_DISTANCE - (START_DISTANCE - CAMERA_DISTANCE) * e);
      } else if (!controls.enabled) {
        controls.enabled = true;
      }
      // Very slow idle drift after the intro.
      if (p >= 1 && !reduceMotion) spin.rotation.y = targetSpin + Math.sin(elapsed * 0.15) * 0.05;

      // Arc draws in after the intro, then a comet travels along it.
      const arcP = reduceMotion ? 1 : Math.min(1, Math.max(0, (now - introStart - INTRO_MS * 0.7) / 1200));
      arcGeo.setDrawRange(0, Math.floor(arcIndexCount * arcP) - (Math.floor(arcIndexCount * arcP) % 3));
      comet.visible = arcP >= 1;
      if (comet.visible) comet.position.copy(curve.getPoint((elapsed * 0.35) % 1));

      // Markers: pulse + highlight, and project labels to screen space.
      camera.getWorldDirection(camDir);
      const { width, height } = host.getBoundingClientRect();
      for (const m of markers) {
        const isActive = activeRef.current === m.city.id;
        const pulse = (elapsed * 0.9 + (m.city.id === "cairo" ? 0.5 : 0)) % 1;
        const s = 1 + pulse * (isActive ? 2.6 : 1.8);
        m.ring.scale.set(s, s, s);
        m.ringMat.opacity = (1 - pulse) * (isActive ? 1 : 0.8);
        const color = isActive ? "#ffffff" : "#a3d43a";
        m.coreMat.color.set(color);
        m.ringMat.color.set(color);

        const label = labelRefs.current[m.city.id];
        if (label) {
          m.anchor.getWorldPosition(tmp);
          const facing = tmp.clone().normalize().dot(camDir.clone().negate());
          tmp.project(camera);
          const x = (tmp.x * 0.5 + 0.5) * width;
          const y = (-tmp.y * 0.5 + 0.5) * height;
          label.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          label.style.opacity = p > 0.75 && facing > 0.2 ? "1" : "0";
          label.style.pointerEvents = facing > 0.2 ? "auto" : "none";
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) {
          clock.start();
          raf = requestAnimationFrame(frame);
        } else if (!visible && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.15 },
    );
    io.observe(wrap);

    return () => {
      io.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(raf);
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const cityBranches = (city: City) => branches.filter((b) => b.city === city);
  const panelCity = activeCity;

  return (
    <div ref={wrapRef} className="grid items-center gap-8 lg:grid-cols-[1fr_22rem]">
      {/* Globe */}
      <div className="relative" dir="ltr">
        <div ref={canvasHostRef} className="relative aspect-square w-full cursor-grab active:cursor-grabbing sm:aspect-[5/4]" />

        {status === "loading" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="size-40 animate-pulse rounded-full bg-gradient-to-br from-brand-600/40 to-brand-900/20 blur-sm" />
          </div>
        )}
        {status === "fallback" && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[2.5rem] border border-white/10 text-white/60">
            <MapPin className="size-10" aria-hidden />
          </div>
        )}

        {/* City labels, positioned every frame from the 3D scene */}
        {CITIES.map((city) => {
          const count = cityBranches(city.id).length;
          const active = activeCity === city.id;
          return (
            <div
              key={city.id}
              ref={(el) => {
                labelRefs.current[city.id] = el;
              }}
              className="absolute top-0 left-0 opacity-0 transition-opacity duration-500 will-change-transform"
            >
              <button
                type="button"
                onMouseEnter={() => setActiveCity(city.id)}
                onFocus={() => setActiveCity(city.id)}
                onClick={() => setActiveCity(city.id)}
                className={`absolute top-0 flex -translate-y-1/2 items-center gap-2 ${
                  city.side === "left" ? "right-0 flex-row-reverse" : "left-0"
                }`}
              >
                <span className={`h-px w-6 sm:w-10 ${active ? "bg-white" : "bg-lime-400/70"}`} />
                <span
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md transition sm:text-sm ${
                    active ? "border-white bg-white text-ink" : "border-white/20 bg-ink/60 text-white hover:border-lime-400"
                  }`}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                >
                  {c[city.id]} <span className={active ? "text-brand-700" : "text-lime-400"}>· {c.branchesCount(count)}</span>
                </span>
              </button>
            </div>
          );
        })}

        <span className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 backdrop-blur">
          <MousePointer2 className="size-3.5" aria-hidden />
          {c.drag}
        </span>
      </div>

      {/* Details panel */}
      <div className="no-scrollbar flex flex-col lg:h-[34rem] lg:overflow-y-auto">
        {panelCity ? (
          <div key={panelCity} className="my-auto animate-fade-up space-y-3 py-1 [animation-duration:300ms]">
            <p className="flex items-center gap-2 text-sm font-semibold text-lime-400">
              <MapPin className="size-4" aria-hidden />
              {c[panelCity]}
            </p>
            {cityBranches(panelCity).map((b) => (
              <BranchCard key={b.slug} branch={b} lang={lang} highlighted={activeBranch === b.slug} />
            ))}
          </div>
        ) : (
          <div className="my-auto rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur">
            <p className="text-xl font-bold text-white">{c.hintTitle}</p>
            <p className="mt-2 leading-7 text-white/65">{c.hint}</p>
            <div className="mt-6 space-y-2">
              {CITIES.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onMouseEnter={() => setActiveCity(city.id)}
                  onClick={() => setActiveCity(city.id)}
                  className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-start text-white transition hover:bg-white/10"
                >
                  <span className="font-semibold">{c[city.id]}</span>
                  <span className="text-sm text-lime-400">{c.branchesCount(cityBranches(city.id).length)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Branch chips */}
      <div className="flex flex-wrap justify-center gap-2 lg:col-span-2">
        {branches.map((b) => (
          <button
            key={b.slug}
            type="button"
            onMouseEnter={() => {
              setActiveCity(b.city);
              setActiveBranch(b.slug);
            }}
            onMouseLeave={() => setActiveBranch(null)}
            onFocus={() => {
              setActiveCity(b.city);
              setActiveBranch(b.slug);
            }}
            onClick={() => {
              setActiveCity(b.city);
              setActiveBranch(b.slug);
            }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeBranch === b.slug ? "border-lime-400 bg-lime-400 text-ink" : "border-white/15 bg-white/5 text-white hover:border-white/40"
            }`}
          >
            <MapPin className="size-4" aria-hidden />
            {t(b.name, lang)}
          </button>
        ))}
      </div>
    </div>
  );
}

function BranchCard({ branch, lang, highlighted }: { branch: Branch; lang: Locale; highlighted: boolean }) {
  const c = copy[lang];
  return (
    <div
      className={`rounded-3xl bg-white p-5 text-start shadow-2xl shadow-black/30 transition ${
        highlighted ? "ring-4 ring-lime-400" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-ink">{t(branch.name, lang)}</p>
          <p className="mt-1 text-sm leading-6 text-ink-soft">
            {t(branch.address, lang)} — {t(branch.landmark, lang)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {branch.phones.map((p) => (
          <a
            key={p}
            href={`tel:${p}`}
            dir="ltr"
            className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-ink hover:text-brand-700"
          >
            <Phone className="size-3" aria-hidden />
            {p}
          </a>
        ))}
        <span className="inline-flex items-center gap-1 px-1 text-xs text-ink-soft">
          <Clock className="size-3" aria-hidden />
          {c.hours}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href={`${href(lang, "/booking")}?branch=${branch.slug}`} className="btn-primary !px-3 !py-2 text-xs">
          <CalendarCheck className="size-3.5" aria-hidden />
          {c.book}
        </Link>
        <a href={mapLink(branch.mapQuery)} target="_blank" rel="noopener noreferrer" className="btn-outline !px-3 !py-2 text-xs">
          <Navigation className="size-3.5" aria-hidden />
          {c.directions}
        </a>
      </div>
    </div>
  );
}
