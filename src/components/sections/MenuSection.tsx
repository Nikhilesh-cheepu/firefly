import type { MenuCategory, MenuItem } from "@prisma/client";
import { FadeInChild } from "@/components/motion/FadeInChild";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { MenuItemsGrid } from "@/components/sections/MenuItemsGrid";

type CategoryWithItems = MenuCategory & { items: MenuItem[] };

type Props = {
  categories: CategoryWithItems[];
};

export function MenuSection({ categories }: Props) {
  return (
    <SectionReveal
      id="menu"
      className="scroll-mt-6 bg-gradient-to-b from-ff-forest/40 via-ff-deep to-ff-void px-4 py-12 sm:px-6 md:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 md:mb-10">
          <FadeInChild>
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
              Curated in Firefly admin — categories and plates tuned for the night.
            </p>
          </FadeInChild>
        </header>

        {categories.length === 0 ? (
          <FadeInChild delay={0.08}>
            <p className="ff-card rounded-2xl border border-ff-glow/15 bg-ff-void/50 px-6 py-10 text-center text-sm leading-relaxed text-ff-mist/80 backdrop-blur-sm">
              Menu cards come from Postgres (admin + Prisma). Set{" "}
              <code className="text-ff-glow/90">DATABASE_URL</code> /{" "}
              <code className="text-ff-glow/90">DATABASE_PUBLIC_URL</code> in{" "}
              <code className="text-ff-glow/90">.env.local</code>, run{" "}
              <code className="text-ff-glow/90">npm run db:push</code>, then add categories in admin. Events
              &amp; offers above are separate — they use{" "}
              <code className="text-ff-glow/90">BASSIK_BASE_URL</code>.
            </p>
          </FadeInChild>
        ) : (
          <MenuItemsGrid categories={categories} />
        )}
      </div>
    </SectionReveal>
  );
}
