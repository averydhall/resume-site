"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_VARIANT, isVariant, type Variant } from "@/lib/variants";
import { NavTrio } from "./NavTrio";
import { VariantSwitcher } from "./VariantSwitcher";

const STORAGE_KEY = "resume-site:variant";

export function HomeClient() {
  const searchParams = useSearchParams();
  const urlVariant = searchParams.get("variant");
  const debugProgressRaw = searchParams.get("debugProgress");
  const debugProgress = debugProgressRaw != null ? Number(debugProgressRaw) : null;

  const [variant, setVariant] = useState<Variant>(() =>
    isVariant(urlVariant) ? urlVariant : DEFAULT_VARIANT
  );

  // On mount, if no URL override, honor localStorage.
  useEffect(() => {
    if (isVariant(urlVariant)) return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isVariant(stored)) setVariant(stored);
    } catch {
      /* ignore */
    }
    // Intentionally run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist variant to localStorage. Intentionally do not write to the URL.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, variant);
    } catch {
      /* ignore */
    }
  }, [variant]);

  // If the page loaded with ?variant=... in the URL, strip it so the address bar stays clean.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("variant")) return;
    params.delete("variant");
    const query = params.toString();
    const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", newUrl);
  }, []);

  const pick = useCallback((v: Variant) => setVariant(v), []);

  return (
    <>
      <main className="grid min-h-dvh place-items-center px-6 py-16">
        <NavTrio variant={variant} debugProgress={debugProgress} />
      </main>
      <VariantSwitcher current={variant} onPick={pick} />
    </>
  );
}
