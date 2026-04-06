/**
 * Normalizes phone input for India (+91): admin can paste a 10-digit mobile without country code.
 * Returns digits only (no +), suitable for wa.me/NUMBER and tel:+NUMBER.
 */
export function normalizeIndianPhoneDigits(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    const rest = digits.slice(1);
    if (rest.length === 10) return `91${rest}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  if (digits.length >= 10 && digits.length <= 15) {
    return digits;
  }

  return null;
}

export function waMeHrefFromInput(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  const d = normalizeIndianPhoneDigits(t);
  if (!d) return null;
  return `https://wa.me/${d}`;
}

export function telHrefFromInput(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (t.startsWith("tel:")) return t;
  const d = normalizeIndianPhoneDigits(t);
  if (!d) return null;
  return `tel:+${d}`;
}
