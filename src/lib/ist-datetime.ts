/** Helpers for club operations in India (Asia/Kolkata). */

export function istYmd(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Minutes from midnight in IST (0–1439). */
export function istNowMinutesFromMidnight(date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

/** Add calendar days in IST, starting from an IST calendar `YYYY-MM-DD`. */
export function addDaysISTYmd(ymd: string, delta: number): string {
  const ms = new Date(`${ymd}T12:00:00+05:30`).getTime() + delta * 86_400_000;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

export function formatISTDateLong(ymd: string): string {
  const dt = new Date(`${ymd}T12:00:00+05:30`);
  return dt.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}
