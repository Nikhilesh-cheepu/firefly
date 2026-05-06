"use client";

import { useEffect, useState } from "react";

/**
 * Framer's `useReducedMotion()` can match `prefers-reduced-motion` on the client during the first
 * paint while SSR assumes default → React hydration mismatches (#418).
 * This stays `false` until after mount so server HTML and the first client render match.
 */
export function useHydrationSafeReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
