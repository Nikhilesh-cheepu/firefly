"use client";

import type { HeroSlide, HeroSlideType } from "@prisma/client";
import { useMemo, useRef, useState } from "react";

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
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const primary = useMemo(
    () => pickPrimarySlide(slides, fallbackVideo, fallbackPoster),
    [slides, fallbackVideo, fallbackPoster],
  );

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

  const isVideo = primary.type === "VIDEO";

  return (
    <section
      className="relative flex min-h-[min(90dvh,90svh)] w-full items-center justify-center overflow-hidden bg-ff-hero-void"
      aria-label="Firefly hero"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(200,255,140,0.14),transparent_60%)]" />

      <div className="relative z-10 mx-auto w-[min(92vw,calc(min(90dvh,90svh)*9/16))] max-w-full overflow-hidden rounded-2xl bg-black/25 ring-1 ring-ff-mint/20">
        {isVideo ? (
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
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
          <img
            src={primary.mediaUrl}
            alt=""
            className="h-full w-full object-contain"
          />
        )}
      </div>

      {isVideo ? (
        <div className="absolute bottom-[calc(6.25rem+env(safe-area-inset-bottom))] left-1/2 z-20 -translate-x-1/2">
          <button
            type="button"
            onClick={() => setMuted((prev) => !prev)}
            aria-pressed={!muted}
            aria-label={muted ? "Unmute hero video" : "Mute hero video"}
            className="rounded-full border border-ff-glow/45 bg-[#03080f]/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ff-glow shadow-[0_0_20px_rgba(200,255,120,0.2)] backdrop-blur-sm transition active:scale-[0.98]"
          >
            {muted ? "Unmute" : "Mute"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
