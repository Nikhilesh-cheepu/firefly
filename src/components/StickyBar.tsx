"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { SiteSettingsDTO } from "@/lib/site-data";

type Props = {
  settings: SiteSettingsDTO;
};

function waHref(n: string | null) {
  if (!n) return null;
  if (n.startsWith("http")) return n;
  const digits = n.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

const spring = { type: "spring" as const, stiffness: 400, damping: 26 };

export function StickyBar({ settings }: Props) {
  const reduce = useReducedMotion();
  const wa = waHref(settings.whatsapp);
  const tel = settings.phone
    ? settings.phone.startsWith("tel:")
      ? settings.phone
      : `tel:${settings.phone.replace(/\s/g, "")}`
    : null;

  const tap = reduce ? undefined : { scale: 0.96 };
  const hover = reduce ? undefined : { y: -1 };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3">
      <motion.nav
        className="pointer-events-auto flex max-w-lg flex-wrap items-center justify-center gap-2 rounded-[1.35rem] border border-ff-glow/22 bg-ff-void/88 px-3 py-2.5 ff-shadow-bar backdrop-blur-xl backdrop-saturate-150"
        initial={reduce ? undefined : { y: 24, opacity: 0 }}
        animate={reduce ? undefined : { y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        aria-label="Quick actions"
      >
        <motion.div whileHover={hover} whileTap={tap} transition={spring}>
          <Link
            href={settings.bookTableUrl ?? "#book"}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-ff-glow to-ff-glow-dim px-5 py-2.5 text-sm font-semibold text-ff-void ff-shadow-primary"
          >
            Book table
          </Link>
        </motion.div>
        {tel && (
          <motion.a
            href={tel}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-ff-mint/22 bg-ff-deep/85 px-3.5 py-2 text-xs font-medium text-ff-mist ff-shadow-soft transition-colors hover:border-ff-glow/35 hover:bg-ff-forest/90"
            whileHover={hover}
            whileTap={tap}
            transition={spring}
          >
            Call
          </motion.a>
        )}
        {wa && (
          <motion.a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-ff-mint/22 bg-ff-deep/85 px-3.5 py-2 text-xs font-medium text-ff-mist ff-shadow-soft transition-colors hover:border-ff-glow/35 hover:bg-ff-forest/90"
            whileHover={hover}
            whileTap={tap}
            transition={spring}
          >
            WhatsApp
          </motion.a>
        )}
        {settings.instagram && (
          <motion.a
            href={settings.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-ff-mint/22 bg-ff-deep/85 px-3.5 py-2 text-xs font-medium text-ff-mist ff-shadow-soft transition-colors hover:border-ff-glow/35 hover:bg-ff-forest/90"
            whileHover={hover}
            whileTap={tap}
            transition={spring}
          >
            Instagram
          </motion.a>
        )}
        {settings.mapsUrl && (
          <motion.a
            href={settings.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-ff-mint/22 bg-ff-deep/85 px-3.5 py-2 text-xs font-medium text-ff-mist ff-shadow-soft transition-colors hover:border-ff-glow/35 hover:bg-ff-forest/90"
            whileHover={hover}
            whileTap={tap}
            transition={spring}
          >
            Location
          </motion.a>
        )}
      </motion.nav>
    </div>
  );
}
