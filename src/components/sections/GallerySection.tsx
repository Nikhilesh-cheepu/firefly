import { FadeInChild } from "@/components/motion/FadeInChild";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { GalleryFloatingPreviewClient } from "@/components/sections/GalleryFloatingPreviewClient";
import { getGalleryPreviewImages } from "@/lib/site-data";
export async function GallerySection() {
  const images = await getGalleryPreviewImages();
  return (
    <SectionReveal id="gallery" className="scroll-mt-6 bg-black px-1 py-5 sm:px-2 md:py-6" delay={0.04}>
      <div className="mx-auto max-w-6xl">
        <header className="mb-2 md:mb-3">
          <FadeInChild>
            <h2
              className="font-[family-name:var(--font-display)] text-4xl text-ff-glow md:text-5xl"
              style={{ textShadow: "0 0 36px rgba(200,255,120,0.2)" }}
            >
              Gallery
            </h2>
          </FadeInChild>
        </header>

        {images.length === 0 ? (
          <FadeInChild delay={0.08}>
            <p className="ff-card rounded-2xl border border-ff-glow/15 bg-ff-void/50 px-6 py-10 text-center text-ff-mist/80 backdrop-blur-sm">
              No gallery images yet. Open{" "}
              <code className="text-ff-glow/90">/admin/gallery</code> (with DB + Blob) to upload photos.
            </p>
          </FadeInChild>
        ) : (
          <FadeInChild delay={0.05}>
            <GalleryFloatingPreviewClient images={images} />
          </FadeInChild>
        )}
      </div>
    </SectionReveal>
  );
}
