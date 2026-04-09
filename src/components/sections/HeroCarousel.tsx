"use client";

import type { HeroSlide, HeroSlideType } from "@prisma/client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { MutableRefObject, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useHeroAmbientPulse } from "@/hooks/useHeroAmbientPulse";

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

/**
 * Videos: always load `src` + preload auto (instant play on swipe). Images: ±2 window to save bytes.
 */
function buildHeroLoadPlan(
  mode: "simple" | "infinite",
  loopSlides: LoopSlide[] | null,
  normalized: NormalizedSlide[],
  activeVideoSyncKey: string,
): Map<string, "none" | "metadata" | "auto"> {
  const map = new Map<string, "none" | "metadata" | "auto">();
  if (!activeVideoSyncKey) return map;

  if (mode === "infinite" && loopSlides) {
    const i = loopSlides.findIndex((s) => s.instanceKey === activeVideoSyncKey);
    const idx = i >= 0 ? i : 1;
    for (let j = 0; j < loopSlides.length; j++) {
      const item = loopSlides[j]!;
      if (item.type === "VIDEO") {
        map.set(item.instanceKey, "auto");
        continue;
      }
      const d = Math.abs(j - idx);
      if (d <= 2) {
        map.set(item.instanceKey, d <= 1 ? "auto" : "metadata");
      }
    }
    return map;
  }

  const i = normalized.findIndex((s) => s.key === activeVideoSyncKey);
  const idx = i >= 0 ? i : 0;
  for (let j = 0; j < normalized.length; j++) {
    const s = normalized[j]!;
    if (s.type === "VIDEO") {
      map.set(s.key, "auto");
      continue;
    }
    const d = Math.abs(j - idx);
    if (d <= 2) {
      map.set(s.key, d <= 1 ? "auto" : "metadata");
    }
  }
  return map;
}

/** iOS/Android: set muted + playsInline in JS before play(); a second <video> with the same src blocks foreground playback. */
function prepareHeroVideoEl(v: HTMLVideoElement) {
  v.playsInline = true;
  v.loop = true;
  v.setAttribute("playsinline", "");
  v.setAttribute("webkit-playsinline", "");
}

/**
 * Browsers block unmuted autoplay until a user gesture. We unlock on first scroll/touch/pointer/wheel
 * (see audioUnlocked), then start muted, await play(), and unmute. Hero off-screen pauses (syncHeroVideos).
 */
async function tryPlayHeroVideo(v: HTMLVideoElement, wantSound: boolean) {
  prepareHeroVideoEl(v);
  v.loop = true;
  v.defaultMuted = !wantSound;
  v.volume = 1;
  const attempt = async () => {
    if (!wantSound) {
      v.muted = true;
      await v.play().catch(() => {});
      return;
    }
    v.muted = true;
    try {
      await v.play();
    } catch {
      await v.play().catch(() => {});
    }
    try {
      v.muted = false;
    } catch {
      /* ignore */
    }
    // Mobile browsers can flip muted back during async media state changes.
    requestAnimationFrame(() => {
      try {
        v.muted = false;
      } catch {
        /* ignore */
      }
    });
    setTimeout(() => {
      try {
        v.muted = false;
      } catch {
        /* ignore */
      }
    }, 60);
    await v.play().catch(() => {});
  };
  if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    await attempt();
  } else {
    await Promise.race([
      new Promise<void>((resolve) => {
        v.addEventListener("canplay", () => resolve(), { once: true });
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 1200)),
    ]);
    await attempt();
  }
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

function HeroMediaCard({
  children,
  beat = 0,
  reduceMotion,
}: {
  children: ReactNode;
  /** 0–1 from audio analysis; border / glow pulse */
  beat?: number;
  reduceMotion?: boolean;
}) {
  const b = reduceMotion ? 0 : Math.min(1, Math.max(0, beat));
  return (
    <div
      className="overflow-hidden rounded-2xl bg-black/20 ring-1 transition-[border-color,box-shadow,border-width] duration-[65ms] ease-out ring-ff-mint/20"
      style={{
        borderStyle: "solid",
        borderWidth: `${2 + b * 3}px`,
        borderColor: `rgba(200, 255, 120, ${0.45 + b * 0.52})`,
        boxShadow: [
          `0 0 0 ${1 + b * 2}px rgba(124, 245, 198, ${0.16 + b * 0.42})`,
          `0 12px 40px rgba(0,0,0,0.55)`,
          `0 0 ${6 + b * 92}px rgba(200,255,120,${0.28 + b * 0.7})`,
          `0 0 ${28 + b * 64}px rgba(200,255,120,${0.1 + b * 0.42})`,
          `inset 0 0 ${16 + b * 64}px rgba(200,255,120,${0.08 + b * 0.26})`,
        ].join(", "),
      }}
    >
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
  beat = 0,
}: {
  slide: NormalizedSlide;
  reduceMotion: boolean;
  /** 0–1 audio-reactive wash (video + unmuted only) */
  beat?: number;
}) {
  const usePosterStill =
    slide.type === "VIDEO" && slide.posterUrl != null && slide.posterUrl !== "";

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

  const b = reduceMotion ? 0 : Math.min(1, Math.max(0, beat));
  const washScale = 1 + b * 0.092;
  const tintOpacity = Math.min(1, 0.72 + b * 0.34);

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
          <div
            className="absolute inset-[-32%] flex items-center justify-center transition-transform duration-[65ms] ease-out will-change-transform"
            style={{ transform: `scale(${washScale})` }}
          >
            {slide.type === "IMAGE" || usePosterStill ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={usePosterStill ? slide.posterUrl! : slide.mediaUrl}
                alt=""
                className={AMBIENT_MEDIA}
                draggable={false}
              />
            ) : (
              /* No second <video> with same src — iOS WebKit often blocks play() on the foreground until the duplicate stops. */
              <div
                className="h-full w-full min-h-[120%] min-w-[120%] [transform:translateZ(0)] scale-110 blur-[min(22vw,9rem)] brightness-125 opacity-[0.62] bg-gradient-to-br from-ff-mint/20 via-ff-forest/75 to-ff-void"
                aria-hidden
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Brand-tinted lift on very dark frames */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-ff-glow/[0.09] via-ff-mint/[0.05] to-ff-glow/[0.07] mix-blend-soft-light transition-opacity duration-[65ms] ease-out"
        style={{ opacity: tintOpacity }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#03080f]/36 via-[#03080f]/16 to-[#03080f]/40" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_36%,rgba(200,255,120,0.22)_0%,rgba(200,255,120,0.08)_28%,transparent_52%)] mix-blend-screen transition-opacity duration-[65ms]"
        style={{ opacity: Math.min(1, 0.2 + b * 0.82) }}
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_72%,rgba(124,245,198,0.12)_0%,transparent_45%)] mix-blend-plus-lighter transition-opacity duration-[65ms]"
        style={{ opacity: b * 0.55 }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,transparent_0%,rgba(3,8,15,0.22)_65%,rgba(3,8,15,0.48)_100%)]" />
    </div>
  );
}

function HeroBackdrop({
  slide,
  instanceKey,
  activeInstanceKey,
  heroInView,
  audioUnlocked,
  videoRefs,
  beat,
  reduceMotion,
}: {
  slide: NormalizedSlide;
  instanceKey: string;
  activeInstanceKey: string;
  heroInView: boolean;
  /** First scroll / touch / pointer / wheel — counts as gesture so we may unmute (browser policy). */
  audioUnlocked: boolean;
  videoRefs: MutableRefObject<Map<string, HTMLVideoElement | null>>;
  beat: number;
  reduceMotion: boolean;
}) {
  const audible = heroInView && audioUnlocked && instanceKey === activeInstanceKey;
  if (slide.type === "VIDEO") {
    return (
      <HeroMediaCard beat={beat} reduceMotion={reduceMotion}>
        <PortraitHeroFrame>
          <video
            ref={(el) => {
              videoRefs.current.set(instanceKey, el);
              if (el) prepareHeroVideoEl(el);
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
    <HeroMediaCard beat={0} reduceMotion={reduceMotion}>
      <PortraitHeroFrame>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.mediaUrl}
          alt=""
          fetchPriority="high"
          className="pointer-events-none h-full w-full object-contain select-none"
        />
      </PortraitHeroFrame>
    </HeroMediaCard>
  );
}

function HeroSlideMedia({
  slide,
  instanceKey,
  activeInstanceKey,
  heroInView,
  audioUnlocked,
  videoRefs,
  loadMedia,
  videoPreload,
  imageFetchPriority,
}: {
  slide: NormalizedSlide;
  instanceKey: string;
  activeInstanceKey: string;
  heroInView: boolean;
  audioUnlocked: boolean;
  videoRefs: MutableRefObject<Map<string, HTMLVideoElement | null>>;
  loadMedia: boolean;
  videoPreload: "none" | "metadata" | "auto";
  imageFetchPriority?: "high" | "low" | "auto";
}) {
  const audible = heroInView && audioUnlocked && instanceKey === activeInstanceKey;
  if (slide.type === "VIDEO") {
    return (
      <video
        ref={(el) => {
          videoRefs.current.set(instanceKey, el);
          if (el) prepareHeroVideoEl(el);
        }}
        className="pointer-events-none h-full w-full object-contain select-none"
        src={loadMedia ? slide.mediaUrl : undefined}
        poster={slide.posterUrl ?? undefined}
        autoPlay={loadMedia}
        muted={!audible}
        loop
        playsInline
        preload={videoPreload}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={slide.mediaUrl}
      alt=""
      loading={loadMedia ? "eager" : "lazy"}
      fetchPriority={imageFetchPriority ?? (loadMedia ? "auto" : "low")}
      className="pointer-events-none h-full w-full object-contain select-none"
    />
  );
}

function HeroSlideColumn({
  loopItem,
  videoRefs,
  activeInstanceKey,
  heroInView,
  audioUnlocked,
  isActive,
  reduceMotion,
  loadMedia,
  videoPreload,
  imageFetchPriority,
  beat,
}: {
  loopItem: LoopSlide;
  videoRefs: MutableRefObject<Map<string, HTMLVideoElement | null>>;
  activeInstanceKey: string;
  heroInView: boolean;
  audioUnlocked: boolean;
  isActive: boolean;
  reduceMotion: boolean;
  loadMedia: boolean;
  videoPreload: "none" | "metadata" | "auto";
  imageFetchPriority?: "high" | "low" | "auto";
  beat: number;
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
        <HeroMediaCard beat={isActive ? beat : 0} reduceMotion={reduceMotion}>
          <PortraitHeroFrame>
            <HeroSlideMedia
              slide={loopItem}
              instanceKey={loopItem.instanceKey}
              activeInstanceKey={activeInstanceKey}
              heroInView={heroInView}
              audioUnlocked={audioUnlocked}
              videoRefs={videoRefs}
              loadMedia={loadMedia}
              videoPreload={videoPreload}
              imageFetchPriority={imageFetchPriority}
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
  /** Assume visible until IntersectionObserver runs so first paint attempts audible autoplay. */
  const [heroInView, setHeroInView] = useState(true);
  /**
   * Browsers require a user gesture for unmuted playback. Any scroll, touch, pointer, or wheel
   * on the page unlocks hero audio once (no visible control).
   */
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement | null>>(new Map());
  const activeVideoSyncKeyRef = useRef("");
  const prevActiveVideoKeyRef = useRef("");

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

  const hasHeroVideo = useMemo(
    () => normalized.some((s) => s.type === "VIDEO"),
    [normalized],
  );

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

  /** Track active slide for render-time sync (avoid effect setState). */
  const [syncKeySnapshot, setSyncKeySnapshot] = useState(activeVideoSyncKey);
  if (activeVideoSyncKey !== syncKeySnapshot) {
    setSyncKeySnapshot(activeVideoSyncKey);
  }

  useEffect(() => {
    if (typeof window === "undefined" || mode === "empty") return;
    const el = heroSectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        setHeroInView(e.isIntersecting);
      },
      { threshold: 0, root: null, rootMargin: "0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode, normalized.length]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    if (mode === "empty" || !hasHeroVideo || audioUnlocked) return;

    const opts = { passive: true, capture: true } as const;
    const unlock = () => {
      setAudioUnlocked((prev) => (prev ? prev : true));
    };

    document.addEventListener("pointerdown", unlock, opts);
    document.addEventListener("touchstart", unlock, opts);
    document.addEventListener("wheel", unlock, opts);
    window.addEventListener("scroll", unlock, opts);
    window.addEventListener("keydown", unlock, opts);

    return () => {
      document.removeEventListener("pointerdown", unlock, opts);
      document.removeEventListener("touchstart", unlock, opts);
      document.removeEventListener("wheel", unlock, opts);
      window.removeEventListener("scroll", unlock, opts);
      window.removeEventListener("keydown", unlock, opts);
    };
  }, [mode, hasHeroVideo, audioUnlocked]);

  const activeSlideForBeat = useMemo(() => {
    if (mode === "empty") return null;
    if (mode === "single") return normalized[0] ?? null;
    return normalized[activeLogical] ?? normalized[0] ?? null;
  }, [mode, normalized, activeLogical]);

  const beatEligible =
    mode !== "empty" &&
    activeSlideForBeat?.type === "VIDEO" &&
    heroInView &&
    audioUnlocked;

  const beatEnergy = useHeroAmbientPulse(beatEligible, !!reduceMotion);

  const heroLoadPlan = useMemo(() => {
    if (mode !== "simple" && mode !== "infinite") return null;
    return buildHeroLoadPlan(mode, loopSlides, normalized, activeVideoSyncKey);
  }, [mode, loopSlides, normalized, activeVideoSyncKey]);

  /** Hint the browser to fetch the first on-screen slides before paint (carousel strip). */
  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    if (mode !== "simple" && mode !== "infinite") return;

    const links: HTMLLinkElement[] = [];
    const seen = new Set<string>();

    const pushPreloadImage = (href: string) => {
      if (!href || seen.has(href)) return;
      seen.add(href);
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      document.head.appendChild(link);
      links.push(link);
    };

    if (mode === "infinite" && loopSlides) {
      for (const j of [1, 2, 3]) {
        const s = loopSlides[j];
        if (!s) break;
        if (s.type !== "VIDEO") pushPreloadImage(s.mediaUrl);
      }
    } else {
      for (let j = 0; j < Math.min(3, normalized.length); j++) {
        const s = normalized[j]!;
        if (s.type !== "VIDEO") pushPreloadImage(s.mediaUrl);
      }
    }

    return () => {
      for (const link of links) {
        link.remove();
      }
    };
  }, [mode, loopSlides, normalized]);

  const syncHeroVideos = useCallback(() => {
    const activeKey = activeVideoSyncKey;
    const activeChanged = prevActiveVideoKeyRef.current !== activeKey;
    prevActiveVideoKeyRef.current = activeKey;
    activeVideoSyncKeyRef.current = activeKey;
    videoRefs.current.forEach((v, key) => {
      if (!v || v.tagName !== "VIDEO") return;
      if (key === activeKey) {
        if (!heroInView) {
          prepareHeroVideoEl(v);
          v.muted = true;
          try {
            v.pause();
          } catch {
            /* ignore */
          }
          return;
        }
        if (!v.src) return;
        if (activeChanged) {
          try {
            v.pause();
          } catch {
            /* ignore */
          }
          try {
            v.currentTime = 0;
          } catch {
            /* ignore */
          }
        }
        const wantSound = heroInView && audioUnlocked && key === activeKey;
        void tryPlayHeroVideo(v, wantSound);
      } else {
        prepareHeroVideoEl(v);
        v.muted = true;
        v.pause();
        try {
          v.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
    });
  }, [activeVideoSyncKey, heroInView, audioUnlocked]);

  useEffect(() => {
    if (normalized.length === 0) return;
    const run = () => {
      syncHeroVideos();
      requestAnimationFrame(() => syncHeroVideos());
    };
    queueMicrotask(run);
  }, [syncHeroVideos, heroInView, audioUnlocked, normalized.length, activeVideoSyncKey]);

  useEffect(() => {
    activeLogicalRef.current = activeLogical;
  }, [activeLogical]);

  useEffect(() => {
    if (typeof window === "undefined" || !carouselMulti) return;
    if (window.sessionStorage.getItem(HINT_KEY) === "1") return;
    /* After hero media can win LCP; Framer blur-on-letters was flagged as ~3.5s render delay in PSI. */
    const show = window.setTimeout(() => setHintVisible(true), 2800);
    const hide = window.setTimeout(() => setHintVisible(false), 11_000);
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
        ref={heroSectionRef}
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
        ref={heroSectionRef}
        className="relative flex min-h-[min(90dvh,90svh)] w-full items-center justify-center overflow-hidden bg-ff-hero-void"
        aria-label="Firefly hero"
      >
        <HeroAmbientBackdrop slide={s} reduceMotion={!!reduceMotion} beat={beatEnergy} />
        <div className="relative z-10 flex w-full items-center justify-center">
          <HeroBackdrop
            slide={s}
            instanceKey={ik}
            activeInstanceKey={ik}
            heroInView={heroInView}
            audioUnlocked={audioUnlocked}
            videoRefs={videoRefs}
            beat={beatEnergy}
            reduceMotion={!!reduceMotion}
          />
        </div>
      </section>
    );
  }

  const soundTargetInstanceKey =
    activeInstanceKey ||
    (mode === "infinite" && loopSlides
      ? loopSlides[1]!.instanceKey
      : normalized[0]?.key ?? "");

  const ambientSlide = normalized[activeLogical] ?? normalized[0]!;
  const activeSlideKey = normalized[activeLogical]?.key ?? normalized[0]!.key;

  return (
    <section
      ref={heroSectionRef}
      className="relative min-h-[min(90dvh,90svh)] w-full overflow-hidden bg-ff-hero-void"
      aria-label="Firefly hero"
    >
      <HeroAmbientBackdrop slide={ambientSlide} reduceMotion={!!reduceMotion} beat={beatEnergy} />
      <div
        ref={scrollerRef}
        onScroll={onScrollUser}
        className="relative z-10 flex h-[min(90dvh,90svh)] min-h-[420px] w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [touch-action:pan-x_pan-y] [overflow-anchor:none] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {mode === "infinite" && loopSlides
          ? loopSlides.map((item) => {
              const videoPreload = heroLoadPlan?.get(item.instanceKey) ?? "none";
              const loadMedia = videoPreload !== "none";
              const imageFetchPriority =
                item.instanceKey === activeVideoSyncKey ? ("high" as const) : ("low" as const);
              return (
                <HeroSlideColumn
                  key={item.instanceKey}
                  loopItem={item}
                  videoRefs={videoRefs}
                  activeInstanceKey={soundTargetInstanceKey}
                  heroInView={heroInView}
                  audioUnlocked={audioUnlocked}
                  isActive={item.key === activeSlideKey}
                  reduceMotion={!!reduceMotion}
                  loadMedia={loadMedia}
                  videoPreload={videoPreload}
                  imageFetchPriority={imageFetchPriority}
                  beat={beatEnergy}
                />
              );
            })
          : normalized.map((s) => {
              const videoPreload = heroLoadPlan?.get(s.key) ?? "none";
              const loadMedia = videoPreload !== "none";
              const imageFetchPriority = s.key === activeVideoSyncKey ? ("high" as const) : ("low" as const);
              return (
                <HeroSlideColumn
                  key={s.key}
                  loopItem={{ ...s, instanceKey: s.key }}
                  videoRefs={videoRefs}
                  activeInstanceKey={soundTargetInstanceKey}
                  heroInView={heroInView}
                  audioUnlocked={audioUnlocked}
                  isActive={s.key === activeSlideKey}
                  reduceMotion={!!reduceMotion}
                  loadMedia={loadMedia}
                  videoPreload={videoPreload}
                  imageFetchPriority={imageFetchPriority}
                  beat={beatEnergy}
                />
              );
            })}
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-30 w-[min(7vw,2rem)]"
        aria-hidden
      >
        <div
          className={`flex h-full items-center justify-center pl-0.5 will-change-transform ${reduceMotion ? "" : "ff-hero-chevron-left"}`}
        >
          <div className="h-16 w-1 rounded-full bg-gradient-to-b from-ff-glow/15 via-ff-glow/45 to-ff-glow/15 shadow-[0_0_14px_rgba(200,255,120,0.28)]" />
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-30 w-[min(7vw,2rem)]"
        aria-hidden
      >
        <div
          className={`flex h-full items-center justify-center pr-0.5 will-change-transform ${reduceMotion ? "" : "ff-hero-chevron-right"}`}
        >
          <div className="h-16 w-1 rounded-full bg-gradient-to-b from-ff-glow/15 via-ff-glow/45 to-ff-glow/15 shadow-[0_0_14px_rgba(200,255,120,0.28)]" />
        </div>
      </div>

      {hintVisible && (
        <div className="pointer-events-none absolute left-1/2 top-[min(12%,5.25rem)] z-30 flex -translate-x-1/2 flex-col items-center gap-1.5">
          <div
            role="status"
            className="ff-hero-hint-pop flex items-center gap-1.5 rounded-full border border-ff-glow/45 bg-[#03080f]/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ff-glow shadow-[0_0_20px_rgba(200,255,120,0.2)]"
          >
            <span className="text-ff-mint" aria-hidden>
              ←
            </span>
            <span>Swipe</span>
            <span className="text-ff-mint" aria-hidden>
              →
            </span>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-[calc(6.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-20 flex justify-center gap-2 drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
        {normalized.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={"Go to slide " + (i + 1)}
            aria-current={i === activeLogical}
            onClick={() => {
              dismissHint();
              goTo(i);
            }}
            className={
              "pointer-events-auto h-2.5 w-2.5 rounded-full border border-ff-glow/50 transition-transform active:scale-[0.88] md:h-2 md:w-2 " +
              (i === activeLogical ? "bg-ff-glow ff-shadow-glow-sm" : "bg-white/35")
            }
          />
        ))}
      </div>
    </section>
  );
}
