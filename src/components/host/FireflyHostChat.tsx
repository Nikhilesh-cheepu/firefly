"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BassikOffer } from "@/lib/bassik";
import {
  askContactHostReply,
  bookTablePrompt,
  bookingLinkHostReply,
  defaultHostGreeting,
  formatChatTime,
  newMessageId,
  parseGuestContact,
  prizesOffersHostReply,
  prizesOffersPrompt,
  type BookingFlow,
  type HostChatMessage,
} from "@/lib/host-chat-logic";
import { telHrefFromInput, waMeHrefFromInput } from "@/lib/indian-phone";
import type { SiteSettingsDTO } from "@/lib/site-data";
import { saveHostChatLead } from "@/app/host-chat/actions";
import { getAnalyticsSessionId, trackEvent } from "@/lib/track-client";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";

type Props = {
  settings: SiteSettingsDTO;
  offers: BassikOffer[];
};

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function formatOfferDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

function renderHostText(text: string, bookUrl: string) {
  const escaped = bookUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(https?:\\/\\/[^\\s]+|${escaped}|/book\\b)`));
  return parts.map((part, i) => {
    if (!part) return null;
    if (part === "/book" || part === bookUrl || /^https?:\/\//i.test(part)) {
      const href = part.startsWith("http") ? part : bookUrl.startsWith("http") ? bookUrl : bookUrl;
      return (
        <Link key={i} href={href} className="font-semibold text-ff-glow underline underline-offset-2">
          Book your table
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function FireflyHostChat({ settings, offers }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [bookingFlow, setBookingFlow] = useState<BookingFlow>("idle");
  const [isHostTyping, setIsHostTyping] = useState(false);
  const [messages, setMessages] = useState<HostChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hostTypingRef = useRef(false);

  const tel = telHrefFromInput(settings.phone);
  const wa = waMeHrefFromInput(settings.whatsapp);
  const maps = settings.mapsUrl?.trim() || null;
  const rawBook = settings.bookTableUrl?.trim() || "/book";
  const resolvedBookUrl = /^https?:\/\//i.test(rawBook)
    ? rawBook
    : rawBook.startsWith("/")
      ? rawBook
      : `/${rawBook}`;

  const offerTitles = useMemo(
    () => offers.map((o) => o.title).filter((t): t is string => Boolean(t?.trim())),
    [offers],
  );

  useBodyScrollLock(open);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isHostTyping, scrollToBottom]);

  const addUserMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: newMessageId(), role: "user", text, at: formatChatTime() },
    ]);
  }, []);

  const addHostMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: newMessageId(), role: "host", text, at: formatChatTime() },
    ]);
  }, []);

  const replyAsHost = useCallback(
    async (text: string, delayMs = 550) => {
      if (hostTypingRef.current) return;
      hostTypingRef.current = true;
      setIsHostTyping(true);
      await sleep(delayMs);
      setIsHostTyping(false);
      hostTypingRef.current = false;
      addHostMessage(text);
    },
    [addHostMessage],
  );

  const startBookTableFlow = useCallback(() => {
    addUserMessage(bookTablePrompt());
    setBookingFlow("collect_contact");
    trackEvent({ eventType: "BOOKING_CLICK", source: "host_chat_book_table" });
    void replyAsHost(askContactHostReply(), 480);
  }, [addUserMessage, replyAsHost]);

  const onPrizesOffers = useCallback(() => {
    addUserMessage(prizesOffersPrompt());
    trackEvent({ eventType: "BOOKING_CLICK", source: "host_chat_prizes_offers" });
    void replyAsHost(prizesOffersHostReply(offerTitles), 520);
  }, [addUserMessage, offerTitles, replyAsHost]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isHostTyping) return;
    setInput("");
    addUserMessage(text);

    if (bookingFlow === "collect_contact") {
      const contact = parseGuestContact(text);
      if (contact) {
        setBookingFlow("done");
        void saveHostChatLead({
          guestName: contact.name,
          phone: contact.phone,
          source: "host_chat_book_table",
          sessionId: getAnalyticsSessionId(),
        });
        const reply = bookingLinkHostReply(contact.name, resolvedBookUrl);
        await replyAsHost(reply, 420);
        trackEvent({
          eventType: "BOOKING_CLICK",
          source: "host_chat_contact_captured",
          meta: { hasPhone: true },
        });
      } else {
        await replyAsHost(
          "Almost there — please send your name and a 10-digit mobile in one line (e.g. Priya 9123456789).",
          380,
        );
      }
      return;
    }

    const bookIntent = /\b(book|table|reservation|reserve)\b/i.test(text);
    if (bookIntent && bookingFlow === "idle") {
      setBookingFlow("collect_contact");
      await replyAsHost(askContactHostReply(), 450);
      return;
    }

    const offerIntent = /\b(offer|prize|pricing|deal|discount|promo)\b/i.test(text);
    if (offerIntent) {
      await replyAsHost(prizesOffersHostReply(offerTitles), 500);
      return;
    }

    await replyAsHost(
      "Thanks for reaching out! Use the quick buttons for call, WhatsApp, or directions — or say \"book a table\" and I'll send your booking link.",
      600,
    );
  }, [
    addUserMessage,
    bookingFlow,
    input,
    isHostTyping,
    offerTitles,
    replyAsHost,
    resolvedBookUrl,
  ]);

  const quickPill =
    "rounded-full border border-ff-mint/35 bg-ff-void/50 px-3 py-1.5 text-xs font-medium text-ff-mist transition hover:border-ff-glow/45 hover:text-white";

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-4 z-[99990] flex h-14 w-14 items-center justify-center rounded-full border border-ff-glow/35 bg-gradient-to-br from-ff-violet/80 to-[#3f39b5] text-white shadow-[0_8px_32px_rgba(107,92,255,0.35)] transition hover:scale-105 active:scale-95 sm:bottom-28 sm:h-auto sm:w-auto sm:rounded-full sm:px-4 sm:py-3"
          style={{ bottom: "max(6.5rem, calc(5.5rem + env(safe-area-inset-bottom)))" }}
          aria-label="Chat with Firefly host"
        >
          <span className="hidden sm:inline text-sm font-semibold">Chat with us</span>
          <svg className="sm:ml-0 h-6 w-6 sm:hidden" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[99999] flex flex-col bg-[#050a14]/98 backdrop-blur-md">
          <header className="flex shrink-0 items-center justify-between border-b border-ff-glow/15 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl tracking-wide text-ff-mint">FIREFLY</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ff-mist/75">
                <span className="h-2 w-2 rounded-full bg-ff-glow shadow-[0_0_8px_rgba(200,255,120,0.8)]" />
                Live now
              </p>
            </div>
            <div className="flex items-center gap-2">
              {tel ? (
                <a
                  href={tel}
                  onClick={() => trackEvent({ eventType: "CALL_CLICK", source: "host_chat_header" })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ff-mint/30 text-ff-mint"
                  aria-label="Call Firefly"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.57 1 1 0 011 1V21a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.6 1 1 0 01-.24 1l-2.2 2.2z" />
                  </svg>
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ff-mist/25 text-ff-mist"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ff-mist/50">Dear guest</p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-white">Welcome to Firefly</h2>
            <p className="mt-2 text-sm leading-relaxed text-ff-mist/85">{defaultHostGreeting()}</p>

            <p className="mt-5 text-xs text-ff-mist/65">
              Need something fast? Tap below — call, directions, explore, menu, prizes, or book a table.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tel ? (
                <a href={tel} className={quickPill} onClick={() => trackEvent({ eventType: "CALL_CLICK", source: "host_chat_quick" })}>
                  Call us
                </a>
              ) : null}
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={quickPill + " border-ff-glow/40 text-ff-glow"}
                  onClick={() => trackEvent({ eventType: "WHATSAPP_CLICK", source: "host_chat_quick" })}
                >
                  WhatsApp
                </a>
              ) : null}
              {maps ? (
                <a
                  href={maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={quickPill}
                  onClick={() => trackEvent({ eventType: "LOCATION_CLICK", source: "host_chat_quick" })}
                >
                  Directions
                </a>
              ) : null}
              <Link href="/#events" className={quickPill} onClick={() => setOpen(false)}>
                Explore the website
              </Link>
              <Link href="/#menu" className={quickPill} onClick={() => setOpen(false)}>
                View menu
              </Link>
              <button type="button" className={quickPill} onClick={onPrizesOffers}>
                Prizes &amp; offers
              </button>
            </div>

            <button
              type="button"
              onClick={startBookTableFlow}
              className="mt-3 w-full rounded-full bg-gradient-to-r from-[#5b7cfa] via-ff-violet to-[#7c5cff] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(91,124,250,0.35)] transition hover:brightness-110"
            >
              Book a table
            </button>

            {offers.length > 0 ? (
              <div className="mt-6">
                <p className="text-xs text-ff-mist/65">
                  Book any event here — tap a poster or swipe for more.
                </p>
                <div className="mt-2 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {offers.map((o) => {
                    const date = formatOfferDate(o.eventDate);
                    return (
                      <a
                        key={o.id}
                        href={resolvedBookUrl.startsWith("http") ? resolvedBookUrl : resolvedBookUrl}
                        className="w-[7.5rem] shrink-0 snap-start overflow-hidden rounded-xl border border-ff-glow/20 bg-ff-deep/60"
                        onClick={() => {
                          trackEvent({ eventType: "BOOKING_CLICK", source: "host_chat_event_poster" });
                          setOpen(false);
                        }}
                      >
                        {o.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={o.imageUrl} alt="" className="aspect-[3/4] w-full object-cover" />
                        ) : (
                          <div className="flex aspect-[3/4] items-center justify-center bg-ff-void/80 px-2 text-center text-[10px] text-ff-mist">
                            {o.title ?? "Event"}
                          </div>
                        )}
                        <div className="px-2 py-1.5">
                          <p className="truncate text-[10px] font-semibold text-white">{o.title ?? "Event"}</p>
                          {date ? <p className="text-[9px] text-ff-mist/70">{date}</p> : null}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <p className="mt-6 text-xs text-ff-mist/60">
              Or type below — ask about a table, party size, date, or offers.
            </p>

            <div className="mt-4 space-y-3">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-br-md bg-gradient-to-r from-[#5b7cfa] to-ff-violet px-4 py-2.5 text-sm text-white">
                      {m.text}
                      <p className="mt-1 text-right text-[10px] text-white/65">{m.at}</p>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex justify-start">
                    <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-ff-glow/12 bg-ff-deep/70 px-4 py-2.5 text-sm leading-relaxed text-ff-mist/95">
                      <p className="whitespace-pre-wrap">{renderHostText(m.text, resolvedBookUrl)}</p>
                      <p className="mt-1 text-[10px] text-ff-mist/55">{m.at}</p>
                    </div>
                  </div>
                ),
              )}

              {isHostTyping ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-ff-glow/12 bg-ff-deep/50 px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-ff-mint/70 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-ff-mint/70 [animation-delay:120ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-ff-mint/70 [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 border-t border-ff-glow/12 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question here…"
                className="min-h-[44px] flex-1 rounded-full border border-ff-mint/25 bg-ff-void/80 px-4 text-sm text-white placeholder:text-ff-mist/45 outline-none focus:border-ff-glow/45"
                disabled={isHostTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isHostTyping}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-ff-glow to-ff-mint text-ff-void disabled:opacity-40"
                aria-label="Send message"
              >
                ↑
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
