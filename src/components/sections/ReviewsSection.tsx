import { FadeInChild } from "@/components/motion/FadeInChild";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { ReviewsMarqueeClient } from "@/components/sections/ReviewsMarqueeClient";
import { DUMMY_REVIEWS } from "@/data/dummy-reviews";

export function ReviewsSection() {
  return (
    <SectionReveal
      id="reviews"
      className="scroll-mt-6 overflow-x-hidden bg-gradient-to-b from-ff-void via-ff-deep/80 to-ff-deep px-0 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-8 px-0 md:mb-10">
          <FadeInChild>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-ff-mint/90">Love letters</p>
            <h2
              className="mt-2 font-[family-name:var(--font-display)] text-4xl text-ff-glow md:text-5xl"
              style={{ textShadow: "0 0 36px rgba(200,255,120,0.2)" }}
            >
              Reviews
            </h2>
            <p className="mt-3 max-w-xl text-ff-mist/85">
              Sample guest feedback — placeholder until we plug in live ratings.
            </p>
          </FadeInChild>
        </header>
      </div>

      <ReviewsMarqueeClient reviews={DUMMY_REVIEWS} />
    </SectionReveal>
  );
}
