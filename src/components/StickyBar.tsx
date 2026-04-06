"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { telHrefFromInput, waMeHrefFromInput } from "@/lib/indian-phone";
import type { SiteSettingsDTO } from "@/lib/site-data";

type Props = {
  settings: SiteSettingsDTO;
};

const spring = { type: "spring" as const, stiffness: 400, damping: 26 };

function IconPhone({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V21a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.24 1.01l-2.2 2.2z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconMap({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
        fill="currentColor"
      />
    </svg>
  );
}

type SheetAction = {
  key: string;
  href: string;
  label: string;
  external?: boolean;
  icon: ReactNode;
};

function buildSheetActions(settings: SiteSettingsDTO): SheetAction[] {
  const tel = telHrefFromInput(settings.phone);
  const wa = waMeHrefFromInput(settings.whatsapp);

  const rows: SheetAction[] = [];
  if (tel) {
    rows.push({
      key: "phone",
      href: tel,
      label: "Call",
      icon: <IconPhone className="text-ff-glow" />,
    });
  }
  if (wa) {
    rows.push({
      key: "wa",
      href: wa,
      label: "WhatsApp",
      external: true,
      icon: <IconWhatsApp className="text-ff-glow" />,
    });
  }
  if (settings.instagram) {
    rows.push({
      key: "ig",
      href: settings.instagram,
      label: "Instagram",
      external: true,
      icon: <IconInstagram className="text-ff-glow" />,
    });
  }
  if (settings.mapsUrl) {
    rows.push({
      key: "map",
      href: settings.mapsUrl,
      label: "Location",
      external: true,
      icon: <IconMap className="text-ff-glow" />,
    });
  }
  if (settings.contactEmail) {
    const em = settings.contactEmail.trim();
    if (em) {
      rows.push({
        key: "email",
        href: `mailto:${em}`,
        label: "Email",
        icon: <IconMail className="text-ff-glow" />,
      });
    }
  }
  return rows;
}

export function StickyBar({ settings }: Props) {
  const reduce = useReducedMotion();
  const [sheetOpen, setSheetOpen] = useState(false);

  const sheetActions = useMemo(() => buildSheetActions(settings), [settings]);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sheetOpen, closeSheet]);

  const tap = reduce ? undefined : { scale: 0.96 };
  const hover = reduce ? undefined : { y: -1 };

  const sheetTransition = reduce
    ? { duration: 0.2 }
    : { type: "spring" as const, stiffness: 420, damping: 34 };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(0.5rem,env(safe-area-inset-bottom))] px-2">
        <motion.nav
          className="pointer-events-auto w-full max-w-md rounded-[1.35rem] border border-ff-glow/22 bg-ff-void/92 px-2.5 py-2.5 ff-shadow-bar backdrop-blur-xl backdrop-saturate-150 sm:px-3"
          initial={reduce ? undefined : { y: 24, opacity: 0 }}
          animate={reduce ? undefined : { y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          aria-label="Quick actions"
        >
          <div className="flex items-stretch gap-2">
            <motion.div
              className="min-w-0 flex-1"
              whileHover={hover}
              whileTap={tap}
              transition={spring}
            >
              <Link
                href={settings.bookTableUrl ?? "#book"}
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-ff-glow to-ff-glow-dim px-4 py-2.5 text-sm font-semibold text-ff-void ff-shadow-primary"
              >
                Book table
              </Link>
            </motion.div>
            <motion.button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-xl border border-ff-mint/28 bg-ff-deep/90 px-3 text-[13px] font-semibold leading-tight text-ff-glow ff-shadow-soft transition-colors hover:border-ff-glow/35 hover:bg-ff-forest/90 sm:px-4 sm:text-sm"
              whileHover={hover}
              whileTap={tap}
              transition={spring}
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
            >
              Contact us
            </motion.button>
          </div>
        </motion.nav>
      </div>

      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
              aria-label="Close Contact us"
              onClick={closeSheet}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-sheet-title"
              className="relative z-10 w-full max-w-md rounded-t-2xl border border-ff-glow/20 border-b-0 bg-ff-void/98 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 ff-shadow-bar backdrop-blur-xl"
              initial={reduce ? { y: "100%" } : { y: "105%" }}
              animate={{ y: 0 }}
              exit={reduce ? { y: "100%" } : { y: "105%" }}
              transition={sheetTransition}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ff-mist/25" aria-hidden />
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id="contact-sheet-title" className="text-lg font-semibold text-white">
                  Contact us
                </h2>
                <button
                  type="button"
                  onClick={closeSheet}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-ff-mist transition hover:bg-white/5 hover:text-ff-glow"
                >
                  Close
                </button>
              </div>
              {sheetActions.length === 0 ? (
                <p className="pb-4 text-center text-sm leading-relaxed text-ff-mist/85">
                  For reservations, use <span className="text-ff-mint">Book table</span>. Other ways to reach us
                  will be added here soon.
                </p>
              ) : (
                <ul className="flex flex-col gap-2 pb-1">
                  {sheetActions.map((a) => (
                    <li key={a.key}>
                      <motion.a
                        href={a.href}
                        {...(a.external
                          ? { target: "_blank" as const, rel: "noopener noreferrer" }
                          : {})}
                        className="flex min-h-[52px] items-center gap-3 rounded-xl border border-ff-glow/15 bg-ff-deep/80 px-4 py-3 text-left text-base font-medium text-ff-mist transition hover:border-ff-glow/30 hover:bg-ff-forest/50 hover:text-white"
                        whileTap={reduce ? undefined : { scale: 0.99 }}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ff-void/80">
                          {a.icon}
                        </span>
                        {a.label}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
