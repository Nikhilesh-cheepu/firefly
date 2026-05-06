"use client";

import { useEffect } from "react";

/**
 * Desktop browsers usually scroll `document.documentElement`; mobile often uses `body`.
 * Locking only `body` can leave overflow stuck on `html` or behave inconsistently.
 * Ref-counted so nested modals (menu + sheet) don't unlock early.
 */
let lockCount = 0;
let savedHtmlOverflow = "";
let savedBodyOverflow = "";

function acquire() {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const body = document.body;
  if (lockCount === 0) {
    savedHtmlOverflow = html.style.overflow;
    savedBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
  }
  lockCount += 1;
}

function release() {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  const html = document.documentElement;
  const body = document.body;
  html.style.overflow = savedHtmlOverflow;
  body.style.overflow = savedBodyOverflow;
  savedHtmlOverflow = "";
  savedBodyOverflow = "";
}

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    acquire();
    return () => {
      release();
    };
  }, [active]);
}
