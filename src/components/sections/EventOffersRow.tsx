"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { BassikOffer } from "@/lib/bassik";

type Props = {
  offers: BassikOffer[];
};

function formatOfferDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function EventOffersRow({ offers }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 pl-0.5 pr-0.5 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-5 md:pb-2 [&::-webkit-scrollbar]:hidden">
      {offers.map((offer, i) => {
        const dateLabel = formatOfferDate(offer.eventDate);
        return (
          <motion.article
            key={offer.id}
            className="group w-[min(78vw,260px)] shrink-0 snap-center sm:w-[min(42vw,260px)] md:w-[280px]"
            initial={reduce ? undefined : { opacity: 0, y: 26, scale: 0.97 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-52px 0px -64px 0px", amount: 0.06 }}
            transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            whileHover={reduce ? undefined : { y: -4 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            <div className="ff-card ff-card-interactive relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-ff-glow/18 bg-ff-deep ring-1 ring-white/[0.04]">
              {offer.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={offer.imageUrl}
                  alt={offer.title ?? "Event"}
                  className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-ff-forest text-sm text-ff-mist/50">
                  No poster
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ff-void via-ff-void/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                {dateLabel && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ff-mint">
                    {dateLabel}
                  </p>
                )}
                {offer.title && (
                  <h3 className="mt-1 line-clamp-2 font-semibold leading-snug text-white">
                    {offer.title}
                  </h3>
                )}
                {offer.entryLabel && (
                  <p className="mt-1 text-xs text-ff-mist/90">{offer.entryLabel}</p>
                )}
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
