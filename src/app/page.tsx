import { Suspense } from "react";
import { HomeEventsBlock } from "@/app/HomeEventsBlock";
import { MenuSheetsProvider } from "@/components/menu/MenuSheetsProvider";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { SectionBridge } from "@/components/SectionBridge";
import { StickyBar } from "@/components/StickyBar";
import { EventsSectionSkeleton } from "@/components/sections/EventsSectionSkeleton";
import { GallerySection } from "@/components/sections/GallerySection";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { MenuSection } from "@/components/sections/MenuSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { BAR_MENU_ITEMS, DUMMY_HAPPY_HOURS, FOOD_MENU_ITEMS } from "@/data/dummy-menu";
import { getHeroSlides, getSiteSettings } from "@/lib/site-data";

export const revalidate = 30;

export default async function Home() {
  const [settings, heroSlides] = await Promise.all([getSiteSettings(), getHeroSlides()]);

  const foodItems = FOOD_MENU_ITEMS;
  const beverageItems = BAR_MENU_ITEMS;

  return (
    <MenuSheetsProvider
      happyHourGroups={DUMMY_HAPPY_HOURS}
      foodItems={foodItems}
      beverageItems={beverageItems}
      whatsappRaw={settings.whatsapp}
    >
      <main className="flex-1 pb-40 [overflow-anchor:none] [padding-left:max(0px,env(safe-area-inset-left))] [padding-right:max(0px,env(safe-area-inset-right))] sm:pb-36">
        <ScrollReveal y={14}>
          <HeroCarousel
            slides={heroSlides}
            fallbackVideo={settings.heroVideoUrl}
            fallbackPoster={settings.heroPosterUrl}
          />
        </ScrollReveal>
        <SectionBridge className="from-ff-hero-void via-ff-deep/45 to-ff-deep" />
        <Suspense fallback={<EventsSectionSkeleton />}>
          <ScrollReveal delay={0.06} y={22}>
            <HomeEventsBlock />
          </ScrollReveal>
        </Suspense>
        <SectionBridge className="from-ff-deep via-ff-forest/25 to-ff-forest/40" />
        <ScrollReveal delay={0.04} y={22}>
          <MenuSection />
        </ScrollReveal>
        <SectionBridge className="from-ff-void via-ff-deep/60 to-ff-deep" />
        <Suspense fallback={<div className="h-40 bg-black/70" />}>
          <ScrollReveal delay={0.08} y={22}>
            <GallerySection />
          </ScrollReveal>
        </Suspense>
        <SectionBridge className="from-ff-deep via-ff-void/70 to-ff-void" />
        <ScrollReveal delay={0.06} y={22}>
          <ReviewsSection />
        </ScrollReveal>
        <SectionBridge className="from-ff-void via-ff-deep/50 to-ff-deep" />
        <ScrollReveal y={16}>
          <footer
            id="book"
            className="ff-shadow-soft scroll-mt-8 bg-ff-void/95 px-4 py-8 text-center text-xs text-ff-mist/70 backdrop-blur-sm sm:py-9"
          >
            © {new Date().getFullYear()} Firefly · Telugu club
          </footer>
        </ScrollReveal>
      </main>
      <StickyBar settings={settings} />
    </MenuSheetsProvider>
  );
}
