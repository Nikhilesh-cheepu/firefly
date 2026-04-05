"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { BassikOffer } from "@/lib/bassik";

type Props = {
  offers: BassikOffer[];
  formatDate: (iso: string | null) => string | null;
};

export function EventOffersRow({ offers, formatDate }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-1 pr-1 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-6 md:pb-4 [&::-webkit-scrollbar]:hidden">
      {offers.map((offer, i) => (
        <motion.article
          key={offer.id}
          className="group w-[min(78vw,260px)] shrink-0 snap-center sm:w-[min(42vw,260px)] md:w-[280px]"
          initial={reduce ? undefined : { opacity: 0, y: 20, scale: 0.98 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
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
              {formatDate(offer.eventDate) && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ff-mint">
                  {formatDate(offer.eventDate)}
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
      ))}
    </div>
  );
}
