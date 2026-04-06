import { SectionBridge } from "@/components/SectionBridge";
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
        <SectionBridge className="from-ff-hero-void via-ff-deep/45 to-ff-deep" />
        <EventsSection offers={offers} />
        <SectionBridge className="from-ff-deep via-ff-forest/25 to-ff-forest/40" />
        <MenuSection categories={categories} />
        <SectionBridge className="from-ff-void via-ff-deep/60 to-ff-deep" />
        <GallerySection images={gallery} />
        <SectionBridge className="from-ff-deep via-ff-void/80 to-ff-void" />
        <VisitSection settings={settings} />
        <SectionBridge className="from-ff-forest/30 via-ff-void/90 to-ff-void" />
        <BookSection />
        <SectionBridge className="from-ff-void via-ff-void/85 to-ff-void/95" />
        <footer className="ff-shadow-soft bg-ff-void/95 px-4 py-8 text-center text-xs text-ff-mist/70 backdrop-blur-sm sm:py-9">
          © {new Date().getFullYear()} Firefly · Telugu club
        </footer>
      </main>
      <StickyBar settings={settings} />
    </>
  );
}
