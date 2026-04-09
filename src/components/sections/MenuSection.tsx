import { FadeInChild } from "@/components/motion/FadeInChild";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { MenuSheetButtonsRow } from "@/components/sections/MenuSheetButtonsRow";

export function MenuSection() {
  return (
    <SectionReveal
      id="menu"
      className="scroll-mt-6 bg-gradient-to-b from-ff-forest/40 via-ff-deep to-ff-void px-4 py-12 sm:px-6 md:py-16"
      delay={0.03}
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
          </FadeInChild>
          <FadeInChild delay={0.04} className="w-full md:max-w-xl md:flex-1">
            <MenuSheetButtonsRow />
            <p className="mt-2 text-sm text-amber-200/90">
              Due to ongoing global issues, the food menu is limited.
            </p>
          </FadeInChild>
        </header>

      </div>
    </SectionReveal>
  );
}
