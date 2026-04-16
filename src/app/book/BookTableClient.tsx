"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { submitTableBooking } from "@/app/book/actions";
import type { BookingSlotMeta, MealSegment } from "@/data/booking-slots";
import { ALL_BOOKING_SLOTS, DINNER_SLOTS, LUNCH_SLOTS } from "@/data/booking-slots";
import { BookingDatePicker } from "@/components/booking/BookingDatePicker";
import { bookNowClayClassName, clayPillMutedClassName, ClayPillLabel } from "@/components/BookNowClayButton";
import { addDaysISTYmd, istNowMinutesFromMidnight, istYmd } from "@/lib/ist-datetime";
import { trackEvent } from "@/lib/track-client";

type Props = {
  whatsappRaw: string | null;
};

function IconSun({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 14.5A8.5 8.5 0 0110.5 4a8.45 8.45 0 006.32 14.5 8.5 8.5 0 004.18-4z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function pickMealTabForDate(iso: string): MealSegment {
  const today = istYmd();
  if (iso !== today) return "lunch";
  return istNowMinutesFromMidnight() >= 18 * 60 + 15 ? "dinner" : "lunch";
}

function digitsOnlyMax10(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 10);
}

function isSlotInPastForSelectedDate(iso: string, meta: BookingSlotMeta, nowMin: number): boolean {
  const today = istYmd();
  if (iso < today) return true;
  if (iso > today) return false;
  return meta.minutes <= nowMin;
}

export function BookTableClient({ whatsappRaw }: Props) {
  const reduce = useReducedMotion();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(() => istYmd());
  const [mealTab, setMealTab] = useState<MealSegment>(() => pickMealTabForDate(istYmd()));
  const [slot, setSlot] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Bumps on an interval so “past” chips refresh without navigation. */
  const [nowPulse, setNowPulse] = useState(0);

  const minD = useMemo(() => istYmd(), []);
  const maxD = useMemo(() => addDaysISTYmd(istYmd(), 60), []);

  useEffect(() => {
    const id = window.setInterval(() => setNowPulse((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setMealTab(pickMealTabForDate(date));
    setSlot("");
  }, [date]);

  const nowMin = useMemo(() => istNowMinutesFromMidnight(), [nowPulse, date]);

  useEffect(() => {
    if (!slot) return;
    const meta = ALL_BOOKING_SLOTS.find((s) => s.label === slot);
    if (!meta) return;
    const cur = istNowMinutesFromMidnight();
    if (isSlotInPastForSelectedDate(date, meta, cur)) setSlot("");
  }, [nowPulse, date, slot]);

  /** If today’s current section has no bookable slots but the other does, switch (IST clock). */
  useEffect(() => {
    if (date !== istYmd()) return;
    const curMin = istNowMinutesFromMidnight();
    const countEnabled = (slots: BookingSlotMeta[]) =>
      slots.filter((m) => !isSlotInPastForSelectedDate(date, m, curMin)).length;
    const cur = mealTab === "lunch" ? LUNCH_SLOTS : DINNER_SLOTS;
    const alt: MealSegment = mealTab === "lunch" ? "dinner" : "lunch";
    const other = alt === "lunch" ? LUNCH_SLOTS : DINNER_SLOTS;
    if (countEnabled(cur) > 0 || countEnabled(other) === 0) return;
    setMealTab(alt);
    setSlot("");
  }, [nowPulse, date, mealTab]);

  const visibleSlots = mealTab === "lunch" ? LUNCH_SLOTS : DINNER_SLOTS;

  const onConfirm = useCallback(async () => {
    trackEvent({ eventType: "BOOKING_CLICK", source: "book_page_reserve_button" });
    setError(null);
    setBusy(true);
    try {
      const result = await submitTableBooking({
        guestName: name,
        phone,
        date,
        slot,
        whatsappRaw,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.open(result.waUrl, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(false);
    }
  }, [name, phone, date, slot, whatsappRaw]);

  const enabledCount = useMemo(
    () => visibleSlots.filter((m) => !isSlotInPastForSelectedDate(date, m, nowMin)).length,
    [visibleSlots, date, nowMin],
  );

  const phoneOk = phone.length === 10 && /^\d{10}$/.test(phone);
  const canSubmit = name.trim().length >= 2 && phoneOk && date && slot;

  const setMeal = (t: MealSegment) => {
    setMealTab(t);
    setSlot("");
  };

  return (
    <div className="relative z-10 mx-auto w-full max-w-md px-4 pb-28 pt-3 sm:px-5 sm:pt-4">
      <Link
        href="/"
        className="mb-2 inline-flex min-h-[40px] items-center text-[13px] font-semibold tracking-wide text-ff-mint transition hover:text-ff-glow"
      >
        ← Back
      </Link>

      <motion.div
        className="text-center"
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-ff-mint/90">Reservations</p>
        <h1
          className="mt-2 font-[family-name:var(--font-display)] text-[clamp(2.15rem,10vw,3.15rem)] leading-[0.94] tracking-[0.04em] text-ff-glow uppercase"
          style={{ textShadow: "0 0 40px rgba(200,255,120,0.22)" }}
        >
          Save your spot
        </h1>
        <p className="mt-1 font-[family-name:var(--font-display)] text-[clamp(1.5rem,6.8vw,2.35rem)] leading-[0.98] tracking-[0.06em] text-white uppercase">
          before the bass drops
        </p>
        <p className="mx-auto mt-3 max-w-[20rem] text-[14px] font-semibold leading-snug tracking-wide text-white">
          Tollywood. Cocktails. Your crew. Tonight.
        </p>
        <p className="mx-auto mt-1 max-w-[18rem] text-[12px] font-medium leading-snug tracking-wide text-zinc-400">
          Weekends fill fast — lock a slot. One tap to confirm.
        </p>
      </motion.div>

      <div className="mt-5 space-y-3">
        <label className="block">
          <span className="mb-1 block text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
            Name
          </span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="min-h-[44px] w-full rounded-xl border border-zinc-600 bg-ff-deep/95 px-3.5 py-2.5 text-[16px] font-medium leading-normal text-white shadow-inner outline-none placeholder:text-zinc-400 focus:border-ff-glow/50 focus:ring-2 focus:ring-ff-glow/30"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
            Mobile · 10 digits
          </span>
          <input
            type="tel"
            name="phone"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(digitsOnlyMax10(e.target.value))}
            placeholder="Enter 10-digit number"
            className="min-h-[44px] w-full rounded-xl border border-zinc-600 bg-ff-deep/95 px-3.5 py-2.5 text-[16px] font-medium tabular-nums leading-normal text-white shadow-inner outline-none placeholder:text-zinc-400 focus:border-ff-glow/50 focus:ring-2 focus:ring-ff-glow/30"
          />
        </label>

        <div>
          <span className="mb-1 block text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
            Date
          </span>
          <BookingDatePicker value={date} onChange={setDate} minYmd={minD} maxYmd={maxD} />
        </div>

        <div>
          <span className="mb-1 block text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
            Lunch or dinner
          </span>
          <div
            className="grid grid-cols-2 gap-2 rounded-xl border border-zinc-500/60 bg-ff-void/80 p-1.5 shadow-inner"
            role="tablist"
            aria-label="Meal period"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mealTab === "lunch"}
              onClick={() => setMeal("lunch")}
              className={
                "flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-lg border px-1.5 py-2 text-center shadow-sm transition " +
                (mealTab === "lunch"
                  ? "border-ff-glow/60 bg-ff-glow/20 text-ff-glow ring-2 ring-ff-glow/30"
                  : "border-zinc-500 bg-ff-deep/90 text-zinc-100 hover:border-ff-glow/35 hover:bg-ff-deep hover:text-white")
              }
            >
              <IconSun className={`h-[18px] w-[18px] ${mealTab === "lunch" ? "text-ff-glow" : "text-ff-mint"}`} />
              <span className="text-[11px] font-bold tracking-wide">Lunch</span>
              <span
                className={
                  "text-[9px] font-semibold leading-tight tracking-wide " +
                  (mealTab === "lunch" ? "text-ff-mint/90" : "text-zinc-400")
                }
              >
                12 PM – 6 PM
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mealTab === "dinner"}
              onClick={() => setMeal("dinner")}
              className={
                "flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-lg border px-1.5 py-2 text-center shadow-sm transition " +
                (mealTab === "dinner"
                  ? "border-ff-glow/60 bg-ff-glow/20 text-ff-glow ring-2 ring-ff-glow/30"
                  : "border-zinc-500 bg-ff-deep/90 text-zinc-100 hover:border-ff-glow/35 hover:bg-ff-deep hover:text-white")
              }
            >
              <IconMoon className={`h-[18px] w-[18px] ${mealTab === "dinner" ? "text-ff-glow" : "text-ff-mint"}`} />
              <span className="text-[11px] font-bold tracking-wide">Dinner</span>
              <span
                className={
                  "text-[9px] font-semibold leading-tight tracking-wide " +
                  (mealTab === "dinner" ? "text-ff-mint/90" : "text-zinc-400")
                }
              >
                6:15 PM – 11:45 PM
              </span>
            </button>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex flex-col items-center gap-1 text-center sm:flex-row sm:flex-wrap sm:justify-between sm:text-left">
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-400">Time · 15 min</span>
            {date === istYmd() && enabledCount === 0 && (
              <span className="text-center text-[12px] font-medium leading-snug text-amber-200/95 sm:text-left">
                Nothing left today here — switch meal or pick tomorrow.
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {visibleSlots.map((meta) => {
              const past = isSlotInPastForSelectedDate(date, meta, nowMin);
              const on = slot === meta.label;
              return (
                <button
                  key={meta.label}
                  type="button"
                  disabled={past}
                  onClick={() => {
                    if (!past) setSlot(meta.label);
                  }}
                  className={
                    "min-h-[42px] rounded-lg border-2 px-1 py-1.5 text-center text-[12px] font-semibold leading-tight tracking-wide transition sm:min-h-[44px] sm:text-[13px] " +
                    (past
                      ? "cursor-not-allowed border-zinc-800 bg-ff-void/40 text-zinc-500 line-through"
                      : on
                        ? "border-ff-glow bg-ff-glow/25 text-ff-glow shadow-[0_0_16px_rgba(212,255,92,0.2)]"
                        : "border-zinc-500 bg-ff-deep/95 text-white shadow-sm active:scale-[0.98] hover:border-ff-glow/55 hover:bg-ff-deep")
                  }
                >
                  {meta.label.replace(" ", "\u00A0")}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-center text-[13px] font-medium leading-snug text-red-100">
            {error}
          </p>
        )}

        <motion.button
          type="button"
          disabled={!canSubmit || busy}
          onClick={() => void onConfirm()}
          className={canSubmit ? bookNowClayClassName : clayPillMutedClassName}
          whileTap={reduce || !canSubmit || busy ? undefined : { scale: 0.98 }}
        >
          {busy ? (
            <ClayPillLabel emoji="✨" label="Almost there…" muted={false} />
          ) : (
            <ClayPillLabel emoji="🥂" label="Reserve now" muted={!canSubmit} />
          )}
        </motion.button>

        <p className="text-center text-[10px] font-medium leading-snug tracking-wide text-zinc-500">
          Same line as Contact us · tweak the note before you send
        </p>
      </div>
    </div>
  );
}
