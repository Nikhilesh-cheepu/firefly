"use client";

import { openBassikChat } from "@/lib/open-bassik-chat";
import { trackEvent } from "@/lib/track-client";

function ChatIcon() {
  return (
    <svg className="relative z-[1] h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

/** Small animated message bubble — opens official Bassik chat sheet. */
export function BassikChatFab() {
  return (
    <div
      className="pointer-events-none fixed z-[99999] flex flex-col items-center"
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "calc(5.75rem + env(safe-area-inset-bottom))",
      }}
    >
      <button
        type="button"
        aria-label="Chat with Firefly"
        className="ff-chat-fab-pulse ff-chat-fab-breathe pointer-events-auto relative flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-full border-0 text-white active:scale-95"
        style={{
          background: "linear-gradient(135deg, #D97706 0%, #92400e 100%)",
          boxShadow: "0 0 20px rgba(217, 119, 6, 0.45), 0 0 40px rgba(217, 119, 6, 0.2), 0 10px 32px rgba(0, 0, 0, 0.45)",
        }}
        onClick={() => {
          trackEvent({ eventType: "BOOKING_CLICK", source: "chat_fab" });
          openBassikChat();
        }}
      >
        <ChatIcon />
      </button>
    </div>
  );
}
