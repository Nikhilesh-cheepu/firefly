import type { SiteSettingsDTO } from "@/lib/site-data";
import { FadeInChild } from "@/components/motion/FadeInChild";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { MapsCta } from "@/components/sections/MapsCta";

type Props = {
  settings: SiteSettingsDTO;
};

export function VisitSection({ settings }: Props) {
  return (
    <SectionReveal
      id="visit"
      className="scroll-mt-6 bg-gradient-to-b from-ff-void to-ff-forest/30 px-4 py-12 sm:px-6 md:py-14"
    >
      <div className="mx-auto max-w-6xl text-center md:text-left">
        <FadeInChild>
          <h2
            className="font-[family-name:var(--font-display)] text-3xl text-ff-glow md:text-4xl"
            style={{ textShadow: "0 0 28px rgba(200,255,120,0.2)" }}
          >
            Visit us
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ff-mist/85 md:mx-0">
            Hours, dress code, and directions — update copy in admin or env when ready.
          </p>
        </FadeInChild>
        {settings.mapsUrl && (
          <div className="flex justify-center md:justify-start">
            <MapsCta href={settings.mapsUrl} />
          </div>
        )}
      </div>
    </SectionReveal>
  );
}
