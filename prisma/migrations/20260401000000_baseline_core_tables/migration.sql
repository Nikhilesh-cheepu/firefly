-- Idempotent baseline for Firefly core tables (safe when some objects already exist).

DO $$ BEGIN
  CREATE TYPE "HeroSlideType" AS ENUM ('IMAGE', 'VIDEO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "HeroSlide" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "type" "HeroSlideType" NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "posterUrl" TEXT,
    "title" TEXT,
    "ctaUrl" TEXT,
    "ctaLabel" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL,
    "heroVideoUrl" TEXT,
    "heroPosterUrl" TEXT,
    "bookTableUrl" TEXT,
    "contactEmail" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "mapsUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MenuCategory" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MenuItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "GalleryImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TableBooking" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guestName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "slot" TEXT NOT NULL,

    CONSTRAINT "TableBooking_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SiteSettings" ("id", "updatedAt")
VALUES ('default', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
