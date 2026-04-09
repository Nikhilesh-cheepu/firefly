import { SectionReveal } from "@/components/motion/SectionReveal";

export function EventsSectionSkeleton() {
  return (
    <SectionReveal
      id="events"
      className="scroll-mt-6 bg-gradient-to-b from-ff-deep via-ff-void to-ff-deep px-4 py-7 sm:px-6 md:py-10"
      delay={0.02}
    >
      <div className="mx-auto max-w-6xl" aria-busy="true" aria-label="Loading events">
        <div className="mb-4 md:mb-5">
          <div className="h-3 w-24 animate-pulse rounded bg-ff-mint/20" />
          <div className="mt-3 h-9 w-64 max-w-full animate-pulse rounded-lg bg-ff-glow/15 md:h-11 md:w-80" />
        </div>
        <div className="flex gap-3 overflow-hidden pb-1 md:gap-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-[9/16] w-[min(78vw,260px)] shrink-0 animate-pulse rounded-2xl border border-ff-glow/10 bg-ff-void/50 sm:w-[min(42vw,260px)] md:w-[280px]"
            />
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
