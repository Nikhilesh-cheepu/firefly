"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function FooterReveal({ children, className, id }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.footer
      id={id}
      className={className}
      initial={reduce ? undefined : { opacity: 0, y: 22 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "-32px 0px -12px 0px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.footer>
  );
}
