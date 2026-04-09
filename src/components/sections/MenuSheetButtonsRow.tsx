"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMenuSheets } from "@/components/menu/MenuSheetsProvider";

export function MenuSheetButtonsRow() {
  const { openFoodMenu, openBarMenu, openHappyHours } = useMenuSheets();
  const reduce = useReducedMotion();

  const btn =
    "inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center rounded-xl border border-ff-mint/35 bg-ff-deep/80 px-3 text-sm font-semibold text-ff-glow transition hover:border-ff-glow/40 hover:bg-ff-forest/60 sm:px-4";

  return (
    <div className="flex w-full flex-wrap gap-2 sm:gap-3">
      <motion.button
        type="button"
        onClick={openFoodMenu}
        className={btn}
        whileHover={reduce ? undefined : { y: -1 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
      >
        Food menu
      </motion.button>
      <motion.button
        type="button"
        onClick={openBarMenu}
        className={btn}
        whileHover={reduce ? undefined : { y: -1 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
      >
        Bar menu
      </motion.button>
      <motion.button
        type="button"
        onClick={openHappyHours}
        className={btn}
        whileHover={reduce ? undefined : { y: -1 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
      >
        Happy hours
      </motion.button>
    </div>
  );
}
