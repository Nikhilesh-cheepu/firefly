"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId } from "react";
import type { HappyHourGroup } from "@/data/dummy-menu";

export type MenuSheetKind = "food" | "beverages" | "happy";

type ListItem = {
  id: string;
  name: string;
  description?: string | null;
  price?: string | null;
};

type Props = {
  active: MenuSheetKind | null;
  onClose: () => void;
  happyHourGroups: HappyHourGroup[];
  foodItems: ListItem[];
  beverageItems: ListItem[];
};

export function MenuTopSheet({
  active,
  onClose,
  happyHourGroups,
  foodItems,
  beverageItems,
}: Props) {
  const reduce = useReducedMotion();
  const open = active !== null;
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const sheetTransition = reduce
    ? { duration: 0.2 }
    : { type: "spring" as const, stiffness: 420, damping: 36 };

  const title =
    active === "food" ? "Food menu" : active === "beverages" ? "Beverages" : "Happy hours";

  const ariaClose =
    active === "food"
      ? "Close Food menu"
      : active === "beverages"
        ? "Close Beverages menu"
        : "Close Happy hours";

  return (
    <AnimatePresence>
      {open && active && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col items-stretch justify-start pt-[max(0.75rem,env(safe-area-inset-top))] px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            aria-label={ariaClose}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 mx-auto mt-2 w-full max-w-md overflow-hidden rounded-b-2xl border border-ff-glow/20 border-t-0 bg-ff-void/98 ff-shadow-bar backdrop-blur-xl"
            initial={reduce ? { y: "-100%" } : { y: "-105%" }}
            animate={{ y: 0 }}
            exit={reduce ? { y: "-100%" } : { y: "-105%" }}
            transition={sheetTransition}
          >
            <div className="max-h-[min(72vh,520px)] overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ff-mist/25" aria-hidden />
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2
                  id={titleId}
                  className="font-[family-name:var(--font-display)] text-xl tracking-wide text-ff-glow"
                >
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-ff-mist transition hover:bg-white/5 hover:text-ff-glow"
                >
                  Close
                </button>
              </div>
              {active === "happy" && (
                <div className="space-y-6 pb-2">
                  {happyHourGroups.map((g) => (
                    <div key={g.title}>
                      <h3 className="mb-2 border-b border-ff-glow/20 pb-1.5 text-sm font-semibold uppercase tracking-[0.2em] text-ff-mint/90">
                        {g.title}
                      </h3>
                      <ul className="space-y-3">
                        {g.deals.map((d) => (
                          <li
                            key={d.id}
                            className="flex items-start justify-between gap-3 rounded-xl border border-ff-glow/12 bg-ff-deep/50 px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-white">{d.name}</p>
                              {d.description && (
                                <p className="mt-0.5 text-sm text-ff-mist/75">{d.description}</p>
                              )}
                            </div>
                            {d.price && (
                              <span className="shrink-0 text-sm font-medium text-ff-glow">
                                {d.price}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {(active === "food" || active === "beverages") && (
                <ul className="space-y-3 pb-2">
                  {(active === "food" ? foodItems : beverageItems).map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-ff-glow/12 bg-ff-deep/50 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-white">{item.name}</p>
                        {item.description && (
                          <p className="mt-0.5 text-sm text-ff-mist/75">{item.description}</p>
                        )}
                      </div>
                      {item.price && (
                        <span className="shrink-0 text-sm font-medium text-ff-glow">{item.price}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
