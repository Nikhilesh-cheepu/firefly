"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useHydrationSafeReducedMotion } from "@/lib/use-hydration-safe-reduced-motion";
import { useMounted } from "@/lib/use-mounted";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Vertical nudge before reveal (px). */
  y?: number;
};

export function FadeInChild({ children, className, delay = 0, y = 18 }: Props) {
  const mounted = useMounted();
  const reduce = useHydrationSafeReducedMotion();

  if (!mounted || reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px 0px -72px 0px", amount: 0.06 }}
      transition={{ duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
