"use client";

import { VARIANTS, VARIANT_LABELS, type Variant } from "@/lib/variants";

type Props = {
  current: Variant;
  onPick: (v: Variant) => void;
};

export function VariantSwitcher({ current, onPick }: Props) {
  return (
    <div className="pointer-events-auto fixed bottom-5 right-5 z-50 flex w-[280px] flex-col items-end select-none font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
      <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/70 px-4 py-2 backdrop-blur-sm">
        <span className="text-white/40">variant</span>
        {VARIANTS.map((v, i) => (
          <button
            key={v}
            type="button"
            onClick={() => onPick(v)}
            className={
              "w-5 text-center transition-colors " +
              (current === v
                ? "text-white underline underline-offset-4"
                : "text-white/50 hover:text-white/90")
            }
            aria-pressed={current === v}
            aria-label={VARIANT_LABELS[v]}
            title={VARIANT_LABELS[v]}
          >
            {String.fromCharCode(65 + i)}
          </button>
        ))}
      </div>
      <div className="mt-2 h-4 w-full text-right text-[10px] tracking-[0.15em] text-white/40">
        {VARIANT_LABELS[current]}
      </div>
    </div>
  );
}
