"use client";

import { useLayoutEffect } from "react";

let lockCount = 0;
let savedHtmlOverflow = "";
let savedBodyOverflow = "";
let savedBodyPosition = "";
let savedBodyTop = "";
let savedBodyLeft = "";
let savedBodyRight = "";
let savedBodyWidth = "";

export function getBodyScrollLockCount(): number {
  return lockCount;
}

/** True when Bassik chat sheet or our modal stack should own page scroll. */
export function isExternalScrollLockActive(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(document.getElementById("bassik-chat-overlay"));
}

/**
 * Clears stray inline scroll locks (e.g. Bassik embed) when no modal stack is active.
 * Contact sheet close was fixing scroll because release() restored overflow — this does the same on load.
 */
export function ensurePageScrollable(force = false): void {
  if (typeof document === "undefined") return;
  if (!force && (lockCount > 0 || isExternalScrollLockActive())) return;

  const html = document.documentElement;
  const body = document.body;

  if (body.style.position === "fixed") {
    const top = Math.abs(parseInt(body.style.top || "0", 10)) || 0;
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    if (top > 0) window.scrollTo(0, top);
  }

  html.style.removeProperty("overflow");
  body.style.removeProperty("overflow");
}

function acquire() {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const body = document.body;
  if (lockCount === 0) {
    savedHtmlOverflow = html.style.overflow;
    savedBodyOverflow = body.style.overflow;
    savedBodyPosition = body.style.position;
    savedBodyTop = body.style.top;
    savedBodyLeft = body.style.left;
    savedBodyRight = body.style.right;
    savedBodyWidth = body.style.width;
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
  body.style.position = savedBodyPosition;
  body.style.top = savedBodyTop;
  body.style.left = savedBodyLeft;
  body.style.right = savedBodyRight;
  body.style.width = savedBodyWidth;
  savedHtmlOverflow = "";
  savedBodyOverflow = "";
  savedBodyPosition = "";
  savedBodyTop = "";
  savedBodyLeft = "";
  savedBodyRight = "";
  savedBodyWidth = "";

  ensurePageScrollable(true);
}

export function useBodyScrollLock(active: boolean) {
  useLayoutEffect(() => {
    if (!active) return;
    acquire();
    return () => {
      release();
    };
  }, [active]);
}
