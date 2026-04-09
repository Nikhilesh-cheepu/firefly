import type { HeroSlide, MenuCategory, MenuItem } from "@prisma/client";
import { DUMMY_MENU_CATEGORIES } from "@/data/dummy-menu";
import { getPrisma } from "@/lib/db";

export type MenuCategoryWithItems = MenuCategory & { items: MenuItem[] };

/** When the DB has no menu rows, show placeholder Food + Beverage from `dummy-menu`. */
export function resolveMenuCategoriesForHome(
  dbCategories: MenuCategoryWithItems[],
): { categories: MenuCategoryWithItems[]; isPlaceholderMenu: boolean } {
  if (dbCategories.length > 0) {
    return { categories: dbCategories, isPlaceholderMenu: false };
  }
  return { categories: DUMMY_MENU_CATEGORIES, isPlaceholderMenu: true };
}

export type SiteSettingsDTO = {
  heroVideoUrl: string | null;
  heroPosterUrl: string | null;
  bookTableUrl: string | null;
  contactEmail: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  mapsUrl: string | null;
};

function envFallback(): SiteSettingsDTO {
  return {
    heroVideoUrl: process.env.NEXT_PUBLIC_HERO_VIDEO_URL ?? null,
    heroPosterUrl: process.env.NEXT_PUBLIC_HERO_POSTER_URL ?? null,
    bookTableUrl: process.env.NEXT_PUBLIC_BOOK_TABLE_URL ?? "/book",
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null,
    phone: process.env.NEXT_PUBLIC_PHONE ?? null,
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? null,
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? null,
    mapsUrl: process.env.NEXT_PUBLIC_MAPS_URL ?? null,
  };
}

export async function getSiteSettings(): Promise<SiteSettingsDTO> {
  const prisma = getPrisma();
  if (!prisma) return envFallback();

  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });
    if (!row) return envFallback();
    const fb = envFallback();
    return {
      heroVideoUrl: row.heroVideoUrl ?? fb.heroVideoUrl,
      heroPosterUrl: row.heroPosterUrl ?? fb.heroPosterUrl,
      bookTableUrl: row.bookTableUrl ?? fb.bookTableUrl,
      contactEmail: row.contactEmail ?? fb.contactEmail,
      phone: row.phone ?? fb.phone,
      whatsapp: row.whatsapp ?? fb.whatsapp,
      instagram: row.instagram ?? fb.instagram,
      mapsUrl: row.mapsUrl ?? fb.mapsUrl,
    };
  } catch {
    return envFallback();
  }
}

export async function getMenuCategories() {
  const prisma = getPrisma();
  if (!prisma) return [];

  try {
    return await prisma.menuCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
      },
    });
  } catch {
    return [];
  }
}

export async function getGalleryImages() {
  const prisma = getPrisma();
  if (!prisma) return [];

  try {
    return await prisma.galleryImage.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getGalleryPreviewImages(limit = 14) {
  const prisma = getPrisma();
  if (!prisma) return [];

  try {
    return await prisma.galleryImage.findMany({
      orderBy: { sortOrder: "asc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const prisma = getPrisma();
  if (!prisma) return [];

  try {
    return await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}
