"use client";

import type { GalleryImage } from "@prisma/client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type Props = {
  images: GalleryImage[];
};

function bentoCellClass(i: number): string {
  const m = i % 8;
  switch (m) {
    case 0:
      return "col-span-2 row-span-2 min-h-[200px] md:min-h-[280px]";
    case 1:
      return "col-span-1 row-span-1 min-h-[100px]";
    case 2:
      return "col-span-1 row-span-1 min-h-[100px]";
    case 3:
      return "col-span-2 row-span-1 min-h-[120px]";
    case 4:
      return "col-span-1 row-span-2 min-h-[200px] md:min-h-[260px]";
    case 5:
      return "col-span-1 row-span-1 min-h-[100px]";
    case 6:
      return "col-span-1 row-span-1 min-h-[100px]";
    case 7:
    default:
      return "col-span-2 row-span-1 min-h-[120px]";
  }
}

export function GalleryMasonryClient({ images }: Props) {
  const reduce = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft" && openIndex > 0) setOpenIndex(openIndex - 1);
      if (e.key === "ArrowRight" && openIndex < images.length - 1) setOpenIndex(openIndex + 1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openIndex, close, images.length]);

  const sheetTransition = reduce
    ? { duration: 0.22 }
    : { type: "spring" as const, stiffness: 420, damping: 36 };

  const current = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:gap-3 md:auto-rows-[minmax(100px,auto)]">
        {images.map((img, i) => (
          <motion.button
            key={img.id}
            type="button"
            className={`group relative overflow-hidden rounded-2xl text-left ${bentoCellClass(i)}`}
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-24px" }}
            transition={{
              duration: 0.45,
              delay: Math.min(i * 0.04, 0.35),
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={reduce ? undefined : { scale: 1.01 }}
            whileTap={reduce ? undefined : { scale: 0.99 }}
            onClick={() => setOpenIndex(i)}
            aria-label={`View gallery image ${i + 1}`}
          >
            <div className="ff-card ff-card-interactive absolute inset-0 overflow-hidden rounded-2xl border border-ff-glow/14 bg-ff-void/55 ring-1 ring-white/[0.04]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? "Firefly club"}
                className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#03080f]/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {current && openIndex !== null && (
          <motion.div
            className="fixed inset-0 z-[75] flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close gallery"
              onClick={close}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Gallery image"
              className="relative z-10 mx-auto w-full max-w-3xl rounded-t-2xl border border-ff-glow/25 border-b-0 bg-ff-void/98 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              initial={reduce ? { y: "100%" } : { y: "105%" }}
              animate={{ y: 0 }}
              exit={reduce ? { y: "100%" } : { y: "105%" }}
              transition={sheetTransition}
            >
              <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ff-mist/30" aria-hidden />
              <div className="mb-2 flex items-center justify-between gap-2 px-1">
                <span className="text-xs font-medium text-ff-mist/80">
                  {openIndex + 1} / {images.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={openIndex <= 0}
                    onClick={() => openIndex > 0 && setOpenIndex(openIndex - 1)}
                    className="rounded-lg px-3 py-1.5 text-sm text-ff-mist transition hover:bg-white/5 hover:text-ff-glow disabled:opacity-30"
                    aria-label="Previous image"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={openIndex >= images.length - 1}
                    onClick={() =>
                      openIndex < images.length - 1 && setOpenIndex(openIndex + 1)
                    }
                    className="rounded-lg px-3 py-1.5 text-sm text-ff-mist transition hover:bg-white/5 hover:text-ff-glow disabled:opacity-30"
                    aria-label="Next image"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-ff-mist transition hover:bg-white/5 hover:text-ff-glow"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="flex max-h-[min(78dvh,720px)] items-center justify-center overflow-hidden rounded-xl bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.url}
                  alt={current.alt ?? "Firefly club"}
                  className="max-h-[min(78dvh,720px)] w-full object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
