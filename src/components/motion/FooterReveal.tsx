"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useHydrationSafeReducedMotion } from "@/lib/use-hydration-safe-reduced-motion";
import { useMounted } from "@/lib/use-mounted";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
  suppressHydrationWarning?: boolean;
};

export function FooterReveal({ children, className, id, suppressHydrationWarning }: Props) {
  const mounted = useMounted();
  const reduce = useHydrationSafeReducedMotion();

  if (!mounted || reduce) {
    return (
      <footer id={id} className={className} suppressHydrationWarning={suppressHydrationWarning}>
        {children}
      </footer>
    );
  }

  return (
    <motion.footer
      id={id}
      className={className}
      suppressHydrationWarning={suppressHydrationWarning}
      initial={reduce ? undefined : { opacity: 0, y: 22 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "-32px 0px -12px 0px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.footer>
  );
}
