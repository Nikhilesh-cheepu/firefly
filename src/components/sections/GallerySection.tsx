import type { GalleryImage } from "@prisma/client";
import { FadeInChild } from "@/components/motion/FadeInChild";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { GalleryMasonryClient } from "@/components/sections/GalleryMasonryClient";

type Props = {
  images: GalleryImage[];
};

export function GallerySection({ images }: Props) {
  return (
    <SectionReveal id="gallery" className="scroll-mt-6 bg-ff-deep px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 md:mb-10">
          <FadeInChild>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-ff-mint/90">
              Inside
            </p>
            <h2
              className="mt-2 font-[family-name:var(--font-display)] text-4xl text-ff-glow md:text-5xl"
              style={{ textShadow: "0 0 36px rgba(200,255,120,0.2)" }}
            >
              Gallery
            </h2>
            <p className="mt-3 max-w-xl text-ff-mist/85">
              Lights, crowd, food — moments from the club (stored on your Blob when you wire uploads).
            </p>
          </FadeInChild>
        </header>

        {images.length === 0 ? (
          <FadeInChild delay={0.08}>
            <p className="ff-card rounded-2xl border border-ff-glow/15 bg-ff-void/50 px-6 py-10 text-center text-ff-mist/80 backdrop-blur-sm">
              No gallery images yet. Add <code className="text-ff-glow/90">GalleryImage</code> rows after
              DB setup.
            </p>
          </FadeInChild>
        ) : (
          <GalleryMasonryClient images={images} />
        )}
      </div>
    </SectionReveal>
  );
}
