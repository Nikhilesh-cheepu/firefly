"use server";

import { revalidatePath } from "next/cache";
import { assertAdminSession } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function approveGuestReview(formData: FormData): Promise<void> {
  await assertAdminSession();
  const id = str(formData.get("id"));
  if (!id) return;

  const prisma = getPrisma();
  if (!prisma) return;

  await prisma.guestReview.updateMany({
    where: { id, status: "PENDING" },
    data: { status: "APPROVED" },
  });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function rejectGuestReview(formData: FormData): Promise<void> {
  await assertAdminSession();
  const id = str(formData.get("id"));
  if (!id) return;

  const prisma = getPrisma();
  if (!prisma) return;

  await prisma.guestReview.updateMany({
    where: { id, status: "PENDING" },
    data: { status: "REJECTED" },
  });
  revalidatePath("/admin/reviews");
}
