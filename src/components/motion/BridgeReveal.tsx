"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  className: string;
};

/** Soft fade-in for gradient bridges between major sections. */
export function BridgeReveal({ className }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className={"pointer-events-none h-5 w-full shrink-0 bg-gradient-to-b sm:h-6 " + className}
      initial={reduce ? undefined : { opacity: 0 }}
      whileInView={reduce ? undefined : { opacity: 1 }}
      viewport={{ once: true, amount: 0.35, margin: "-12px 0px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
