/** Bassik concierge embed — official script only; production default per integration spec. */
export const BASSIK_CHAT_BASE_URL =
  process.env.NEXT_PUBLIC_BASSIK_CHAT_BASE_URL?.trim() || "https://bassik.in";

export const bassikChatConfig = {
  brandId: "firefly",
  baseUrl: BASSIK_CHAT_BASE_URL,
  accentColor: "#D97706",
  topGap: 5,
  utmSource: "fireflyteluguclub",
  utmMedium: "website",
  autoMount: true,
  label: "Chat with Firefly",
} as const;

/** Inline bootstrap for `beforeInteractive` — must run before bassik-chat.js loads. */
export const BASSIK_CHAT_CONFIG_JS = `window.BassikChatConfig=${JSON.stringify(bassikChatConfig)};`;
