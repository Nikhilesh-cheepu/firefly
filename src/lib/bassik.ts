export type BassikOffer = {
  id: string;
  imageUrl: string | null;
  title: string | null;
  description: string | null;
  eventDate: string | null;
  entryLabel: string | null;
  capacityText: string | null;
  endDate?: string | null;
};

function normalizeOffers(raw: unknown): BassikOffer[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((o) => {
      if (!o || typeof o !== "object") return null;
      const x = o as Record<string, unknown>;
      const id = typeof x.id === "string" ? x.id : null;
      if (!id) return null;
      return {
        id,
        imageUrl: typeof x.imageUrl === "string" ? x.imageUrl : null,
        title: typeof x.title === "string" ? x.title : null,
        description: typeof x.description === "string" ? x.description : null,
        eventDate: typeof x.eventDate === "string" ? x.eventDate : null,
        entryLabel: typeof x.entryLabel === "string" ? x.entryLabel : null,
        capacityText: typeof x.capacityText === "string" ? x.capacityText : null,
        endDate: typeof x.endDate === "string" ? x.endDate : null,
      };
    })
    .filter(Boolean) as BassikOffer[];
}

export async function getFireflyOffersFromBassik(): Promise<BassikOffer[]> {
  const base = process.env.BASSIK_BASE_URL?.replace(/\/$/, "");
  if (!base) return [];

  try {
    const res = await fetch(`${base}/api/venues/firefly`, {
      next: { revalidate: 30 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return [];

    const data = (await res.json()) as Record<string, unknown>;

    if (Array.isArray(data.offers)) return normalizeOffers(data.offers);

    const venue = data.venue;
    if (venue && typeof venue === "object") {
      const v = venue as Record<string, unknown>;
      if (Array.isArray(v.offers)) return normalizeOffers(v.offers);
    }

    return [];
  } catch {
    return [];
  }
}
