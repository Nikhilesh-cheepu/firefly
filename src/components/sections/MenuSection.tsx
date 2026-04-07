import { FadeInChild } from "@/components/motion/FadeInChild";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { MenuSheetButtonsRow } from "@/components/sections/MenuSheetButtonsRow";

export function MenuSection() {
  return (
    <SectionReveal
      id="menu"
      className="scroll-mt-6 bg-gradient-to-b from-ff-forest/40 via-ff-deep to-ff-void px-4 py-12 sm:px-6 md:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <FadeInChild className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-ff-mint/90">
              Eat &amp; drink
            </p>
            <h2
              className="mt-2 font-[family-name:var(--font-display)] text-4xl text-ff-glow md:text-5xl"
              style={{ textShadow: "0 0 36px rgba(200,255,120,0.2)" }}
            >
              Menu
            </h2>
            <p className="mt-3 max-w-xl text-ff-mist/85">
              Tap food, drinks, or happy hours — sample lists only until the final menu is live.
            </p>
          </FadeInChild>
          <FadeInChild delay={0.04} className="w-full md:max-w-xl md:flex-1">
            <MenuSheetButtonsRow />
          </FadeInChild>
        </header>

        <FadeInChild delay={0.06}>
          <p
            role="status"
            className="rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-center text-sm leading-relaxed text-amber-100/95 backdrop-blur-sm"
          >
            <span className="font-semibold text-amber-200">Sample menu — not final.</span> We&apos;re
            updating our menu; items and prices may change.
          </p>
        </FadeInChild>
      </div>
    </SectionReveal>
  );
}
