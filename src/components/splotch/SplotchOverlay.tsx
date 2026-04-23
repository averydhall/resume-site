"use client";

import { useId } from "react";
import { blobRadiusAt, type Blob } from "./blobs";
import type { MeasuredLabel } from "./useMeasuredLabel";

/** Smoothly ramps from 0 -> 1 over progress 0.7 -> 1.0 so the coverage
 * layer fades in at the tail end of the splatter and fades out first
 * when reversing. Using smoothstep avoids a visible snap to solid. */
function coverageOpacity(p: number) {
  const t = Math.max(0, Math.min(1, (p - 0.7) / 0.3));
  return t * t * (3 - 2 * t);
}

type Props = {
  label: string;
  blobs: Blob[];
  progress: number;
  reversing: boolean;
  fillColor: string;
  baseColor?: string;
  measured: MeasuredLabel;
};

/**
 * Absolute-positioned SVG overlay that paints a copy of `label` in
 * `fillColor` using an SVG <text> element. The text is clipped by a
 * native SVG <mask> whose contents are a cluster of growing, gooified
 * circles. Because everything stays inside one SVG and uses SVG's
 * built-in `mask="url(#id)"` attribute (not CSS `mask-image`), it
 * renders identically in Chromium, WebKit, and Gecko.
 *
 * The SVG <text> is positioned to align visually with the HTML base
 * span underneath it, using the measured font metrics.
 */
export function SplotchOverlay({
  label,
  blobs,
  progress,
  reversing,
  fillColor,
  baseColor,
  measured,
}: Props) {
  const rawId = useId();
  const safe = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const maskId = `splotch-mask-${safe}`;
  const filterId = `splotch-goo-${safe}`;

  const { width: w, height: h, fontSize, fontFamily, fontWeight, letterSpacing } = measured;

  if (w === 0 || h === 0 || fontSize === 0) return null;

  const blurStd = Math.max(h * 0.035, 1.5);
  const blobScale = h * 0.5;
  // For Oswald at line-height:1 the alphabetic baseline sits ~82% from the top
  // of the em box. This aligns the SVG text with the HTML base text below it.
  const baselineY = h * 0.82;

  const baseTextStyle: React.CSSProperties = {
    fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight,
    letterSpacing,
    whiteSpace: "pre",
  };

  return (
    <svg
      aria-hidden
      focusable="false"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="pointer-events-none absolute left-0 top-0 overflow-visible"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blurStd} result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
            result="goo"
          />
        </filter>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          <rect x="0" y="0" width={w} height={h} fill="black" />
          <g filter={`url(#${filterId})`}>
            {blobs.map((b, i) => (
              <circle
                key={i}
                cx={b.cx * w}
                cy={b.cy * h}
                r={blobRadiusAt(b, progress, reversing) * blobScale}
                fill="white"
              />
            ))}
          </g>
          {/* Coverage layer: guarantees the text is fully painted at the end of
              the animation, filling any gaps the gooified blobs left inside
              enclosed letter shapes (e.g. the counter of O or the bowl of J).
              Smoothly fades in from progress 0.7 -> 1.0 (or out for reverse). */}
          <rect
            x="0"
            y="0"
            width={w}
            height={h}
            fill="white"
            opacity={coverageOpacity(progress)}
          />
        </mask>
      </defs>
      {baseColor && (
        <text x={0} y={baselineY} style={{ ...baseTextStyle, fill: baseColor }}>
          {label}
        </text>
      )}
      <text
        x={0}
        y={baselineY}
        mask={`url(#${maskId})`}
        style={{ ...baseTextStyle, fill: fillColor }}
      >
        {label}
      </text>
    </svg>
  );
}
