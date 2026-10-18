/** Runs `onNear` once `el` comes within `margin` of the viewport. Returns a function that stops watching. */
export function whenNearViewport(el: Element, onNear: () => void, margin = "200px") {
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      onNear();
    },
    { rootMargin: margin },
  );
  io.observe(el);
  return () => io.disconnect();
}

/** Hints for scaling down WebGL work: phones and low-end devices get a lighter scene, Save-Data gets none. */
export function prefersLiteGraphics() {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  const lite =
    window.matchMedia("(pointer: coarse)").matches ||
    window.innerWidth < 768 ||
    (navigator.hardwareConcurrency || 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4;
  return { lite, saveData: !!nav.connection?.saveData };
}
