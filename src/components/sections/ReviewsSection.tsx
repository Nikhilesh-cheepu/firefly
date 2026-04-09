import { FadeInChild } from "@/components/motion/FadeInChild";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { ReviewsMarqueeClient } from "@/components/sections/ReviewsMarqueeClient";
import { WriteReviewSheet } from "@/components/sections/WriteReviewSheet";
import { DUMMY_REVIEWS } from "@/data/dummy-reviews";
import { getPrisma } from "@/lib/db";
import { getApprovedGuestReviews } from "@/lib/guest-reviews";

export async function ReviewsSection() {
  const prisma = getPrisma();
  const canSubmitReview = Boolean(prisma);
  const reviews = prisma ? await getApprovedGuestReviews() : DUMMY_REVIEWS;

  return (
    <SectionReveal
      id="reviews"
      className="scroll-mt-6 overflow-x-hidden bg-gradient-to-b from-ff-void via-ff-deep/80 to-ff-deep px-0 py-12 sm:py-16"
      delay={0.05}
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
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ff-mist/80">
              Notes from nights out at Firefly — real voices from the floor.
            </p>
            <WriteReviewSheet canSubmitReview={canSubmitReview} />
          </FadeInChild>
        </header>
      </div>

      {reviews.length === 0 ? (
        <div className="mx-auto max-w-6xl px-4 pb-2 text-center sm:px-6">
          <FadeInChild delay={0.06}>
            <p className="text-sm text-ff-mist/75">
              Nothing here yet — when guests share their nights, you&apos;ll see them scroll by.
            </p>
          </FadeInChild>
        </div>
      ) : (
        <ReviewsMarqueeClient reviews={reviews} />
      )}
    </SectionReveal>
  );
}
