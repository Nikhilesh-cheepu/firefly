"use server";

import { revalidatePath } from "next/cache";
import { requirePrisma } from "@/lib/db";

function str(v: FormDataEntryValue | null): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export async function updateSiteSettings(formData: FormData) {
  const prisma = requirePrisma();

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      heroVideoUrl: str(formData.get("heroVideoUrl")),
      heroPosterUrl: str(formData.get("heroPosterUrl")),
      bookTableUrl: str(formData.get("bookTableUrl")),
      contactEmail: str(formData.get("contactEmail")),
      phone: str(formData.get("phone")),
      whatsapp: str(formData.get("whatsapp")),
      instagram: str(formData.get("instagram")),
      mapsUrl: str(formData.get("mapsUrl")),
    },
    update: {
      heroVideoUrl: str(formData.get("heroVideoUrl")),
      heroPosterUrl: str(formData.get("heroPosterUrl")),
      bookTableUrl: str(formData.get("bookTableUrl")),
      contactEmail: str(formData.get("contactEmail")),
      phone: str(formData.get("phone")),
      whatsapp: str(formData.get("whatsapp")),
      instagram: str(formData.get("instagram")),
      mapsUrl: str(formData.get("mapsUrl")),
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
}
