// Settle — a hover texture from textures.dev/s/settle?via=code
// More like this: npx shadcn@latest add https://textures.dev/r/<slug>.json?via=code · textures.dev/llms.txt
// License: textures.dev/license (MIT for free Textures; per-person license for Pro)

"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { engine } from "./engine";
import { BAR_H, BAR_W, COLS, H, W } from "./geometry";

/**
 * Settle (Figma 16:330): twenty columns of thin bars, the left half piled toward the floor and the
 * right half toward the ceiling. Under the pointer the bars gather toward it along their own
 * column, never closer than a bar's gap, and settle back when it leaves. Motion is a CSS
 * translate on each bar; at rest nothing runs.
 *
 * Host needs: `position: relative` and a size. The panel is 732 × 516 and covers the host.
 */
export type SettleProps = {
  /** Token overrides; see texture.json → tokens. */
  tokens?: Partial<Record<"--texture-ink" | "--texture-field", string>>;
  className?: string;
  /** Draw the resting frame only (thumbnails, server lists). */
  static?: boolean;
};

const GAP = BAR_H + 2;
const SIGMA_X = 90;
const SIGMA_Y = 130;
const PULL = 0.85;
const EASE = 0.32;

export function Settle({ tokens, className = "", static: isStatic = false }: SettleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rects = useRef<(SVGRectElement | null)[][]>(COLS.map(() => []));

  useEffect(() => {
    const root = ref.current;
    if (!root || isStatic) return;
    const ys = COLS.map(([, tops]) => [...tops]);
    const targets = COLS.map(([, tops]) => [...tops]);
    return engine(
      root,
      ({ x, y, active, reduced }, dt) => {
        let moving = false;
        const k = reduced ? 1 : 1 - (1 - EASE) ** (dt * 60);
        COLS.forEach(([cx, tops], i) => {
          const t = targets[i]!;
          const cur = ys[i]!;
          const dx = cx + BAR_W / 2 - x;
          const wx = Math.exp(-(dx * dx) / (2 * SIGMA_X * SIGMA_X));
          tops.forEach((top, j) => {
            const dy = y - (top + BAR_H / 2);
            const wy = Math.exp(-(dy * dy) / (2 * SIGMA_Y * SIGMA_Y));
            t[j] = top + dy * wx * wy * PULL * active;
          });
          for (let j = 1; j < t.length; j++) if (t[j]! < t[j - 1]! + GAP) t[j] = t[j - 1]! + GAP;
          for (let j = t.length - 2; j >= 0; j--) if (t[j]! > t[j + 1]! - GAP) t[j] = t[j + 1]! - GAP;
          for (let j = 0; j < t.length; j++) {
            const d = t[j]! - cur[j]!;
            const el = rects.current[i]![j];
            if (Math.abs(d) < 0.03) {
              if (cur[j] !== t[j]) {
                cur[j] = t[j]!;
                if (el) el.style.transform = `translateY(${(cur[j]! - tops[j]!).toFixed(2)}px)`;
              }
              continue;
            }
            cur[j] = cur[j]! + d * k;
            if (el) el.style.transform = `translateY(${(cur[j]! - tops[j]!).toFixed(2)}px)`;
            moving = true;
          }
        });
        return moving;
      },
      [160, 112],
    );
  }, [isStatic]);

  const style = { "--texture-ink": "var(--foreground)", "--texture-field": "var(--background)", ...tokens, color: "var(--texture-ink)", background: "var(--texture-field)" } as CSSProperties;
  return (
    <div
      ref={ref}
      style={style}
      data-texture="settle"
      className={`relative isolate h-full w-full overflow-clip [contain:layout_paint_style] [container-type:size] ${className}`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" fill="currentColor" className="absolute inset-0 block h-full w-full">
        {COLS.map(([x, tops], i) =>
          tops.map((top, j) => (
            <rect
              key={`${i}-${j}`}
              ref={(el) => {
                rects.current[i]![j] = el;
              }}
              x={x}
              y={top}
              width={BAR_W}
              height={BAR_H}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
          )),
        )}
      </svg>
    </div>
  );
}

export default Settle;
