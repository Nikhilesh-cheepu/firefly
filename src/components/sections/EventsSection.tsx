import type { BassikOffer } from "@/lib/bassik";
import { FadeInChild } from "@/components/motion/FadeInChild";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { EventOffersRow } from "@/components/sections/EventOffersRow";

type Props = {
  offers: BassikOffer[];
  /** When false and there are no offers, show setup hint instead of generic copy. */
  bassikConfigured?: boolean;
};

export function EventsSection({ offers, bassikConfigured = true }: Props) {
  return (
    <SectionReveal
      id="events"
      className="scroll-mt-6 bg-gradient-to-b from-ff-deep via-ff-void to-ff-deep px-4 py-7 sm:px-6 md:py-10"
      delay={0.02}
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
            <p className="ff-card rounded-2xl border border-ff-glow/15 bg-ff-void/60 px-5 py-8 text-center text-sm leading-relaxed text-ff-mist/85 backdrop-blur-sm">
              {!bassikConfigured ? (
                <>
                  Live offers load from your Bassik venue API. Add{" "}
                  <code className="rounded bg-ff-deep px-1 py-0.5 text-ff-glow/90">BASSIK_BASE_URL</code>{" "}
                  to <code className="rounded bg-ff-deep px-1 py-0.5 text-ff-glow/90">.env.local</code>{" "}
                  (see <code className="rounded bg-ff-deep px-1 py-0.5 text-ff-glow/90">.env.example</code>
                  ). The home page calls{" "}
                  <code className="rounded bg-ff-deep px-1 py-0.5 text-ff-glow/90">
                    /api/venues/firefly
                  </code>
                  .
                </>
              ) : (
                <>
                  No offers are live right now. When they are published in Bassik, they will appear here.
                  If you expected data, check that the API returns{" "}
                  <code className="rounded bg-ff-deep px-1 py-0.5 text-ff-glow/90">offers</code> (or{" "}
                  <code className="rounded bg-ff-deep px-1 py-0.5 text-ff-glow/90">venue.offers</code>
                  ).
                </>
              )}
            </p>
          </FadeInChild>
        ) : (
          <EventOffersRow offers={offers} />
        )}
      </div>
    </SectionReveal>
  );
}
