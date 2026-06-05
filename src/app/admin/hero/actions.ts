"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { HeroSlideType } from "@prisma/client";
import { assertAdminSession, ensureAdminSession } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";

function str(v: FormDataEntryValue | null): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function dbErrorMessage(e: unknown, model: string): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/does not exist|P2021|relation/i.test(msg)) {
    return `${model} table is missing. Run npm run db:push on the server database.`;
  }
  return `Could not save to database. ${msg.slice(0, 160)}`;
}

export async function addHeroSlideFromUpload(
  mediaUrl: string,
  slideType: "IMAGE" | "VIDEO",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const authErr = await ensureAdminSession();
  if (authErr) return { ok: false, error: authErr };

  const url = mediaUrl.trim();
  if (!url) {
    return { ok: false, error: "Missing media URL." };
  }
  if (slideType !== "IMAGE" && slideType !== "VIDEO") {
    return { ok: false, error: "Invalid slide type." };
  }

  const prisma = getPrisma();
  if (!prisma) {
    return { ok: false, error: "Database not configured. Set DATABASE_URL / DATABASE_PUBLIC_URL." };
  }

  try {
    const maxOrder = await prisma.heroSlide.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    await prisma.heroSlide.create({
      data: {
        type: slideType as HeroSlideType,
        mediaUrl: url,
        sortOrder,
        isActive: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/hero");
    return { ok: true };
  } catch (e) {
    console.error("[addHeroSlideFromUpload]", e);
    return { ok: false, error: dbErrorMessage(e, "HeroSlide") };
  }
}

export async function deleteHeroSlide(formData: FormData) {
  await assertAdminSession();
  const id = str(formData.get("id"));
  if (!id) return;
  const prisma = getPrisma();
  if (!prisma) return;
  await prisma.heroSlide.delete({ where: { id } }).catch(() => {});
  revalidatePath("/");
  revalidatePath("/admin/hero");
  redirect("/admin/hero");
}

export async function moveHeroSlide(formData: FormData) {
  await assertAdminSession();
  const id = str(formData.get("id"));
  const dir = str(formData.get("direction"));
  if (!id || (dir !== "up" && dir !== "down")) return;

  const prisma = getPrisma();
  if (!prisma) return;

  const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });
  const i = slides.findIndex((s) => s.id === id);
  if (i < 0) return;
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= slides.length) return;

  const a = slides[i];
  const b = slides[j];
  await prisma.$transaction([
    prisma.heroSlide.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.heroSlide.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);

  revalidatePath("/");
  revalidatePath("/admin/hero");
  redirect("/admin/hero");
}

export async function toggleHeroSlideActive(formData: FormData) {
  await assertAdminSession();
  const id = str(formData.get("id"));
  if (!id) return;
  const prisma = getPrisma();
  if (!prisma) return;
  const row = await prisma.heroSlide.findUnique({ where: { id } });
  if (!row) return;
  await prisma.heroSlide.update({
    where: { id },
    data: { isActive: !row.isActive },
  });
  revalidatePath("/");
  revalidatePath("/admin/hero");
  redirect("/admin/hero");
}
