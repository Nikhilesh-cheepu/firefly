"use client";

import type { ButtonHTMLAttributes } from "react";
import { trackEvent } from "@/lib/track-client";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  source?: string;
};

export function BassikMessageUsButton({
  source = "home_message_us",
  className,
  children = "Message us",
  onClick,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={
        className ??
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-white transition active:scale-[0.98]"
      }
      style={{
        background: "linear-gradient(135deg, #D97706, #92400e)",
        boxShadow: "0 0 20px rgba(217, 119, 6, 0.4), 0 8px 24px rgba(0, 0, 0, 0.35)",
      }}
      onClick={(e) => {
        trackEvent({ eventType: "BOOKING_CLICK", source });
        window.BassikChat?.open();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
