/**
 * Lunch: 12:00 PM – 5:45 PM · Dinner: 6:15 PM – 11:45 PM (IST), 15-minute steps.
 * Used by /book UI and server validation.
 */

export type MealSegment = "lunch" | "dinner";

export type BookingSlotMeta = {
  label: string;
  segment: MealSegment;
  /** Minutes from midnight (IST) at slot start */
  minutes: number;
};

function formatSlotLabel(hour24: number, minute: number): string {
  const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const ampm = hour24 < 12 ? "AM" : "PM";
  const mm = minute.toString().padStart(2, "0");
  return `${h12}:${mm} ${ampm}`;
}

function buildRange(startMin: number, endMin: number, segment: MealSegment): BookingSlotMeta[] {
  const out: BookingSlotMeta[] = [];
  for (let m = startMin; m <= endMin; m += 15) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    out.push({ label: formatSlotLabel(h, min), segment, minutes: m });
  }
  return out;
}

/** 12:00 PM → 5:45 PM */
export const LUNCH_SLOTS: BookingSlotMeta[] = buildRange(12 * 60, 17 * 60 + 45, "lunch");

/** 6:15 PM → 11:45 PM */
export const DINNER_SLOTS: BookingSlotMeta[] = buildRange(18 * 60 + 15, 23 * 60 + 45, "dinner");

export const ALL_BOOKING_SLOTS: BookingSlotMeta[] = [...LUNCH_SLOTS, ...DINNER_SLOTS];

const MINUTES_BY_LABEL: Record<string, number> = Object.fromEntries(
  ALL_BOOKING_SLOTS.map((s) => [s.label, s.minutes]),
);

export const BOOKING_SLOT_LABELS: readonly string[] = ALL_BOOKING_SLOTS.map((s) => s.label);

export function isValidBookingSlot(slot: string): boolean {
  return MINUTES_BY_LABEL[slot] !== undefined;
}

export function getSlotMinutes(slot: string): number | undefined {
  return MINUTES_BY_LABEL[slot];
}
