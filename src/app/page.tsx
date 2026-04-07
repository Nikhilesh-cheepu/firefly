import { Suspense } from "react";
import { HomeEventsBlock } from "@/app/HomeEventsBlock";
import { MenuSheetsProvider } from "@/components/menu/MenuSheetsProvider";
import { SectionBridge } from "@/components/SectionBridge";
import { StickyBar } from "@/components/StickyBar";
import { EventsSectionSkeleton } from "@/components/sections/EventsSectionSkeleton";
import { GallerySection } from "@/components/sections/GallerySection";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { MenuSection } from "@/components/sections/MenuSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { DUMMY_HAPPY_HOURS, DUMMY_MENU_CATEGORIES } from "@/data/dummy-menu";
import { getGalleryImages, getHeroSlides, getSiteSettings } from "@/lib/site-data";

export const revalidate = 30;

export default async function Home() {
  const [settings, heroSlides, gallery] = await Promise.all([
    getSiteSettings(),
    getHeroSlides(),
    getGalleryImages(),
  ]);

  const foodItems = DUMMY_MENU_CATEGORIES[0]?.items ?? [];
  const beverageItems = DUMMY_MENU_CATEGORIES[1]?.items ?? [];

  return (
    <MenuSheetsProvider
      happyHourGroups={DUMMY_HAPPY_HOURS}
      foodItems={foodItems}
      beverageItems={beverageItems}
    >
      <main className="flex-1 pb-40 [overflow-anchor:none] [padding-left:max(0px,env(safe-area-inset-left))] [padding-right:max(0px,env(safe-area-inset-right))] sm:pb-36">
        <HeroCarousel
          slides={heroSlides}
          fallbackVideo={settings.heroVideoUrl}
          fallbackPoster={settings.heroPosterUrl}
        />
        <SectionBridge className="from-ff-hero-void via-ff-deep/45 to-ff-deep" />
        <Suspense fallback={<EventsSectionSkeleton />}>
          <HomeEventsBlock />
        </Suspense>
        <SectionBridge className="from-ff-deep via-ff-forest/25 to-ff-forest/40" />
        <MenuSection />
        <SectionBridge className="from-ff-void via-ff-deep/60 to-ff-deep" />
        <GallerySection images={gallery} />
        <SectionBridge className="from-ff-deep via-ff-void/70 to-ff-void" />
        <ReviewsSection />
        <SectionBridge className="from-ff-void via-ff-deep/50 to-ff-deep" />
        <footer
          id="book"
          className="ff-shadow-soft scroll-mt-8 bg-ff-void/95 px-4 py-8 text-center text-xs text-ff-mist/70 backdrop-blur-sm sm:py-9"
        >
          © {new Date().getFullYear()} Firefly · Telugu club
        </footer>
      </main>
      <StickyBar settings={settings} />
    </MenuSheetsProvider>
  );
}
