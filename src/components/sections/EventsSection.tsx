import type { BassikOffer } from "@/lib/bassik";
import { FadeInChild } from "@/components/motion/FadeInChild";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { EventOffersRow } from "@/components/sections/EventOffersRow";

type Props = {
  offers: BassikOffer[];
};

export function EventsSection({ offers }: Props) {
  return (
    <SectionReveal
      id="events"
      className="scroll-mt-6 bg-gradient-to-b from-ff-deep via-ff-void to-ff-deep px-4 py-7 sm:px-6 md:py-10"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 md:mb-5">
          <FadeInChild>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-ff-mint/90">
              Lineup
            </p>
            <h2
              className="mt-1.5 font-[family-name:var(--font-display)] text-3xl text-ff-glow md:text-4xl"
              style={{ textShadow: "0 0 40px rgba(200,255,120,0.25)" }}
            >
              Events &amp; offers
            </h2>
          </FadeInChild>
        </header>

        {offers.length === 0 ? (
          <FadeInChild delay={0.08}>
            <p className="ff-card rounded-2xl border border-ff-glow/15 bg-ff-void/60 px-5 py-8 text-center text-sm text-ff-mist/85 backdrop-blur-sm">
              New nights and offers will show up here soon. Check back shortly.
            </p>
          </FadeInChild>
        ) : (
          <EventOffersRow offers={offers} />
        )}
      </div>
    </SectionReveal>
  );
}
