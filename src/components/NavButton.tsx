"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Variant } from "@/lib/variants";
import { generateBlobs } from "./splotch/blobs";
import { SplotchOverlay } from "./splotch/SplotchOverlay";
import { useAnimatedProgress } from "./splotch/useAnimatedProgress";
import { useMeasuredLabel } from "./splotch/useMeasuredLabel";

type Props = {
  label: string;
  href: string;
  variant: Variant;
  prefersReducedMotion: boolean;
  fillColor?: string;
  debugProgress?: number | null;
};

const PLAIN_GREY = "#8a8a8a";
const FRIENDLY_BLUE = "#4f6ab4";
const SUBTLE_SILVER = "#c4c8cf";

export function NavButton({
  label,
  href,
  variant,
  prefersReducedMotion,
  fillColor = FRIENDLY_BLUE,
  debugProgress,
}: Props) {
  const { ref, measured } = useMeasuredLabel<HTMLSpanElement>();
  // More blobs for longer words so we get even coverage.
  const blobs = useMemo(() => generateBlobs(label, Math.max(14, Math.ceil(label.length * 1.8))), [label]);
  const { progress, reversing, tweenTo, setProgressImmediate } = useAnimatedProgress({
    durationMs: 640,
  });

  // When variant changes, reset the animation so we don't carry progress across modes.
  const prevVariantRef = useRef(variant);
  useEffect(() => {
    if (prevVariantRef.current !== variant) {
      setProgressImmediate(0);
      prevVariantRef.current = variant;
    }
  }, [variant, setProgressImmediate]);

  const onEnter = useCallback(() => {
    if (variant === "plain") return;
    if (prefersReducedMotion) {
      setProgressImmediate(1);
      return;
    }
    if (variant === "splotch-once") {
      // Replay from 0 for a satisfying splat every time.
      setProgressImmediate(0);
      requestAnimationFrame(() => tweenTo(1, 620));
    } else {
      tweenTo(1, 620);
    }
  }, [variant, prefersReducedMotion, tweenTo, setProgressImmediate]);

  const onLeave = useCallback(() => {
    if (variant === "plain") return;
    if (variant !== "splotch-reverse") return; // one-shot stays filled until next enter
    if (prefersReducedMotion) {
      setProgressImmediate(0);
      return;
    }
    tweenTo(0, 620);
  }, [variant, prefersReducedMotion, tweenTo, setProgressImmediate]);

  const baseColorClass =
    variant === "plain"
      ? "transition-colors duration-150 ease-out hover:text-[color:var(--plain-grey)] focus-visible:text-[color:var(--plain-grey)]"
      : "";

  return (
    <Link
      href={href}
      className={`nav-label relative inline-block ${baseColorClass}`}
      style={{
        ["--plain-grey" as string]: PLAIN_GREY,
        fontSize: "clamp(1rem, 4.5vw, 2rem)",
        color: SUBTLE_SILVER,
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      <span
        ref={ref}
        className="relative block"
        style={variant !== "plain" ? { visibility: "hidden" } : undefined}
      >
        {label}
      </span>
      {variant !== "plain" && (
        <SplotchOverlay
          label={label}
          blobs={blobs}
          progress={debugProgress != null ? debugProgress : progress}
          reversing={reversing}
          fillColor={fillColor}
          baseColor={SUBTLE_SILVER}
          measured={measured}
        />
      )}
    </Link>
  );
}
