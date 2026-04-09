import { getPrisma } from "@/lib/db";

export type DisplayGuestReview = {
  id: string;
  name: string;
  rating: number;
  quote: string;
};

/** Seeded / placeholder reviews first, then DB — skip duplicates (same name + quote) so `prisma db seed` doesn’t double them. */
export function mergeDisplayReviews(
  seeded: DisplayGuestReview[],
  fromDb: DisplayGuestReview[],
): DisplayGuestReview[] {
  const key = (r: DisplayGuestReview) =>
    `${r.name.trim().toLowerCase()}|${r.quote.trim()}`;
  const seen = new Set<string>();
  const out: DisplayGuestReview[] = [];
  for (const r of seeded) {
    const k = key(r);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  for (const r of fromDb) {
    const k = key(r);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

export async function getApprovedGuestReviews(): Promise<DisplayGuestReview[]> {
  const prisma = getPrisma();
  if (!prisma) return [];

  try {
    const rows = await prisma.guestReview.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.authorName,
      rating: r.rating,
      quote: r.body,
    }));
  } catch {
    return [];
  }
}
