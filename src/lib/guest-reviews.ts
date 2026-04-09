import { getPrisma } from "@/lib/db";

export type DisplayGuestReview = {
  id: string;
  name: string;
  rating: number;
  quote: string;
};

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
