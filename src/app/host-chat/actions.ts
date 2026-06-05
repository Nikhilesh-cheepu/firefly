"use server";

import { getPrisma } from "@/lib/db";
import { normalizeIndianPhoneDigits } from "@/lib/indian-phone";

export async function saveHostChatLead(input: {
  guestName: string;
  phone: string;
  source?: string;
  sessionId?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const guestName = input.guestName.trim();
  const phoneRaw = input.phone.trim();

  if (guestName.length < 2) {
    return { ok: false, error: "Invalid name." };
  }

  const digits = normalizeIndianPhoneDigits(phoneRaw.replace(/\D/g, "").slice(-10));
  if (!digits) {
    return { ok: false, error: "Invalid phone." };
  }

  const prisma = getPrisma();
  if (!prisma) {
    return { ok: false, error: "Database not configured." };
  }

  try {
    await prisma.hostChatLead.create({
      data: {
        guestName,
        phone: digits,
        source: input.source?.trim().slice(0, 120) || "host_chat",
        sessionId: input.sessionId?.trim().slice(0, 120) || null,
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("[saveHostChatLead]", e);
    return { ok: false, error: "Could not save lead." };
  }
}
