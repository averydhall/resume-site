"use client";

import { useEffect, useState } from "react";
import type { Variant } from "@/lib/variants";
import { NavButton } from "./NavButton";

const ITEMS: { label: string; href: string }[] = [
  { label: "BIO", href: "/bio" },
  { label: "PROJECTS", href: "/projects" },
  { label: "EXPERIENCE", href: "/experience" },
];

function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefers(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return prefers;
}

export function NavTrio({
  variant,
  debugProgress,
}: {
  variant: Variant;
  debugProgress?: number | null;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return (
    <nav
      aria-label="Primary"
      className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6 sm:gap-x-20 md:gap-x-24"
    >
      {ITEMS.map((item) => (
        <NavButton
          key={item.label}
          label={item.label}
          href={item.href}
          variant={variant}
          prefersReducedMotion={prefersReducedMotion}
          debugProgress={debugProgress}
        />
      ))}
    </nav>
  );
}
