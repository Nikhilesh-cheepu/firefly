"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { formatISTDateLong, istYmd } from "@/lib/ist-datetime";

type Props = {
  value: string;
  onChange: (ymd: string) => void;
  minYmd: string;
  maxYmd: string;
};

const WEEKDAYS_MON_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toYmd(y: number, m: number, d: number) {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function parseYmd(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split("-").map(Number);
  return { y: y!, m: m!, d: d! };
}

function daysInMonth(y: number, m1: number) {
  return new Date(y, m1, 0).getDate();
}

/** 0 = Sunday … 6 = Saturday in IST for this civil date */
function weekdaySun0IST(y: number, m1: number, d: number): number {
  const iso = toYmd(y, m1, d);
  const dt = new Date(`${iso}T12:00:00+05:30`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
  }).formatToParts(dt);
  const w = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[w] ?? 0;
}

/** Leading empty cells for a Monday-first grid */
function mondayPad(sun0: number) {
  return (sun0 + 6) % 7;
}

function IconChevronDown({ className, open }: { className?: string; open?: boolean }) {
  return (
    <svg
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""} ${className ?? ""}`}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BookingDatePicker({ value, onChange, minYmd, maxYmd }: Props) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const [open, setOpen] = useState(false);

  const { y: vy, m: vm } = parseYmd(value);
  const [viewY, setViewY] = useState(vy);
  const [viewM, setViewM] = useState(vm);

  useEffect(() => {
    if (!open) return;
    setViewY(vy);
    setViewM(vm);
  }, [open, vy, vm]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close, { passive: true });
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [open]);

  const today = istYmd();

  const grid = useMemo(() => {
    const dim = daysInMonth(viewY, viewM);
    const pad = mondayPad(weekdaySun0IST(viewY, viewM, 1));
    const cells: ({ kind: "pad" } | { kind: "day"; d: number; ymd: string })[] = [];
    for (let i = 0; i < pad; i++) cells.push({ kind: "pad" });
    for (let d = 1; d <= dim; d++) {
      cells.push({ kind: "day", d, ymd: toYmd(viewY, viewM, d) });
    }
    return cells;
  }, [viewY, viewM]);

  const canPrevMonth = useMemo(() => {
    const py = viewM === 1 ? viewY - 1 : viewY;
    const pm = viewM === 1 ? 12 : viewM - 1;
    const last = toYmd(py, pm, daysInMonth(py, pm));
    return last >= minYmd;
  }, [viewY, viewM, minYmd]);

  const canNextMonth = useMemo(() => {
    const ny = viewM === 12 ? viewY + 1 : viewY;
    const nm = viewM === 12 ? 1 : viewM + 1;
    const first = toYmd(ny, nm, 1);
    return first <= maxYmd;
  }, [viewY, viewM, maxYmd]);

  const monthTitle = useMemo(() => {
    const label = new Date(`${toYmd(viewY, viewM, 1)}T12:00:00+05:30`).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
    return label;
  }, [viewY, viewM]);

  const pick = useCallback(
    (iso: string) => {
      if (iso < minYmd || iso > maxYmd) return;
      onChange(iso);
      setOpen(false);
    },
    [minYmd, maxYmd, onChange],
  );

  const goPrev = useCallback(() => {
    if (!canPrevMonth) return;
    if (viewM === 1) {
      setViewY((y) => y - 1);
      setViewM(12);
    } else {
      setViewM((m) => m - 1);
    }
  }, [canPrevMonth, viewM]);

  const goNext = useCallback(() => {
    if (!canNextMonth) return;
    if (viewM === 12) {
      setViewY((y) => y + 1);
      setViewM(1);
    } else {
      setViewM((m) => m + 1);
    }
  }, [canNextMonth, viewM]);

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="overflow-hidden rounded-xl border-2 border-ff-glow/40 bg-gradient-to-br from-ff-deep/95 to-ff-void/85 shadow-[0_0_0_1px_rgba(212,255,92,0.08),0_16px_40px_-20px_rgba(0,0,0,0.6)]">
        <button
          type="button"
          id={`${id}-trigger`}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-[52px] w-full flex-col items-center justify-center gap-0.5 px-3 py-2.5 transition hover:bg-white/[0.03] active:bg-white/[0.05]"
        >
          <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-ff-mint/90">Date</p>
          <p className="max-w-full truncate text-center text-[15px] font-semibold leading-tight tracking-wide text-white">
            {formatISTDateLong(value)}
          </p>
          <IconChevronDown open={open} className="h-[18px] w-[18px] text-ff-glow" />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="cal"
              id={`${id}-panel`}
              role="dialog"
              aria-label="Calendar"
              initial={reduce ? undefined : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="border-t border-ff-glow/15 bg-ff-void/60 px-2.5 pb-3 pt-2 backdrop-blur-md"
            >
              <div className="mb-2 flex items-center justify-between gap-1.5">
                <button
                  type="button"
                  disabled={!canPrevMonth}
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ff-glow/20 text-ff-mint transition hover:border-ff-glow/40 hover:text-ff-glow disabled:cursor-not-allowed disabled:opacity-25"
                  aria-label="Previous month"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <p className="min-w-0 flex-1 text-center font-[family-name:var(--font-display)] text-lg tracking-[0.06em] text-ff-glow uppercase sm:text-xl">
                  {monthTitle}
                </p>
                <button
                  type="button"
                  disabled={!canNextMonth}
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ff-glow/20 text-ff-mint transition hover:border-ff-glow/40 hover:text-ff-glow disabled:cursor-not-allowed disabled:opacity-25"
                  aria-label="Next month"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {WEEKDAYS_MON_FIRST.map((d) => (
                  <div
                    key={d}
                    className="pb-0.5 text-center text-[8px] font-semibold uppercase tracking-[0.1em] text-zinc-500 sm:text-[9px]"
                  >
                    {d}
                  </div>
                ))}
                {grid.map((cell, i) => {
                  if (cell.kind === "pad") {
                    return <div key={`p-${i}`} className="aspect-square min-h-[34px] sm:min-h-[36px]" />;
                  }
                  const iso = cell.ymd;
                  const disabled = iso < minYmd || iso > maxYmd;
                  const selected = iso === value;
                  const isToday = iso === today;
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={disabled}
                      onClick={() => pick(iso)}
                      className={
                        "relative flex aspect-square min-h-[34px] items-center justify-center rounded-lg text-[13px] font-semibold tracking-wide transition sm:min-h-[36px] sm:text-sm " +
                        (disabled
                          ? "cursor-not-allowed text-ff-mist/25"
                          : selected
                            ? "bg-ff-glow text-ff-void shadow-[0_0_16px_rgba(212,255,92,0.32)]"
                            : isToday
                              ? "text-white ring-2 ring-ff-mint/45 ring-offset-1 ring-offset-ff-void/80 hover:bg-ff-glow/15"
                              : "text-white/95 hover:bg-ff-glow/12 hover:text-ff-glow")
                      }
                    >
                      {cell.d}
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-center text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                India time · IST
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-1.5 text-center text-[10px] font-medium leading-snug tracking-wide text-zinc-500">
        Tap to open · pick a day
      </p>
    </div>
  );
}
