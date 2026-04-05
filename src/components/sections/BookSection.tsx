import { FadeInChild } from "@/components/motion/FadeInChild";
import { SectionReveal } from "@/components/motion/SectionReveal";

export function BookSection() {
  return (
    <SectionReveal
      id="book"
      className="scroll-mt-6 border-t border-ff-glow/15 bg-ff-void px-4 py-16 sm:px-6"
    >
      <div className="mx-auto max-w-xl text-center">
        <FadeInChild>
          <h2
            className="font-[family-name:var(--font-display)] text-3xl text-ff-glow"
            style={{ textShadow: "0 0 24px rgba(200,255,120,0.2)" }}
          >
            Book a table
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ff-mist/80">
            Booking form + Postgres save lands in the next slice. Use the sticky bar or your reservations
            link for now.
          </p>
        </FadeInChild>
      </div>
    </SectionReveal>
  );
}
