"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Fires `PageView` on client navigations (App Router); first load is handled by `<FacebookPixelHead />` in `<head>`. */
export function FacebookPixelPageView() {
  const pathname = usePathname();
  const skippedFirst = useRef(false);

  useEffect(() => {
    if (!skippedFirst.current) {
      skippedFirst.current = true;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}
