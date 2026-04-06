import { StickyBar } from "@/components/StickyBar";
import { BookSection } from "@/components/sections/BookSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { MenuSection } from "@/components/sections/MenuSection";
import { VisitSection } from "@/components/sections/VisitSection";
import { getFireflyOffersFromBassik } from "@/lib/bassik";
import {
  getGalleryImages,
  getHeroSlides,
  getMenuCategories,
  getSiteSettings,
} from "@/lib/site-data";

export const revalidate = 30;

export default async function Home() {
  const [settings, heroSlides, categories, gallery, offers] = await Promise.all([
    getSiteSettings(),
    getHeroSlides(),
    getMenuCategories(),
    getGalleryImages(),
    getFireflyOffersFromBassik(),
  ]);

  return (
    <>
      <main className="flex-1 pb-40 [padding-left:max(0px,env(safe-area-inset-left))] [padding-right:max(0px,env(safe-area-inset-right))] sm:pb-36">
        <HeroCarousel
          slides={heroSlides}
          fallbackVideo={settings.heroVideoUrl}
          fallbackPoster={settings.heroPosterUrl}
        />
        <EventsSection offers={offers} />
        <MenuSection categories={categories} />
        <GallerySection images={gallery} />
        <VisitSection settings={settings} />
        <BookSection />
        <footer className="ff-shadow-soft border-t border-ff-glow/12 bg-ff-void/95 px-4 py-10 text-center text-xs text-ff-mist/70 backdrop-blur-sm">
          © {new Date().getFullYear()} Firefly · Telugu club
        </footer>
      </main>
      <StickyBar settings={settings} />
    </>
  );
}
