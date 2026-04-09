"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState, useTransition, type FormEvent } from "react";
import { submitGuestReview } from "@/app/reviews/actions";

const sheetTransition = { type: "spring" as const, stiffness: 420, damping: 38, mass: 0.9 };

type Props = {
  canSubmitReview: boolean;
};

export function WriteReviewSheet({ canSubmitReview }: Props) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const closeSheet = useCallback(() => {
    setOpen(false);
    setError(null);
    setDone(false);
    setAuthorName("");
    setBody("");
    setRating(5);
  }, []);

  if (!canSubmitReview) {
    return null;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitGuestReview({ authorName, rating, body });
      if (result.ok) {
        setDone(true);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-left text-sm font-medium text-ff-mint/95 underline decoration-ff-mint/35 underline-offset-4 transition hover:text-ff-glow hover:decoration-ff-glow/50"
      >
        Write a review
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
              aria-label="Close review form"
              onClick={closeSheet}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="write-review-title"
              className="relative z-10 w-full max-w-md rounded-t-2xl border border-ff-glow/20 border-b-0 bg-ff-void/98 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 ff-shadow-bar backdrop-blur-xl sm:rounded-2xl sm:border-b"
              initial={reduce ? undefined : { y: "100%" }}
              animate={reduce ? undefined : { y: 0 }}
              exit={reduce ? undefined : { y: "100%" }}
              transition={sheetTransition}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ff-mist/25 sm:hidden" aria-hidden />
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id="write-review-title" className="text-lg font-semibold text-white">
                  {done ? "Thank you" : "Share your night"}
                </h2>
                <button
                  type="button"
                  onClick={closeSheet}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-ff-mist transition hover:bg-white/5 hover:text-ff-glow"
                >
                  Close
                </button>
              </div>

              {done ? (
                <p className="pb-4 text-sm leading-relaxed text-ff-mist/88">
                  Thank you — we&apos;re glad you took a moment to share. It means a lot to the Firefly
                  crew.
                </p>
              ) : (
                <form onSubmit={onSubmit} className="flex flex-col gap-4 pb-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-ff-mist/55">
                      Rating
                    </p>
                    <div className="mt-2 flex gap-1" role="group" aria-label="Star rating">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          className={`min-h-[44px] min-w-[44px] rounded-lg text-xl transition ${
                            n <= rating ? "text-ff-glow" : "text-ff-mist/25"
                          }`}
                          aria-pressed={n <= rating}
                          aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-ff-mist/55">
                      Name
                    </span>
                    <input
                      name="authorName"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      autoComplete="name"
                      className="mt-2 w-full rounded-xl border border-ff-glow/15 bg-ff-deep/60 px-3 py-2.5 text-sm text-white placeholder:text-ff-mist/40 focus:border-ff-mint/40 focus:outline-none focus:ring-1 focus:ring-ff-mint/30"
                      placeholder="How you’d like to appear"
                      maxLength={80}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-ff-mist/55">
                      Your note
                    </span>
                    <textarea
                      name="body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={4}
                      className="mt-2 w-full resize-none rounded-xl border border-ff-glow/15 bg-ff-deep/60 px-3 py-2.5 text-sm text-white placeholder:text-ff-mist/40 focus:border-ff-mint/40 focus:outline-none focus:ring-1 focus:ring-ff-mint/30"
                      placeholder="What stood out about your visit?"
                      maxLength={500}
                      required
                    />
                    <span className="mt-1 block text-right text-[11px] tabular-nums text-ff-mist/45">
                      {body.length}/500
                    </span>
                  </label>

                  {error ? (
                    <p className="text-sm text-amber-200/90" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={pending}
                    className="min-h-[48px] rounded-xl bg-ff-glow px-4 text-sm font-semibold text-black transition hover:brightness-105 disabled:opacity-50"
                  >
                    {pending ? "Sending…" : "Send"}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
