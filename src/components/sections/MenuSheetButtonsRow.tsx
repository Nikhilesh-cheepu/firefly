"use client";

import { useMenuSheets } from "@/components/menu/MenuSheetsProvider";
import { useHydrationSafeReducedMotion } from "@/lib/use-hydration-safe-reduced-motion";
import { useMounted } from "@/lib/use-mounted";

export function MenuSheetButtonsRow() {
  const { openFoodMenu, openBarMenu, openHappyHours } = useMenuSheets();
  const mounted = useMounted();
  const reduce = useHydrationSafeReducedMotion();

  const btn =
    "inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center rounded-xl border border-ff-mint/35 bg-ff-deep/80 px-3 text-sm font-semibold text-ff-glow transition hover:border-ff-glow/40 hover:bg-ff-forest/60 sm:px-4";

  const buttons = [
    { label: "Food menu", onClick: openFoodMenu },
    { label: "Bar menu", onClick: openBarMenu },
    { label: "Happy hours", onClick: openHappyHours },
  ] as const;

  if (!mounted || reduce) {
    return (
      <div className="flex w-full flex-wrap gap-2 sm:gap-3">
        {buttons.map(({ label, onClick }) => (
          <button key={label} type="button" onClick={onClick} className={btn}>
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap gap-2 sm:gap-3">
      {buttons.map(({ label, onClick }) => (
        <button key={label} type="button" onClick={onClick} className={btn}>
          {label}
        </button>
      ))}
    </div>
  );
}
