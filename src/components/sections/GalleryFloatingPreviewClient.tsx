"use client";

import type { GalleryImage } from "@prisma/client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Props = {
  images: GalleryImage[];
};

function toPct(value: number) {
  return `${value.toFixed(2)}%`;
}

export function GalleryFloatingPreviewClient({ images }: Props) {
  const reduce = useReducedMotion();
  const limited = images.slice(0, 14);
  const [centerIndex, setCenterIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = window.setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % images.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [images.length]);

  const center = images[centerIndex] ?? images[0];
  const orbit = useMemo(() => {
    if (limited.length === 0) return [];
    const radialPattern = [1.02, 0.9, 1.08, 0.94, 1.12, 0.88, 1.04, 0.92];
    const xJitterPattern = [0, 2.2, -1.5, 1.2, -2.4, 1.8, -0.8, 2.6];
    const yJitterPattern = [-2.8, 1.6, -1.1, 2.9, -2.1, 1.3, -3.2, 2.2];
    return limited.map((img, i) => {
      // Circular layout with deterministic up/down offsets and mixed radius.
      const angle = (Math.PI * 2 * i) / limited.length - Math.PI / 2;
      const baseRadius = 44;
      const radialScale = radialPattern[i % radialPattern.length];
      const radius = baseRadius * radialScale;
      const x = 50 + Math.cos(angle) * radius + xJitterPattern[i % xJitterPattern.length];
      const y =
        50 +
        Math.sin(angle) * radius * 0.9 +
        yJitterPattern[i % yJitterPattern.length] +
        (i % 2 === 0 ? -0.8 : 0.8);
      return {
        img,
        i,
        left: toPct(x),
        top: toPct(y),
      };
    });
  }, [limited]);

  if (!center) return null;

  return (
    <div className="mx-auto w-full max-w-xl px-0 sm:max-w-2xl" suppressHydrationWarning>
      <Link
        href="/gallery"
        prefetch={false}
        className="group block w-full p-0.5"
        aria-label="Open full gallery"
      >
        <div className="relative mx-auto aspect-square w-full max-w-[min(100%,28rem)] sm:max-w-[min(100%,34rem)]">
          <div className="absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={center.id}
                className="absolute inset-0 overflow-hidden rounded-[1.7rem] border border-ff-glow/35 bg-ff-void shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, filter: "blur(14px)", scale: 1.02 }
                }
                animate={
                  reduce
                    ? { opacity: 1 }
                    : { opacity: 1, filter: "blur(0px)", scale: 1 }
                }
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, filter: "blur(12px)", scale: 0.98 }
                }
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={center.url}
                  alt={center.alt ?? "Gallery cover"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {orbit.map(({ img, i, left, top }) => {
            const sizeTier = i % 5;
            const size =
              sizeTier === 0
                ? "h-[5.75rem] w-[5.75rem] sm:h-[6.25rem] sm:w-[6.25rem]"
                : sizeTier === 1
                  ? "h-[5.25rem] w-[5.25rem] sm:h-[5.75rem] sm:w-[5.75rem]"
                  : "h-[4.85rem] w-[4.85rem] sm:h-[5.25rem] sm:w-[5.25rem]";
            return (
              <motion.div
                key={img.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.05rem] border border-ff-glow/25 bg-ff-void/90 ${size}`}
                style={{ left, top }}
                animate={
                  reduce
                    ? undefined
                    : {
                        y: [0, i % 2 === 0 ? -6 : 6, 0],
                        rotate: [0, i % 2 === 0 ? -3 : 3, 0],
                      }
                }
                transition={{
                  duration: 3.2 + (i % 4) * 0.45,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt ?? `Gallery preview ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            );
          })}
        </div>
      </Link>
    </div>
  );
}

