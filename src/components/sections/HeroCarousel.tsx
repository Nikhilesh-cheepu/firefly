"use client";

import type { HeroSlide, HeroSlideType } from "@prisma/client";
import { useMemo, useRef, useState } from "react";
import { waMeHrefFromInput } from "@/lib/indian-phone";

export type HeroCarouselProps = {
  slides: HeroSlide[];
  fallbackVideo: string | null;
  fallbackPoster: string | null;
  whatsappRaw?: string | null;
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
  whatsappRaw = null,
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
  const bookEventHref = useMemo(() => {
    const base = waMeHrefFromInput(whatsappRaw);
    if (!base) return null;
    const msg = "i want to book an event at firefly";
    return `${base}${base.includes("?") ? "&" : "?"}text=${encodeURIComponent(msg)}`;
  }, [whatsappRaw]);

  return (
    <section
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-ff-hero-void"
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

      {isVideo ? (
        <div className="absolute bottom-[calc(6.25rem+env(safe-area-inset-bottom))] right-4 z-20 sm:right-6">
          <button
            type="button"
            onClick={() => setMuted((prev) => !prev)}
            aria-pressed={!muted}
            aria-label={muted ? "Unmute hero video" : "Mute hero video"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ff-glow/45 bg-[#03080f]/90 text-ff-glow shadow-[0_0_20px_rgba(200,255,120,0.2)] backdrop-blur-sm transition active:scale-[0.96]"
          >
            {muted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M3 9v6h4l5 4V5L7 9H3zM16.5 8.5l5 7M21.5 8.5l-5 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M3 9v6h4l5 4V5L7 9H3zM16 9.5a4.5 4.5 0 010 5M18.8 7a8 8 0 010 10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      ) : null}

      {bookEventHref ? (
        <a
          href={bookEventHref}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-[calc(6.25rem+env(safe-area-inset-bottom))] left-1/2 z-20 -translate-x-1/2 text-sm font-semibold text-ff-glow underline underline-offset-4 transition hover:text-white"
        >
          Book event
        </a>
      ) : null}
    </section>
  );
}
