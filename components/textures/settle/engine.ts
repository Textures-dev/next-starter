// Settle — a hover texture from textures.dev/s/settle?via=code
// More like this: npx shadcn@latest add https://textures.dev/r/<slug>.json?via=code · textures.dev/llms.txt
// License: textures.dev/license (MIT for free Textures; per-person license for Pro)

/**
 * Pointer engine shared by the panel Textures. Reads the panel's box once on pointer enter (and on
 * focus, resize and, while hovered, scroll), never in the move handler; maps the pointer into the 732 × 516 panel; fades
 * an on/off weight on a short spring; runs one requestAnimationFrame loop that stops when the
 * Texture settles. Keyboard focus on the host counts as a pointer at the centre. Under reduced
 * motion or a slow display everything snaps. Below min_box the Texture stays static.
 */
export type Pointer = { x: number; y: number; active: number; reduced: boolean };

export function engine(root: HTMLElement, draw: (p: Pointer, dt: number) => boolean | void, min: [number, number]): () => void {
  const svg = root.querySelector("svg");
  if (!svg) return () => {};
  const mq = () => matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(update: slow)").matches;
  let box: { left: number; top: number; s: number; ox: number; oy: number } | null = null;
  let px = 366;
  let py = 258;
  let cx = 0; // last pointer position on screen, so a scroll under a still pointer re-maps it
  let cy = 0;
  let active = 0;
  let target = 0;
  let vel = 0;
  let frame = 0;
  let last = 0;
  const measure = () => {
    const r = svg.getBoundingClientRect();
    if (r.width < min[0] || r.height < min[1]) {
      box = null;
      return;
    }
    const s = Math.max(r.width / 732, r.height / 516);
    box = { left: r.left, top: r.top, s, ox: (r.width - 732 * s) / 2, oy: (r.height - 516 * s) / 2 };
  };
  const tick = (now: number) => {
    const dt = Math.min(last ? (now - last) / 1000 : 1 / 60, 1 / 30);
    last = now;
    let moving = false;
    const reduced = mq();
    if (reduced) {
      active = target;
      vel = 0;
    } else {
      // the exact critically damped spring (ω = 30/s: stiffness 900, damping 60), stable at any frame length. The old
      // explicit step diverged once a frame took longer than ~22 ms (a reload or a scroll with many Textures on screen),
      // and `active` grew without bound: the giant bars (Lukas, 2026-10-17)
      const decay = Math.exp(-30 * dt);
      const off = active - target;
      const lead = vel + 30 * off;
      active = target + (off + lead * dt) * decay;
      vel = (vel - 30 * lead * dt) * decay;
      if (Math.abs(vel) < 0.02 && Math.abs(active - target) < 0.02) {
        active = target;
        vel = 0;
      } else moving = true;
    }
    const more = draw({ x: px, y: py, active, reduced }, dt);
    if (moving || more) frame = requestAnimationFrame(tick);
    else {
      frame = 0;
      last = 0;
    }
  };
  const wake = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const onEnter = () => measure();
  const onMove = (e: PointerEvent) => {
    if (!box) return;
    cx = e.clientX;
    cy = e.clientY;
    px = (cx - box.left - box.ox) / box.s;
    py = (cy - box.top - box.oy) / box.s;
    target = 1;
    wake();
  };
  const onLeave = () => {
    target = 0;
    wake();
  };
  const onFocus = () => {
    measure();
    if (!box) return;
    px = 366;
    py = 258;
    target = 1;
    wake();
  };
  const onResize = () => {
    if (box) measure();
  };
  // the page scrolled under a hovering pointer: the panel moved, the pointer did not, so re-measure and re-map
  const onScroll = () => {
    if (!box || target !== 1) return;
    measure();
    if (!box) return;
    px = (cx - box.left - box.ox) / box.s;
    py = (cy - box.top - box.oy) / box.s;
    wake();
  };
  const host: Element = root.closest("a, button, [tabindex]") ?? root.parentElement ?? root;
  root.addEventListener("pointerenter", onEnter);
  root.addEventListener("pointermove", onMove, { passive: true });
  root.addEventListener("pointerleave", onLeave);
  root.addEventListener("pointercancel", onLeave);
  host.addEventListener("focusin", onFocus);
  host.addEventListener("focusout", onLeave);
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true, capture: true });
  return () => {
    root.removeEventListener("pointerenter", onEnter);
    root.removeEventListener("pointermove", onMove);
    root.removeEventListener("pointerleave", onLeave);
    root.removeEventListener("pointercancel", onLeave);
    host.removeEventListener("focusin", onFocus);
    host.removeEventListener("focusout", onLeave);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", onScroll, { capture: true });
    if (frame) cancelAnimationFrame(frame);
  };
}
