"use client";

import { motion } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/lib/use-hydration-safe-reduced-motion";
import { useMounted } from "@/lib/use-mounted";

type Props = {
  className: string;
};

/** Soft fade-in for gradient bridges between major sections. */
export function BridgeReveal({ className }: Props) {
  const mounted = useMounted();
  const reduce = useHydrationSafeReducedMotion();
  const cn = "pointer-events-none h-5 w-full shrink-0 bg-gradient-to-b sm:h-6 " + className;

  if (!mounted || reduce) {
    return <div aria-hidden className={cn} />;
  }

  return (
    <motion.div
      aria-hidden
      className={cn}
      initial={reduce ? undefined : { opacity: 0 }}
      whileInView={reduce ? undefined : { opacity: 1 }}
      viewport={{ once: true, amount: 0.35, margin: "-12px 0px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
