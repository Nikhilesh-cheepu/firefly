"use server";

import { getSlotMinutes, isValidBookingSlot } from "@/data/booking-slots";
import { getPrisma } from "@/lib/db";
import { addDaysISTYmd, istNowMinutesFromMidnight, istYmd } from "@/lib/ist-datetime";
import { normalizeIndianPhoneDigits, waMeHrefFromInput } from "@/lib/indian-phone";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function formatDateForMessage(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  const date = new Date(`${isoDate}T12:00:00+05:30`);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function submitTableBooking(input: {
  guestName: string;
  phone: string;
  date: string;
  slot: string;
  whatsappRaw: string | null;
}): Promise<
  | { ok: true; waUrl: string }
  | { ok: false; error: string }
> {
  const guestName = str(input.guestName);
  const phoneRaw = str(input.phone);
  const dateStr = str(input.date);
  const slot = str(input.slot);

  if (guestName.length < 2) {
    return { ok: false, error: "Please enter your name." };
  }
  const phoneDigitsOnly = phoneRaw.replace(/\D/g, "");
  if (!/^\d{10}$/.test(phoneDigitsOnly)) {
    return { ok: false, error: "Enter your 10-digit mobile number." };
  }
  const digits = normalizeIndianPhoneDigits(phoneDigitsOnly);
  if (!digits) {
    return { ok: false, error: "Enter your 10-digit mobile number." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { ok: false, error: "Please pick a date." };
  }
  if (!isValidBookingSlot(slot)) {
    return { ok: false, error: "Please choose a time slot." };
  }

  const todayIst = istYmd();
  const maxIst = addDaysISTYmd(todayIst, 60);
  if (dateStr < todayIst) {
    return { ok: false, error: "Date must be today or later." };
  }
  if (dateStr > maxIst) {
    return { ok: false, error: "Please book within the next 60 days." };
  }

  const picked = new Date(`${dateStr}T12:00:00+05:30`);

  if (dateStr === todayIst) {
    const slotMin = getSlotMinutes(slot);
    if (slotMin === undefined) {
      return { ok: false, error: "Please choose a time slot." };
    }
    const nowMin = istNowMinutesFromMidnight();
    if (slotMin <= nowMin) {
      return { ok: false, error: "That time has already passed. Pick a later slot." };
    }
  }

  const waBase = waMeHrefFromInput(input.whatsappRaw);
  if (!waBase) {
    return { ok: false, error: "WhatsApp is not configured for this site yet." };
  }

  const phoneDisplay = `${phoneDigitsOnly.slice(0, 5)} ${phoneDigitsOnly.slice(5)}`;
  const lines = [
    "Hi Firefly — I'd love to book a table! 🎵",
    "",
    `Name: ${guestName}`,
    `Phone: ${phoneDisplay}`,
    `Date: ${formatDateForMessage(dateStr)}`,
    `Preferred slot: ${slot}`,
    "",
    "We're looking forward to Tollywood music, great food, and a budget-friendly night out. Please confirm this slot — thank you!",
  ];
  const waUrl = `${waBase}${waBase.includes("?") ? "&" : "?"}text=${encodeURIComponent(lines.join("\n"))}`;

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.tableBooking.create({
        data: {
          guestName,
          phone: digits,
          date: picked,
          slot,
        },
      });
    } catch (e) {
      console.error("TableBooking create failed", e);
    }
  }

  return { ok: true, waUrl };
}
