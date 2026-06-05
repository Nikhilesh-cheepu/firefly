export type HostChatMessage = {
  id: string;
  role: "user" | "host";
  text: string;
  at: string;
};

export type BookingFlow = "idle" | "collect_contact" | "done";

export function newMessageId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatChatTime(d = new Date()): string {
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

/** Pull a 10-digit Indian mobile and a name from free text. */
export function parseGuestContact(text: string): { name: string; phone: string } | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const digitsOnly = trimmed.replace(/\D/g, "");
  const ten = digitsOnly.match(/(\d{10})/);
  if (!ten) return null;
  const phone = ten[1]!;

  let namePart = trimmed;
  namePart = namePart.replace(phone, " ");
  namePart = namePart.replace(/\+91/gi, " ");
  namePart = namePart.replace(/\d/g, " ");
  namePart = namePart.replace(/[,;|]/g, " ");
  namePart = namePart.replace(/\b(name|naam|mobile|phone|no|number|mob)\b/gi, " ");
  namePart = namePart.replace(/\s+/g, " ").trim();

  if (namePart.length < 2) return null;
  const name = namePart.split(" ").slice(0, 4).join(" ");
  return { name, phone };
}

export function bookTablePrompt(): string {
  return "I'd like to book a table — can you help me?";
}

export function prizesOffersPrompt(): string {
  return "What prizes and offers do you have right now?";
}

export function askContactHostReply(): string {
  return "Perfect — share your name and 10-digit mobile in one message (e.g. Rahul 9876543210). I'll send your booking link right away.";
}

export function bookingLinkHostReply(name: string, bookUrl: string): string {
  return `Thanks ${name}! Book your table here: ${bookUrl}\n\nDon't forget to select any offers on the booking page if they're available — it only takes a second.`;
}

export function prizesOffersHostReply(offerTitles: string[]): string {
  if (offerTitles.length === 0) {
    return "We're lining up fresh offers — swipe the event posters above or ask our team on WhatsApp for what's live tonight. Happy to help you pick the best deal!";
  }
  const list = offerTitles.slice(0, 5).map((t) => `• ${t}`).join("\n");
  return `Here's what's on right now:\n${list}\n\nTap a poster above to reserve, or tell me if you'd like to book a table.`;
}

export function defaultHostGreeting(): string {
  return "I'm your friendly neighbourhood host — happy to help you plan the perfect night out. How may I assist you today?";
}
