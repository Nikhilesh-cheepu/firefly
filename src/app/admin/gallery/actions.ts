"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdminSession } from "@/lib/admin-auth";
import { requirePrisma } from "@/lib/db";

function str(v: FormDataEntryValue | null): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export async function addGalleryImageFromUpload(
  url: string,
  alt?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdminSession();
  const u = url.trim();
  if (!u) {
    return { ok: false, error: "Missing image URL." };
  }

  const prisma = requirePrisma();
  const maxOrder = await prisma.galleryImage.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  await prisma.galleryImage.create({
    data: {
      url: u,
      alt: alt?.trim() || null,
      sortOrder,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { ok: true };
}

export async function deleteGalleryImage(formData: FormData) {
  await assertAdminSession();
  const id = str(formData.get("id"));
  if (!id) return;
  const prisma = requirePrisma();
  await prisma.galleryImage.delete({ where: { id } }).catch(() => {});
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryImages(formData: FormData) {
  await assertAdminSession();
  const ids = formData
    .getAll("ids")
    .map((v) => String(v).trim())
    .filter(Boolean);
  if (ids.length === 0) return;

  const prisma = requirePrisma();
  await prisma.galleryImage.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function moveGalleryImage(formData: FormData) {
  await assertAdminSession();
  const id = str(formData.get("id"));
  const dir = str(formData.get("direction"));
  if (!id || (dir !== "up" && dir !== "down")) return;

  const prisma = requirePrisma();
  const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" } });
  const i = images.findIndex((s) => s.id === id);
  if (i < 0) return;
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= images.length) return;

  const a = images[i];
  const b = images[j];
  await prisma.$transaction([
    prisma.galleryImage.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.galleryImage.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);

  revalidatePath("/");
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}
