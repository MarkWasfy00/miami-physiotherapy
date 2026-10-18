import type { RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { City } from "@/lib/data";

/** Point the camera settles on (between the two cities, slightly south so the coast shows). */
const FOCUS = { lat: 29.2, lon: 30.6 };
const CAMERA_DISTANCE = 2.8;
const START_DISTANCE = 7;
const INTRO_MS = 3200;

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
/* Scene                                                               */
/* ------------------------------------------------------------------ */

type GlobeOptions = {
  cities: { id: City; lat: number; lon: number }[];
  activeRef: RefObject<City | null>;
  labelRefs: RefObject<Record<City, HTMLDivElement | null>>;
  onStatus: (status: "ready" | "fallback") => void;
  lite: boolean;
};

/** Builds the globe inside `host` (render loop paused while `wrap` is off screen); returns a cleanup function. */
export function mountGlobe(host: HTMLElement, wrap: HTMLElement, { cities, activeRef, labelRefs, onStatus, lite }: GlobeOptions) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !lite || window.devicePixelRatio < 2, alpha: true, powerPreference: lite ? "default" : "high-performance" });
  } catch {
    queueMicrotask(() => onStatus("fallback"));
    return () => {};
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.5 : 2));
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
  const dayMap = loader.load("/textures/earth-day.jpg", () => queueMicrotask(() => onStatus("ready")));
  dayMap.colorSpace = THREE.SRGBColorSpace;
  dayMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const lightsMap = loader.load("/textures/earth-lights.jpg");
  lightsMap.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = loader.load("/textures/earth-bump.jpg");

  const earthGeo = new THREE.SphereGeometry(1, lite ? 64 : 96, lite ? 64 : 96);
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
  const starCount = lite ? 700 : 1400;
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
  const markers = cities.map((city) => {
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
  const a = latLonToVector(cities[0].lat, cities[0].lon, 1.001);
  const b = latLonToVector(cities[1].lat, cities[1].lon, 1.001);
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
  // Cached so the render loop never forces a layout.
  const size = { width: 0, height: 0 };
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    size.width = width;
    size.height = height;
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
  const toCamera = new THREE.Vector3();

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
    toCamera.copy(camDir).negate();
    const { width, height } = size;
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
        const facing = tmp.dot(toCamera) / tmp.length();
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
}
