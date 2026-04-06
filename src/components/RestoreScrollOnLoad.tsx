"use client";

import { useEffect } from "react";

/**
 * Full reloads were restoring or anchoring scroll near the footer. Force top once on mount
 * unless the URL has a hash (same-page anchor).
 */
export function RestoreScrollOnLoad() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const snapTop = () => {
      if (window.location.hash) return;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    };

    snapTop();
    requestAnimationFrame(snapTop);
    queueMicrotask(snapTop);
    const t = window.setTimeout(snapTop, 0);

    return () => {
      window.clearTimeout(t);
      window.history.scrollRestoration = prev;
    };
  }, []);

  return null;
}
