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
      className="scroll-mt-6 bg-gradient-to-b from-ff-deep via-ff-void to-ff-deep px-4 py-20 sm:px-6 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 md:mb-14">
          <FadeInChild>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-ff-mint/90">
              Lineup
            </p>
            <h2
              className="mt-2 font-[family-name:var(--font-display)] text-4xl text-ff-glow md:text-5xl"
              style={{ textShadow: "0 0 40px rgba(200,255,120,0.25)" }}
            >
              Events &amp; offers
            </h2>
            <p className="mt-3 max-w-xl text-ff-mist/85">
              Posters and nights from Bassik — same offers you run for Firefly, in 9:16 story format.
            </p>
          </FadeInChild>
        </header>

        {offers.length === 0 ? (
          <FadeInChild delay={0.08}>
            <p className="ff-card rounded-2xl border border-ff-glow/15 bg-ff-void/60 px-6 py-10 text-center text-ff-mist/80 backdrop-blur-sm">
              No upcoming offers yet. Set <code className="text-ff-glow/90">BASSIK_BASE_URL</code>{" "}
              or add offers in Bassik for <code className="text-ff-mint/90">firefly</code>.
            </p>
          </FadeInChild>
        ) : (
          <EventOffersRow offers={offers} />
        )}
      </div>
    </SectionReveal>
  );
}
