"use client";

import type { HeroSlide, HeroSlideType } from "@prisma/client";
import { useEffect, useMemo, useRef } from "react";
import { useHeroVideoControl } from "@/lib/hero-video-control";
export type HeroCarouselProps = {
  slides: HeroSlide[];
  fallbackVideo: string | null;
  fallbackPoster: string | null;
};

type NormalizedSlide = {
  key: string;
  type: HeroSlideType;
  mediaUrl: string;
  posterUrl: string | null;
};

function pickPrimarySlide(
  slides: HeroSlide[],
  fallbackVideo: string | null,
  fallbackPoster: string | null,
): NormalizedSlide | null {
  if (slides.length > 0) {
    const first = slides[0]!;
    return {
      key: first.id,
      type: first.type,
      mediaUrl: first.mediaUrl,
      posterUrl: first.posterUrl,
    };
  }

  if (fallbackVideo) {
    return {
      key: "fallback-video",
      type: "VIDEO",
      mediaUrl: fallbackVideo,
      posterUrl: fallbackPoster,
    };
  }

  if (fallbackPoster) {
    return {
      key: "fallback-poster",
      type: "IMAGE",
      mediaUrl: fallbackPoster,
      posterUrl: null,
    };
  }

  return null;
}

export function HeroCarousel({
  slides,
  fallbackVideo,
  fallbackPoster,
}: HeroCarouselProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const heroVideo = useHeroVideoControl();
  const muted = heroVideo?.muted ?? true;

  const primary = useMemo(
    () => pickPrimarySlide(slides, fallbackVideo, fallbackPoster),
    [slides, fallbackVideo, fallbackPoster],
  );
  const isVideo = primary?.type === "VIDEO";

  useEffect(() => {
    heroVideo?.setIsVideoHero(Boolean(isVideo));
    return () => heroVideo?.setIsVideoHero(false);
  }, [heroVideo, isVideo]);

  if (!primary) {
    return (
      <section
        className="relative flex min-h-[min(90dvh,90svh)] w-full items-center justify-center overflow-hidden bg-ff-hero-void px-6"
        aria-label="Firefly hero"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(200,255,140,0.12),transparent_55%)]" />
        <p className="relative z-10 max-w-md text-center text-sm text-ff-mist/90">
          Add hero media in admin or set fallback hero media in settings.
        </p>
      </section>
    );
  }

  return (
    <section
      className="relative h-[100svh] w-full overflow-hidden bg-ff-hero-void md:h-screen"
      aria-label="Firefly hero"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(200,255,140,0.14),transparent_60%)]" />

      {isVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={primary.mediaUrl}
          poster={primary.posterUrl ?? undefined}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="auto"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={primary.mediaUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-[#03080f]/20 via-transparent to-[#03080f]/45" />
    </section>
  );
}
