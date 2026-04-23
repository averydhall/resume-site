"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type MeasuredLabel = {
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  letterSpacing: string;
  textTransform: string;
};

const ZERO: MeasuredLabel = {
  width: 0,
  height: 0,
  fontSize: 0,
  fontFamily: "",
  fontWeight: "500",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

/**
 * Measures a reference HTML span so we can render an SVG overlay with
 * matching typography and dimensions. Re-measures on resize and after
 * web fonts finish loading.
 */
export function useMeasuredLabel<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [measured, setMeasured] = useState<MeasuredLabel>(ZERO);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      setMeasured({
        width: rect.width,
        height: rect.height,
        fontSize: parseFloat(cs.fontSize),
        fontFamily: cs.fontFamily,
        fontWeight: cs.fontWeight,
        letterSpacing: cs.letterSpacing,
        textTransform: cs.textTransform,
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Re-measure after webfont loads (Oswald) so the overlay aligns once it swaps in.
  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) return;
    let alive = true;
    document.fonts.ready.then(() => {
      if (!alive) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      setMeasured((prev) => ({
        ...prev,
        width: rect.width,
        height: rect.height,
        fontSize: parseFloat(cs.fontSize),
        fontFamily: cs.fontFamily,
      }));
    });
    return () => {
      alive = false;
    };
  }, []);

  return { ref, measured };
}
