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
let savedBodyPosition = "";
let savedBodyTop = "";
let savedBodyLeft = "";
let savedBodyRight = "";
let savedBodyWidth = "";

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
