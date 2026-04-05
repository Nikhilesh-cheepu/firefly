"use client";

import type { HeroSlide, HeroSlideType } from "@prisma/client";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { MutableRefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FireflyLogo } from "@/components/FireflyLogo";

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
  title: string | null;
  ctaUrl: string | null;
  ctaLabel: string | null;
};

const HINT_KEY = "firefly-hero-swipe-hint";

export function HeroCarousel({
  slides,
  fallbackVideo,
  fallbackPoster,
}: HeroCarouselProps) {
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const videoRefs = useRef<Map<string, HTMLVideoElement | null>>(new Map());

  const normalized = useMemo<NormalizedSlide[]>(() => {
    if (slides.length > 0) {
      return slides.map((s) => ({
        key: s.id,
        type: s.type,
        mediaUrl: s.mediaUrl,
        posterUrl: s.posterUrl,
        title: s.title,
        ctaUrl: s.ctaUrl,
        ctaLabel: s.ctaLabel,
      }));
    }
    if (fallbackVideo) {
      return [
        {
          key: "fallback-video",
          type: "VIDEO",
          mediaUrl: fallbackVideo,
          posterUrl: fallbackPoster,
          title: null,
          ctaUrl: null,
          ctaLabel: null,
        },
      ];
    }
    if (fallbackPoster) {
      return [
        {
          key: "fallback-poster",
          type: "IMAGE",
          mediaUrl: fallbackPoster,
          posterUrl: null,
          title: null,
          ctaUrl: null,
          ctaLabel: null,
        },
      ];
    }
    return [];
  }, [slides, fallbackVideo, fallbackPoster]);

  const multi = normalized.length > 1 && !reduceMotion;

  useEffect(() => {
    if (typeof window === "undefined" || !multi) return;
    if (window.sessionStorage.getItem(HINT_KEY) === "1") return;
    const show = window.setTimeout(() => setHintVisible(true), 0);
    const hide = window.setTimeout(() => setHintVisible(false), 9000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [multi]);

  const dismissHint = useCallback(() => {
    setHintVisible(false);
    if (typeof window !== "undefined") window.sessionStorage.setItem(HINT_KEY, "1");
  }, []);

  const syncActiveFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    const i = Math.round(el.scrollLeft / w);
    setActive(Math.max(0, Math.min(i, normalized.length - 1)));
  }, [normalized.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => syncActiveFromScroll());
    el.addEventListener("scroll", syncActiveFromScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", syncActiveFromScroll);
    };
  }, [syncActiveFromScroll, normalized.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || reduceMotion) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const id = (en.target as HTMLElement).dataset.slideKey;
          if (!id) return;
          const v = videoRefs.current.get(id);
          if (!v) return;
          if (en.isIntersecting && en.intersectionRatio >= 0.55) {
            void v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { root: el, threshold: [0, 0.45, 0.55, 0.65, 1] },
    );

    normalized.forEach((s) => {
      if (s.type !== "VIDEO") return;
      const node = el.querySelector("[data-slide-key=\"" + s.key + "\"]");
      if (node) obs.observe(node);
    });

    return () => obs.disconnect();
  }, [normalized, reduceMotion]);

  const goTo = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  const onScrollUser = () => {
    dismissHint();
  };

  if (normalized.length === 0) {
    return (
      <section
        className="relative flex min-h-[100dvh] w-full items-end justify-center overflow-hidden"
        aria-label="Firefly hero"
      >
        <div className="absolute inset-0 bg-ff-hero-void" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(200,255,140,0.18),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(124,245,198,0.12),transparent_45%)]" />
        <div className="relative z-10 w-full max-w-6xl px-6 pb-32 pt-28 text-center md:pb-36 md:text-left">
          <FireflyLogo variant="hero" />
          <p className="mx-auto mt-6 max-w-md text-base text-ff-mist md:mx-0 md:text-lg">
            Food · Daily DJs · Parties — add hero slides in admin or set env video URL.
          </p>
        </div>
      </section>
    );
  }

  if (reduceMotion || normalized.length === 1) {
    const s = normalized[0];
    return (
      <section
        className="relative flex min-h-[100dvh] w-full items-end justify-center overflow-hidden"
        aria-label="Firefly hero"
      >
        <HeroBackdrop slide={s} videoRefs={videoRefs} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#03080f] via-[#03080f]/70 to-transparent" />
        <div className="relative z-10 w-full max-w-6xl px-6 pb-32 pt-28 text-center md:pb-36 md:text-left">
          <FireflyLogo variant="hero" />
          <p className="mx-auto mt-6 max-w-md text-base text-ff-mist md:mx-0 md:text-lg">
            Food · Daily DJs · Parties — Tollywood nights under the glow.
          </p>
          {s.ctaUrl && s.ctaLabel && (
            <Link
              href={s.ctaUrl}
              className="pointer-events-auto mt-8 inline-flex rounded-full bg-ff-glow px-6 py-3 text-sm font-semibold text-ff-void shadow-[0_0_28px_rgba(200,255,120,0.35)] transition hover:brightness-110"
            >
              {s.ctaLabel}
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[100dvh] w-full" aria-label="Firefly hero">
      <div
        ref={scrollerRef}
        onScroll={onScrollUser}
        className="flex h-[100dvh] min-h-[480px] w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {normalized.map((s) => (
          <div
            key={s.key}
            className="relative h-full w-screen shrink-0 snap-center snap-always"
          >
            <HeroSlideMedia slide={s} videoRefs={videoRefs} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#03080f] via-[#03080f]/55 to-[#03080f]/25" />
          </div>
        ))}
      </div>

      {hintVisible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute left-1/2 top-[min(22%,9rem)] z-30 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2 rounded-full border border-ff-glow/35 bg-[#03080f]/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ff-glow shadow-[0_0_24px_rgba(200,255,120,0.2)] backdrop-blur-md">
            <span>Swipe</span>
            <motion.span
              className="text-ff-mint"
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              aria-hidden
            >
              →
            </motion.span>
          </div>
        </motion.div>
      )}

      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-[#03080f]/90 to-transparent md:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-[#03080f]/90 to-transparent md:w-16" />

      <div className="pointer-events-none absolute bottom-[min(28%,10rem)] left-0 right-0 z-20 flex justify-center gap-2.5 md:gap-2">
        {normalized.map((_, i) => (
          <motion.button
            key={i}
            type="button"
            aria-label={"Go to slide " + (i + 1)}
            aria-current={i === active}
            onClick={() => {
              dismissHint();
              goTo(i);
            }}
            className={
              "pointer-events-auto h-3 w-3 rounded-full border border-ff-glow/40 md:h-2.5 md:w-2.5 " +
              (i === active ? "bg-ff-glow ff-shadow-glow-sm" : "bg-white/20")
            }
            whileTap={reduceMotion ? undefined : { scale: 0.88 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-6 pb-[max(7rem,env(safe-area-inset-bottom))] pt-24 md:justify-start md:pb-32">
        <div className="pointer-events-auto w-full max-w-6xl text-center md:text-left">
          <FireflyLogo variant="hero" />
          <p className="mx-auto mt-5 max-w-md text-base text-ff-mist md:mx-0 md:text-lg">
            Food · Daily DJs · Parties — Tollywood nights under the glow.
          </p>
          {normalized[active]?.ctaUrl && normalized[active]?.ctaLabel && (
            <Link
              href={normalized[active].ctaUrl!}
              className="mt-8 inline-flex rounded-full bg-ff-glow px-6 py-3 text-sm font-semibold text-ff-void shadow-[0_0_28px_rgba(200,255,120,0.35)] transition hover:brightness-110"
            >
              {normalized[active].ctaLabel!}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function HeroBackdrop({
  slide,
  videoRefs,
}: {
  slide: NormalizedSlide;
  videoRefs: MutableRefObject<Map<string, HTMLVideoElement | null>>;
}) {
  if (slide.type === "VIDEO") {
    return (
      <video
        ref={(el) => {
          videoRefs.current.set(slide.key, el);
        }}
        className="absolute inset-0 h-full w-full object-cover"
        src={slide.mediaUrl}
        poster={slide.posterUrl ?? undefined}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={slide.mediaUrl}
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

function HeroSlideMedia({
  slide,
  videoRefs,
}: {
  slide: NormalizedSlide;
  videoRefs: MutableRefObject<Map<string, HTMLVideoElement | null>>;
}) {
  if (slide.type === "VIDEO") {
    return (
      <video
        ref={(el) => {
          videoRefs.current.set(slide.key, el);
        }}
        data-slide-key={slide.key}
        className="absolute inset-0 h-full w-full object-cover"
        src={slide.mediaUrl}
        poster={slide.posterUrl ?? undefined}
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-slide-key={slide.key}
      src={slide.mediaUrl}
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
