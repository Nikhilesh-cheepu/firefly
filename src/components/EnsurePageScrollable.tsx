"use client";

import { useEffect, useLayoutEffect } from "react";
import { ensurePageScrollable } from "@/lib/body-scroll-lock";

/** Clears stray Bassik / inline scroll locks on load and when returning to the tab. */
export function EnsurePageScrollable() {
  useLayoutEffect(() => {
    ensurePageScrollable(true);
  }, []);

  useEffect(() => {
    ensurePageScrollable(true);

    const onPageShow = () => ensurePageScrollable(true);
    const onVisibility = () => {
      if (!document.hidden) ensurePageScrollable(true);
    };

    const onBassikClose = (event: MessageEvent) => {
      if (event.data?.type === "bassik-chat-close") {
        window.setTimeout(() => ensurePageScrollable(true), 0);
      }
    };

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("message", onBassikClose);

    const t1 = window.setTimeout(() => ensurePageScrollable(true), 100);
    const t2 = window.setTimeout(() => ensurePageScrollable(true), 500);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("message", onBassikClose);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return null;
}
