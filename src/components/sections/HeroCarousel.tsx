"use client";

import type { HeroSlide, HeroSlideType } from "@prisma/client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { MutableRefObject, ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

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

type LoopSlide = NormalizedSlide & { instanceKey: string };

const HINT_KEY = "firefly-hero-swipe-hint";

/** Slide strip width fraction (used only for non–snap-center fallbacks). */
const SLIDE_VIEWPORT_FRAC = 0.86;

function slideStripWidthPx(): number {
  if (typeof window === "undefined") return 0;
  return Math.round(window.innerWidth * SLIDE_VIEWPORT_FRAC);
}

function getClosestSlideIndex(container: HTMLElement): number {
  const children = [...container.children] as HTMLElement[];
  if (children.length === 0) return 0;
  const scrollCenter = container.scrollLeft + container.clientWidth / 2;
  let bestIdx = 0;
  let best = Infinity;
  children.forEach((child, i) => {
    const mid = child.offsetLeft + child.offsetWidth / 2;
    const d = Math.abs(mid - scrollCenter);
    if (d < best) {
      best = d;
      bestIdx = i;
    }
  });
  return bestIdx;
}

function scrollToSlideIndex(
  container: HTMLElement,
  index: number,
  instant: boolean,
) {
  const child = container.children[index] as HTMLElement | undefined;
  if (!child) return;
  const left = child.offsetLeft + child.offsetWidth / 2 - container.clientWidth / 2;
  container.scrollTo({ left: Math.max(0, left), behavior: instant ? "auto" : "smooth" });
}

function extendedToLogical(extIdx: number, nSlides: number): number {
  if (extIdx === 0) return nSlides - 1;
  if (extIdx === nSlides + 1) return 0;
  return extIdx - 1;
}

function IconVolumeOn({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 5L6 9H2v6h4l5 4V5zm7.54 3.46l-1.42-1.42a6.98 6.98 0 010 9.9l1.42 1.42a8.98 8.98 0 000-12.72zm-2.83 2.83l-1.41-1.41a3 3 0 000 4.24l1.41-1.41a1 1 0 000-1.42z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconVolumeOff({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 4v-5.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.94 8.94 0 003.9-2.28L19.73 21 21 19.73l-9-9L4.27 3zM12 4.09L9.91 6.18 12 8.27V4.09z"
        fill="currentColor"
      />
    </svg>
  );
}

function HeroSoundToggle({
  soundEnabled,
  setSoundEnabled,
  videoRefs,
  activeInstanceKey,
}: {
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  videoRefs: MutableRefObject<Map<string, HTMLVideoElement | null>>;
  activeInstanceKey: string;
}) {
  return (
    <div className="pointer-events-none absolute bottom-[calc(7.25rem+env(safe-area-inset-bottom))] right-3 z-30 md:right-5">
      <button
        type="button"
        aria-label={soundEnabled ? "Mute hero videos" : "Unmute hero videos"}
        aria-pressed={soundEnabled}
        onClick={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          if (next && activeInstanceKey) {
            queueMicrotask(() => {
              const v = videoRefs.current.get(activeInstanceKey);
              if (v) {
                v.muted = false;
                void v.play().catch(() => {});
              }
            });
          }
        }}
        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-ff-glow/40 bg-[#03080f]/85 text-ff-glow shadow-[0_0_18px_rgba(200,255,120,0.16)] backdrop-blur-md transition hover:border-ff-mint/50 hover:text-ff-mint"
      >
        {soundEnabled ? <IconVolumeOn /> : <IconVolumeOff />}
      </button>
    </div>
  );
}

function mobileHeroMaxHeightClass() {
  return "max-h-[min(90dvh,90svh)]";
}

function PortraitHeroFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className={`relative mx-auto aspect-[9/16] w-[min(92vw,calc(min(90dvh,90svh)*9/16))] ${mobileHeroMaxHeightClass()} max-w-full`}
    >
      {children}
    </div>
  );
}

function HeroMediaCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-ff-glow/50 bg-black/20 shadow-[0_0_0_1px_rgba(124,245,198,0.12),0_12px_40px_rgba(0,0,0,0.55)] ring-1 ring-ff-mint/15">
      {children}
    </div>
  );
}

/** Media wash: strong blur + lift so dark posters/videos still tint the room. */
const AMBIENT_MEDIA =
  "h-full w-full min-h-[120%] min-w-[120%] object-cover [transform:translateZ(0)] scale-110 blur-[min(22vw,9rem)] brightness-[1.38] saturate-[1.58] contrast-[1.1] opacity-[0.68]";

/** Blurred, full-bleed wash from the active slide (Amazon / Apple Music–style ambient). */
function HeroAmbientBackdrop({
  slide,
  reduceMotion,
}: {
  slide: NormalizedSlide;
  reduceMotion: boolean;
}) {
  const usePosterStill =
    slide.type === "VIDEO" && slide.posterUrl != null && slide.posterUrl !== "";

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.key}
          className="absolute inset-0"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={transition}
        >
          <div className="absolute inset-[-32%] flex items-center justify-center">
            {slide.type === "IMAGE" || usePosterStill ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={usePosterStill ? slide.posterUrl! : slide.mediaUrl}
                alt=""
                className={AMBIENT_MEDIA}
                draggable={false}
              />
            ) : (
              <video
                className={AMBIENT_MEDIA}
                src={slide.mediaUrl}
                muted
                playsInline
                autoPlay
                loop
                preload="metadata"
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Brand-tinted lift on very dark frames */}
      <div className="absolute inset-0 bg-gradient-to-br from-ff-glow/[0.09] via-ff-mint/[0.05] to-ff-glow/[0.07] mix-blend-soft-light" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#03080f]/36 via-[#03080f]/16 to-[#03080f]/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,transparent_0%,rgba(3,8,15,0.22)_65%,rgba(3,8,15,0.48)_100%)]" />
    </div>
  );
}

function HeroBackdrop({
  slide,
  instanceKey,
  activeInstanceKey,
  soundEnabled,
  videoRefs,
  onVideoReady,
}: {
  slide: NormalizedSlide;
  instanceKey: string;
  activeInstanceKey: string;
  soundEnabled: boolean;
  videoRefs: MutableRefObject<Map<string, HTMLVideoElement | null>>;
  onVideoReady?: () => void;
}) {
  const audible = soundEnabled && instanceKey === activeInstanceKey;
  if (slide.type === "VIDEO") {
    return (
      <HeroMediaCard>
        <PortraitHeroFrame>
          <video
            ref={(el) => {
              videoRefs.current.set(instanceKey, el);
              if (el) onVideoReady?.();
            }}
            className="pointer-events-none h-full w-full object-contain select-none"
            src={slide.mediaUrl}
            poster={slide.posterUrl ?? undefined}
            autoPlay
            muted={!audible}
            loop
            playsInline
            preload="auto"
          />
        </PortraitHeroFrame>
      </HeroMediaCard>
    );
  }
  return (
    <HeroMediaCard>
      <PortraitHeroFrame>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={slide.mediaUrl} alt="" className="pointer-events-none h-full w-full object-contain select-none" />
      </PortraitHeroFrame>
    </HeroMediaCard>
  );
}

function HeroSlideMedia({
  slide,
  instanceKey,
  activeInstanceKey,
  soundEnabled,
  videoRefs,
  onVideoReady,
}: {
  slide: NormalizedSlide;
  instanceKey: string;
  activeInstanceKey: string;
  soundEnabled: boolean;
  videoRefs: MutableRefObject<Map<string, HTMLVideoElement | null>>;
  onVideoReady?: () => void;
}) {
  const audible = soundEnabled && instanceKey === activeInstanceKey;
  if (slide.type === "VIDEO") {
    return (
      <video
        ref={(el) => {
          videoRefs.current.set(instanceKey, el);
          if (el) onVideoReady?.();
        }}
        className="pointer-events-none h-full w-full object-contain select-none"
        src={slide.mediaUrl}
        poster={slide.posterUrl ?? undefined}
        muted={!audible}
        loop
        playsInline
        preload="auto"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={slide.mediaUrl} alt="" className="pointer-events-none h-full w-full object-contain select-none" />
  );
}

function HeroSlideColumn({
  loopItem,
  videoRefs,
  activeInstanceKey,
  soundEnabled,
  isActive,
  reduceMotion,
  onVideoReady,
}: {
  loopItem: LoopSlide;
  videoRefs: MutableRefObject<Map<string, HTMLVideoElement | null>>;
  activeInstanceKey: string;
  soundEnabled: boolean;
  isActive: boolean;
  reduceMotion: boolean;
  onVideoReady?: () => void;
}) {
  return (
    <div className="flex h-full w-[86vw] max-w-[min(86vw,calc(min(90dvh,90svh)*9/16+40px))] shrink-0 snap-center items-center justify-center px-1 [scroll-snap-stop:always]">
      <motion.div
        className="flex w-full items-center justify-center will-change-transform"
        data-slide-key={loopItem.instanceKey}
        animate={
          reduceMotion
            ? undefined
            : {
                scale: isActive ? 1 : 0.966,
                opacity: isActive ? 1 : 0.88,
              }
        }
        transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.72 }}
      >
        <HeroMediaCard>
          <PortraitHeroFrame>
            <HeroSlideMedia
              slide={loopItem}
              instanceKey={loopItem.instanceKey}
              activeInstanceKey={activeInstanceKey}
              soundEnabled={soundEnabled}
              videoRefs={videoRefs}
              onVideoReady={onVideoReady}
            />
          </PortraitHeroFrame>
        </HeroMediaCard>
      </motion.div>
    </div>
  );
}

export function HeroCarousel({
  slides,
  fallbackVideo,
  fallbackPoster,
}: HeroCarouselProps) {
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isJumpingRef = useRef(false);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLogicalRef = useRef(0);
  const activeLogicalRef = useRef(0);

  const [activeLogical, setActiveLogical] = useState(0);
  const [activeInstanceKey, setActiveInstanceKey] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
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

  const loopSlides = useMemo<LoopSlide[] | null>(() => {
    if (normalized.length < 2 || reduceMotion) return null;
    const n = normalized.length;
    const last = normalized[n - 1]!;
    const first = normalized[0]!;
    return [
      { ...last, instanceKey: `${last.key}__loopL` },
      ...normalized.map((s) => ({ ...s, instanceKey: s.key })),
      { ...first, instanceKey: `${first.key}__loopR` },
    ];
  }, [normalized, reduceMotion]);

  type CarouselMode = "empty" | "single" | "simple" | "infinite";
  const mode: CarouselMode = useMemo(() => {
    const n = normalized.length;
    if (n === 0) return "empty";
    if (n === 1) return "single";
    if (reduceMotion) return "simple";
    return "infinite";
  }, [normalized.length, reduceMotion]);

  const carouselMulti = mode === "simple" || mode === "infinite";

  /** Centered slide instance — drives play/pause so we don’t fight IntersectionObserver during scroll-snap. */
  const activeVideoSyncKey = useMemo(() => {
    if (normalized.length === 0) return "";
    if (normalized.length === 1) return normalized[0]!.key;
    return (
      activeInstanceKey ||
      (loopSlides ? loopSlides[1]!.instanceKey : normalized[0]!.key)
    );
  }, [normalized, activeInstanceKey, loopSlides]);

  const syncHeroVideos = useCallback(() => {
    videoRefs.current.forEach((v, key) => {
      if (!v || v.tagName !== "VIDEO") return;
      if (key === activeVideoSyncKey) {
        const play = () => void v.play().catch(() => {});
        if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) play();
        else v.addEventListener("canplay", play, { once: true });
      } else {
        v.pause();
        try {
          v.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
    });
  }, [activeVideoSyncKey]);

  const bumpVideoSync = useCallback(() => {
    queueMicrotask(() => syncHeroVideos());
  }, [syncHeroVideos]);

  useEffect(() => {
    if (normalized.length === 0) return;
    queueMicrotask(() => syncHeroVideos());
  }, [syncHeroVideos, soundEnabled, normalized.length]);

  useEffect(() => {
    activeLogicalRef.current = activeLogical;
  }, [activeLogical]);

  useEffect(() => {
    if (typeof window === "undefined" || !carouselMulti) return;
    if (window.sessionStorage.getItem(HINT_KEY) === "1") return;
    const show = window.setTimeout(() => setHintVisible(true), 400);
    const hide = window.setTimeout(() => setHintVisible(false), 7000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [carouselMulti]);

  const dismissHint = useCallback(() => {
    setHintVisible(false);
    if (typeof window !== "undefined") window.sessionStorage.setItem(HINT_KEY, "1");
  }, []);

  const applyInfiniteScrollEnd = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || !loopSlides || isJumpingRef.current) return;
    const n = normalized.length;
    const idx = getClosestSlideIndex(el);

    if (idx === 0) {
      isJumpingRef.current = true;
      scrollToSlideIndex(el, n, true);
      const logicalN = n - 1;
      setActiveLogical(logicalN);
      setActiveInstanceKey(loopSlides[n]!.instanceKey);
      prevLogicalRef.current = logicalN;
      requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });
      return;
    }
    if (idx === n + 1) {
      isJumpingRef.current = true;
      scrollToSlideIndex(el, 1, true);
      setActiveLogical(0);
      setActiveInstanceKey(loopSlides[1]!.instanceKey);
      prevLogicalRef.current = 0;
      requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });
      return;
    }

    const logical = extendedToLogical(idx, n);
    const inst = loopSlides[idx]!.instanceKey;
    if (logical !== prevLogicalRef.current) {
      prevLogicalRef.current = logical;
    }
    setActiveLogical(logical);
    setActiveInstanceKey(inst);
  }, [loopSlides, normalized.length]);

  const scheduleInfiniteScrollEnd = useCallback(() => {
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = setTimeout(applyInfiniteScrollEnd, 70);
  }, [applyInfiniteScrollEnd]);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el || !carouselMulti) return;
    if (mode === "infinite" && loopSlides) {
      scrollToSlideIndex(el, 1, true);
      prevLogicalRef.current = 0;
      queueMicrotask(() => {
        setActiveLogical(0);
        setActiveInstanceKey(loopSlides[1]!.instanceKey);
      });
    } else if (mode === "simple") {
      scrollToSlideIndex(el, 0, true);
      prevLogicalRef.current = 0;
      queueMicrotask(() => {
        setActiveLogical(0);
        setActiveInstanceKey(normalized[0]!.key);
      });
    }
  }, [mode, loopSlides, carouselMulti, normalized]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !carouselMulti) return;

    const onScroll = () => {
      if (isJumpingRef.current) return;
      dismissHint();

      if (mode === "simple") {
        const idx = getClosestSlideIndex(el);
        setActiveLogical(idx);
        setActiveInstanceKey(normalized[idx]?.key ?? "");
        if (idx !== prevLogicalRef.current) {
          prevLogicalRef.current = idx;
        }
        return;
      }

      if (mode === "infinite" && loopSlides) {
        const n = normalized.length;
        const idx = getClosestSlideIndex(el);
        if (idx > 0 && idx < n + 1) {
          const logical = extendedToLogical(idx, n);
          setActiveLogical(logical);
          setActiveInstanceKey(loopSlides[idx]!.instanceKey);
        }
        scheduleInfiniteScrollEnd();
      }
    };

    const onScrollEndEv = () => {
      if (mode === "infinite") applyInfiniteScrollEnd();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", onScrollEndEv);

    const onResize = () => {
      if (mode === "infinite" && loopSlides) {
        scrollToSlideIndex(el, activeLogicalRef.current + 1, true);
      } else if (mode === "simple") {
        scrollToSlideIndex(el, activeLogicalRef.current, true);
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", onScrollEndEv);
      window.removeEventListener("resize", onResize);
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    };
  }, [
    mode,
    carouselMulti,
    loopSlides,
    normalized,
    dismissHint,
    scheduleInfiniteScrollEnd,
    applyInfiniteScrollEnd,
  ]);

  const goTo = (logicalIndex: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (mode === "infinite" && loopSlides) {
      scrollToSlideIndex(el, logicalIndex + 1, false);
    } else if (mode === "simple") {
      scrollToSlideIndex(el, logicalIndex, false);
    } else {
      const w = slideStripWidthPx() || el.children[0]?.clientWidth || el.clientWidth;
      el.scrollTo({ left: logicalIndex * w, behavior: "smooth" });
    }
  };

  const onScrollUser = () => {
    dismissHint();
  };

  if (mode === "empty") {
    return (
      <section
        className="relative flex min-h-[min(90dvh,90svh)] w-full items-center justify-center overflow-hidden bg-ff-hero-void px-6"
        aria-label="Firefly hero"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(200,255,140,0.12),transparent_55%)]" />
        <p className="relative z-10 max-w-md text-center text-sm text-ff-mist/90">
          Add hero slides in admin or set a fallback video URL in settings.
        </p>
      </section>
    );
  }

  if (mode === "single") {
    const s = normalized[0]!;
    const ik = s.key;
    return (
      <section
        className="relative flex min-h-[min(90dvh,90svh)] w-full items-center justify-center overflow-hidden bg-ff-hero-void"
        aria-label="Firefly hero"
      >
        <HeroAmbientBackdrop slide={s} reduceMotion={!!reduceMotion} />
        <div className="relative z-10 flex w-full items-center justify-center">
          <HeroBackdrop
            slide={s}
            instanceKey={ik}
            activeInstanceKey={ik}
            soundEnabled={soundEnabled}
            videoRefs={videoRefs}
            onVideoReady={bumpVideoSync}
          />
        </div>
        {s.type === "VIDEO" && (
          <HeroSoundToggle
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            videoRefs={videoRefs}
            activeInstanceKey={ik}
          />
        )}
      </section>
    );
  }

  const currentVideoSlide = normalized[activeLogical];
  const soundTargetInstanceKey =
    activeInstanceKey ||
    (mode === "infinite" && loopSlides
      ? loopSlides[1]!.instanceKey
      : normalized[0]?.key ?? "");

  const ambientSlide = normalized[activeLogical] ?? normalized[0]!;
  const activeSlideKey = normalized[activeLogical]?.key ?? normalized[0]!.key;

  return (
    <section
      className="relative min-h-[min(90dvh,90svh)] w-full overflow-hidden bg-ff-hero-void"
      aria-label="Firefly hero"
    >
      <HeroAmbientBackdrop slide={ambientSlide} reduceMotion={!!reduceMotion} />
      <div
        ref={scrollerRef}
        onScroll={onScrollUser}
        className="relative z-10 flex h-[min(90dvh,90svh)] min-h-[420px] w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [touch-action:pan-x_pan-y] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {mode === "infinite" && loopSlides
          ? loopSlides.map((item) => (
              <HeroSlideColumn
                key={item.instanceKey}
                loopItem={item}
                videoRefs={videoRefs}
                activeInstanceKey={soundTargetInstanceKey}
                soundEnabled={soundEnabled}
                isActive={item.key === activeSlideKey}
                reduceMotion={!!reduceMotion}
                onVideoReady={bumpVideoSync}
              />
            ))
          : normalized.map((s) => (
              <HeroSlideColumn
                key={s.key}
                loopItem={{ ...s, instanceKey: s.key }}
                videoRefs={videoRefs}
                activeInstanceKey={soundTargetInstanceKey}
                soundEnabled={soundEnabled}
                isActive={s.key === activeSlideKey}
                reduceMotion={!!reduceMotion}
                onVideoReady={bumpVideoSync}
              />
            ))}
      </div>

      {currentVideoSlide?.type === "VIDEO" && (
        <HeroSoundToggle
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          videoRefs={videoRefs}
          activeInstanceKey={soundTargetInstanceKey}
        />
      )}

      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-30 w-[min(7vw,2rem)]"
        aria-hidden
      >
        <motion.div
          className="flex h-full items-center justify-center pl-0.5"
          animate={reduceMotion ? undefined : { x: [0, -6, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { repeat: Infinity, duration: 2.1, ease: [0.45, 0, 0.55, 1] }
          }
        >
          <div className="h-16 w-1 rounded-full bg-gradient-to-b from-ff-glow/15 via-ff-glow/45 to-ff-glow/15 shadow-[0_0_14px_rgba(200,255,120,0.28)]" />
        </motion.div>
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-30 w-[min(7vw,2rem)]"
        aria-hidden
      >
        <motion.div
          className="flex h-full items-center justify-center pr-0.5"
          animate={reduceMotion ? undefined : { x: [0, 6, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { repeat: Infinity, duration: 2.1, ease: [0.45, 0, 0.55, 1] }
          }
        >
          <div className="h-16 w-1 rounded-full bg-gradient-to-b from-ff-glow/15 via-ff-glow/45 to-ff-glow/15 shadow-[0_0_14px_rgba(200,255,120,0.28)]" />
        </motion.div>
      </div>

      {hintVisible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="pointer-events-none absolute left-1/2 top-[min(12%,5.25rem)] z-30 flex -translate-x-1/2 flex-col items-center gap-1.5"
        >
          <motion.div
            className="flex items-center gap-1.5 rounded-full border border-ff-glow/45 bg-[#03080f]/82 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ff-glow shadow-[0_0_20px_rgba(200,255,120,0.2)] backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.048, delayChildren: 0.06 },
              },
            }}
          >
            <motion.span
              className="text-ff-mint"
              variants={{
                hidden: { opacity: 0, x: 8 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { type: "spring", stiffness: 420, damping: 20 },
                },
              }}
              animate={reduceMotion ? undefined : { x: [0, -5, 0] }}
              transition={
                reduceMotion ? undefined : { repeat: Infinity, duration: 1.4, ease: "easeInOut" }
              }
              aria-hidden
            >
              ←
            </motion.span>
            {"Swipe".split("").map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: 8, filter: "blur(6px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { type: "spring", stiffness: 400, damping: 22 },
                  },
                }}
              >
                {ch}
              </motion.span>
            ))}
            <motion.span
              className="text-ff-mint"
              variants={{
                hidden: { opacity: 0, x: -8 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { type: "spring", stiffness: 420, damping: 20 },
                },
              }}
              animate={reduceMotion ? undefined : { x: [0, 5, 0] }}
              transition={
                reduceMotion ? undefined : { repeat: Infinity, duration: 1.4, ease: "easeInOut" }
              }
              aria-hidden
            >
              →
            </motion.span>
          </motion.div>
        </motion.div>
      )}

      <div className="pointer-events-none absolute bottom-[calc(6.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-20 flex justify-center gap-2 drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
        {normalized.map((_, i) => (
          <motion.button
            key={i}
            type="button"
            aria-label={"Go to slide " + (i + 1)}
            aria-current={i === activeLogical}
            onClick={() => {
              dismissHint();
              goTo(i);
            }}
            className={
              "pointer-events-auto h-2.5 w-2.5 rounded-full border border-ff-glow/50 md:h-2 md:w-2 " +
              (i === activeLogical ? "bg-ff-glow ff-shadow-glow-sm" : "bg-white/35")
            }
            whileTap={reduceMotion ? undefined : { scale: 0.88 }}
            transition={{ type: "spring", stiffness: 520, damping: 26 }}
          />
        ))}
      </div>
    </section>
  );
}
