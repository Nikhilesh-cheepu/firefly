"use client";

import { motion, useReducedMotion } from "framer-motion";
import { trackEvent } from "@/lib/track-client";

type Props = {
  href: string;
};

export function MapsCta({ href }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        trackEvent({ eventType: "LOCATION_CLICK", source: "visit_section_maps_cta" });
      }}
      className="mt-6 inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border border-ff-glow/40 bg-ff-glow/10 px-6 py-3 text-sm font-medium text-ff-glow ff-shadow-glow-sm"
      whileHover={reduce ? undefined : { scale: 1.03, boxShadow: "0 0 36px rgba(200,255,120,0.22)" }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      Open in Maps
    </motion.a>
  );
}
