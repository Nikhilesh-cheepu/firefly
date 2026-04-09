"use client";

import type { GalleryImage } from "@prisma/client";
import { motion, useReducedMotion } from "framer-motion";
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
      const baseRadius = 35;
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
    <div className="mx-auto max-w-md" suppressHydrationWarning>
      <Link
        href="/gallery"
        prefetch={false}
        className="group block p-0.5"
        aria-label="Open full gallery"
      >
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <motion.div
            className="absolute left-1/2 top-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.7rem] border border-ff-glow/35 bg-ff-void shadow-[0_10px_30px_rgba(0,0,0,0.52)]"
            key={center.id}
            initial={reduce ? undefined : { opacity: 0.35, scale: 0.94 }}
            animate={reduce ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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

          {orbit.map(({ img, i, left, top }) => {
            const sizeTier = i % 5;
            const size =
              sizeTier === 0
                ? "h-[4.6rem] w-[4.6rem]"
                : sizeTier === 1
                  ? "h-[4rem] w-[4rem]"
                  : "h-[3.75rem] w-[3.75rem]";
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

