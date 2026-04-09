"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function submitGuestReview(input: {
  authorName: string;
  rating: number;
  body: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const authorName = str(input.authorName);
  const body = str(input.body);
  const rating = Number(input.rating);

  if (authorName.length < 2 || authorName.length > 80) {
    return { ok: false, error: "Please enter your name (2–80 characters)." };
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5 || Math.round(rating) !== rating) {
    return { ok: false, error: "Please choose a star rating from 1 to 5." };
  }
  if (body.length < 10 || body.length > 500) {
    return { ok: false, error: "Please write a few words (10–500 characters)." };
  }

  const prisma = getPrisma();
  if (!prisma) {
    return { ok: false, error: "Something went wrong. Please try again in a moment." };
  }

  try {
    await prisma.guestReview.create({
      data: {
        authorName,
        rating,
        body,
        status: "PENDING",
      },
    });
    revalidatePath("/admin/reviews");
    return { ok: true };
  } catch (e) {
    console.error("GuestReview create failed", e);
    return { ok: false, error: "Something went wrong. Please try again in a moment." };
  }
}
