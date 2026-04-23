export type Blob = {
  cx: number;
  cy: number;
  rMax: number;
  delay: number;
  duration: number;
};

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateBlobs(seed: string, count: number): Blob[] {
  const rand = mulberry32(hashString(seed));
  const blobs: Blob[] = [];
  for (let i = 0; i < count; i++) {
    // Spread horizontal centers quasi-evenly so long words get covered,
    // with a little jitter so the splatter feels organic.
    const lane = (i + 0.5) / count;
    const cx = Math.max(0.04, Math.min(0.96, lane + (rand() - 0.5) * 0.2));
    // Distribute vertically across the full cap-height band (0.15..0.85)
    // alternating high/low so a single row of blobs can't leave the top
    // or bottom of letters uncovered.
    const vBand = i % 2 === 0 ? 0.18 + rand() * 0.25 : 0.55 + rand() * 0.28;
    const cy = vBand;
    const rMax = 0.85 + rand() * 0.55;
    const delay = rand() * 0.5;
    const duration = 0.55 + rand() * 0.3;
    blobs.push({ cx, cy, rMax, delay, duration });
  }
  return blobs;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInCubic(t: number): number {
  return t * t * t;
}

export function blobRadiusAt(blob: Blob, progress: number, reversing: boolean): number {
  const p = Math.max(0, Math.min(1, progress));
  const local = Math.max(0, Math.min(1, (p - blob.delay) / blob.duration));
  const eased = reversing ? easeInCubic(local) : easeOutCubic(local);
  return blob.rMax * eased;
}
