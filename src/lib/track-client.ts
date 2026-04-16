"use client";

import type { AnalyticsEventType } from "@/lib/analytics-events";

type TrackPayload = {
  eventType: AnalyticsEventType;
  source?: string;
  meta?: Record<string, unknown>;
};

const SESSION_KEY = "firefly_analytics_sid";

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  window.sessionStorage.setItem(SESSION_KEY, created);
  return created;
}

export function trackEvent(payload: TrackPayload): void {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({
    eventType: payload.eventType,
    source: payload.source ?? "unknown",
    sessionId: getSessionId(),
    path: window.location.pathname,
    meta: payload.meta ?? null,
  });

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/track", blob);
      if (ok) return;
    }
  } catch {
    // Fall through to fetch.
  }

  void fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
    cache: "no-store",
  }).catch(() => {
    // Analytics failures should never block user flow.
  });
}
