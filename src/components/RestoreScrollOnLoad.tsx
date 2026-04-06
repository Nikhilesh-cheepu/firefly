"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * Mobile Safari / Chrome often restore scroll late or use body vs document scrolling.
 * Avoid `behavior: "instant"` (not universal); set scrollTop on both roots.
 */
function hardScrollTop() {
  if (typeof window === "undefined") return;
  /* Clicking "Book table" used <Link href="#book"> → reload kept #book and jumped to footer. */
  if (window.location.hash === "#book") {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search || ""}`);
  } else if (window.location.hash) {
    return;
  }
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.documentElement.scrollLeft = 0;
  document.body.scrollTop = 0;
  document.body.scrollLeft = 0;
}

/**
 * Full reloads were restoring or anchoring scroll near the footer. Force top unless the URL
 * has a hash (same-page anchor). Staggered timeouts catch late layout (fonts, media, sticky UI).
 */
export function RestoreScrollOnLoad() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    hardScrollTop();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";

    const onPageShow = () => {
      window.history.scrollRestoration = "manual";
      hardScrollTop();
    };

    window.addEventListener("pageshow", onPageShow);

    const delays = [0, 50, 150, 400, 800, 1600];
    const timers = delays.map((ms) => window.setTimeout(hardScrollTop, ms));

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      timers.forEach(clearTimeout);
    };
  }, []);

  return null;
}
