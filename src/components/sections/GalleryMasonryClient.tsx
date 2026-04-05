"use client";

import type { GalleryImage } from "@prisma/client";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  images: GalleryImage[];
};

export function GalleryMasonryClient({ images }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 md:gap-5">
      {images.map((img, i) => (
        <motion.figure
          key={img.id}
          className={`mb-3 break-inside-avoid overflow-hidden rounded-2xl sm:mb-4 ${
            i % 3 === 0 ? "md:mt-8" : ""
          }`}
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-24px" }}
          transition={{
            duration: 0.45,
            delay: Math.min(i * 0.05, 0.35),
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={reduce ? undefined : { y: -2 }}
          whileTap={reduce ? undefined : { scale: 0.99 }}
        >
          <div className="ff-card ff-card-interactive overflow-hidden rounded-2xl border border-ff-glow/14 bg-ff-void/55 ring-1 ring-white/[0.04]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt ?? "Firefly club"}
              className="w-full object-cover transition duration-500 ease-out hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        </motion.figure>
      ))}
    </div>
  );
}
