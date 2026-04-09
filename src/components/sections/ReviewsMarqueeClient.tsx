"use client";

import { useReducedMotion } from "framer-motion";
import type { DisplayGuestReview } from "@/lib/guest-reviews";

type Props = {
  reviews: DisplayGuestReview[];
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center justify-between gap-2"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      <span className="text-sm leading-none tracking-tight text-ff-glow" aria-hidden>
        ★★★★★
      </span>
      <span className="text-xs font-bold tabular-nums text-ff-mint">{rating.toFixed(1)}</span>
    </div>
  );
}

export function ReviewsMarqueeClient({ reviews }: Props) {
  const reduce = useReducedMotion();
  const loop = [...reviews, ...reviews];

  if (reduce) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.slice(0, 6).map((r) => (
          <article
            key={r.id}
            className="ff-card rounded-2xl border border-ff-glow/12 bg-ff-void/60 p-4 ring-1 ring-white/[0.03]"
          >
            <StarRow rating={r.rating} />
            <p className="mt-2 text-sm leading-relaxed text-ff-mist/90">&ldquo;{r.quote}&rdquo;</p>
            <p className="mt-3 text-xs font-medium text-ff-mist/60">— {r.name}</p>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="group/reviews relative overflow-hidden py-1">
      <div className="ff-reviews-track flex w-max gap-4 pr-4">
        {loop.map((r, idx) => (
          <article
            key={`${r.id}-${idx}`}
            className="ff-card w-[min(85vw,300px)] shrink-0 rounded-2xl border border-ff-glow/12 bg-ff-void/65 p-4 ring-1 ring-white/[0.03] backdrop-blur-sm"
          >
            <StarRow rating={r.rating} />
            <p className="mt-2 text-sm leading-relaxed text-ff-mist/90">&ldquo;{r.quote}&rdquo;</p>
            <p className="mt-3 text-xs font-medium text-ff-mist/60">— {r.name}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
