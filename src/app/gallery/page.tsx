import Link from "next/link";
import { BridgeReveal } from "@/components/motion/BridgeReveal";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { GalleryMasonryClient } from "@/components/sections/GalleryMasonryClient";
import { getGalleryImages } from "@/lib/site-data";

export const revalidate = 30;

export default async function FullGalleryPage() {
  const images = await getGalleryImages();

  return (
    <main className="min-h-[100dvh] bg-ff-hero-void px-4 pb-12 pt-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal y={16}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-ff-mint/90">Inside</p>
              <h1
                className="mt-1 font-[family-name:var(--font-display)] text-4xl text-ff-glow md:text-5xl"
                style={{ textShadow: "0 0 36px rgba(200,255,120,0.2)" }}
              >
                Full Gallery
              </h1>
            </div>
            <Link
              href="/#gallery"
              className="rounded-lg border border-ff-glow/25 bg-ff-deep/70 px-3 py-2 text-sm text-ff-mist transition hover:border-ff-glow/45 hover:text-white"
            >
              Back
            </Link>
          </div>
        </ScrollReveal>

        <BridgeReveal className="from-ff-deep via-ff-forest/20 to-ff-deep/40" />

        {images.length === 0 ? (
          <ScrollReveal y={20}>
            <p className="mt-6 rounded-2xl border border-ff-glow/15 bg-ff-void/50 px-6 py-10 text-center text-ff-mist/80 backdrop-blur-sm">
              No gallery images yet.
            </p>
          </ScrollReveal>
        ) : (
          <ScrollReveal className="mt-6" delay={0.05} y={24}>
            <GalleryMasonryClient images={images} />
          </ScrollReveal>
        )}
      </div>
    </main>
  );
}

