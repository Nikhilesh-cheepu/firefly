"use client";

import { useLayoutEffect } from "react";

/**
 * Bassik embed sets `body { position: fixed }` while open. If close fails, the home page cannot scroll.
 * Also clears stray overflow locks that are not ref-counted by our modal hook.
 */
export function EnsurePageScrollable() {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (body.style.position === "fixed") {
      const top = Math.abs(parseInt(body.style.top || "0", 10)) || 0;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      window.scrollTo(0, top);
    }

    if (!document.getElementById("bassik-chat-overlay")) {
      if (html.style.overflow === "hidden") html.style.overflow = "";
      if (body.style.overflow === "hidden") body.style.overflow = "";
    }
  }, []);

  return null;
}
