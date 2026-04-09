import { Suspense } from "react";
import { HomeEventsBlock } from "@/app/HomeEventsBlock";
import { MenuSheetsProvider } from "@/components/menu/MenuSheetsProvider";
import { BridgeReveal } from "@/components/motion/BridgeReveal";
import { FooterReveal } from "@/components/motion/FooterReveal";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { StickyBar } from "@/components/StickyBar";
import { EventsSectionSkeleton } from "@/components/sections/EventsSectionSkeleton";
import { GallerySection } from "@/components/sections/GallerySection";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { MenuSection } from "@/components/sections/MenuSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { BAR_MENU_ITEMS, DUMMY_HAPPY_HOURS, FOOD_MENU_ITEMS } from "@/data/dummy-menu";
import { getHeroSlides, getSiteSettings } from "@/lib/site-data";

export const revalidate = 30;

function GalleryLoadingFallback() {
  return (
    <SectionReveal
      id="gallery"
      className="scroll-mt-6 bg-black px-1 py-5 sm:px-2 md:py-6"
      delay={0.04}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-2 h-11 w-40 max-w-[55%] animate-pulse rounded-xl bg-ff-glow/12 md:mb-3 md:h-12 md:w-48" />
        <div className="mx-auto aspect-square max-w-xl rounded-[2rem] bg-ff-deep/30 sm:max-w-2xl" />
      </div>
    </SectionReveal>
  );
}

function ReviewsLoadingFallback() {
  return (
    <SectionReveal
      id="reviews"
      className="scroll-mt-6 overflow-x-hidden bg-gradient-to-b from-ff-void via-ff-deep/80 to-ff-deep px-0 py-12 sm:py-16"
      delay={0.05}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 h-3 w-28 animate-pulse rounded bg-ff-mint/20 md:mb-10" />
        <div className="h-12 w-[min(100%,280px)] animate-pulse rounded-xl bg-ff-glow/12" />
        <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded bg-ff-mist/10" />
      </div>
      <div className="mt-8 flex gap-4 overflow-hidden px-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-36 w-[min(85vw,300px)] shrink-0 animate-pulse rounded-2xl bg-ff-void/50"
          />
        ))}
      </div>
    </SectionReveal>
  );
}

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
        <ScrollReveal y={18}>
          <HeroCarousel
            slides={heroSlides}
            fallbackVideo={settings.heroVideoUrl}
            fallbackPoster={settings.heroPosterUrl}
          />
        </ScrollReveal>
        <BridgeReveal className="from-ff-hero-void via-ff-deep/45 to-ff-deep" />
        <Suspense fallback={<EventsSectionSkeleton />}>
          <HomeEventsBlock />
        </Suspense>
        <BridgeReveal className="from-ff-deep via-ff-forest/25 to-ff-forest/40" />
        <MenuSection />
        <BridgeReveal className="from-ff-void via-ff-deep/60 to-ff-deep" />
        <Suspense fallback={<GalleryLoadingFallback />}>
          <GallerySection />
        </Suspense>
        <BridgeReveal className="from-ff-deep via-ff-void/70 to-ff-void" />
        <Suspense fallback={<ReviewsLoadingFallback />}>
          <ReviewsSection />
        </Suspense>
        <BridgeReveal className="from-ff-void via-ff-deep/50 to-ff-deep" />
        <FooterReveal
          id="book"
          className="ff-shadow-soft scroll-mt-8 bg-ff-void/95 px-4 py-8 text-center text-xs text-ff-mist/70 backdrop-blur-sm sm:py-9"
        >
          © {new Date().getFullYear()} Firefly · Telugu club
        </FooterReveal>
      </main>
      <StickyBar settings={settings} />
    </MenuSheetsProvider>
  );
}
