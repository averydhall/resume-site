export const VARIANTS = ["plain", "splotch-reverse", "splotch-once"] as const;

export type Variant = (typeof VARIANTS)[number];

export const DEFAULT_VARIANT: Variant = "splotch-reverse";

export const VARIANT_LABELS: Record<Variant, string> = {
  plain: "A · plain grey",
  "splotch-reverse": "B · splotch (reverse on leave)",
  "splotch-once": "C · splotch (one-shot)",
};

export function isVariant(value: unknown): value is Variant {
  return typeof value === "string" && (VARIANTS as readonly string[]).includes(value);
}
