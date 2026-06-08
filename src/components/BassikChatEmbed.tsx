import Script from "next/script";
import { BASSIK_CHAT_BASE_URL, BASSIK_CHAT_CONFIG_JS } from "@/lib/bassik-chat-config";

/** Site-wide Bassik concierge — popup sheet; guest stays on fireflyteluguclub.com. */
export function BassikChatEmbed() {
  return (
    <>
      <Script id="bassik-chat-config" strategy="beforeInteractive">
        {BASSIK_CHAT_CONFIG_JS}
      </Script>
      <Script
        id="bassik-chat-embed"
        src={`${BASSIK_CHAT_BASE_URL}/embed/bassik-chat.js`}
        strategy="afterInteractive"
      />
    </>
  );
}
