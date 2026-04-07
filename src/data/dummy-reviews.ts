export type DummyReview = {
  id: string;
  name: string;
  /** 4.7 – 5.0 */
  rating: number;
  quote: string;
};

/** Placeholder reviews for the home marquee — replace with real data later. */
export const DUMMY_REVIEWS: DummyReview[] = [
  {
    id: "r1",
    name: "Ananya K.",
    rating: 4.9,
    quote: "Best vibe in the city — sound system hits and the crowd actually dances.",
  },
  {
    id: "r2",
    name: "Rohit M.",
    rating: 4.8,
    quote: "Came for Tollywood night and stayed till close. Staff was on point.",
  },
  {
    id: "r3",
    name: "Sneha P.",
    rating: 5.0,
    quote: "Firefly feels premium without being stiff. Love the lighting and cocktails.",
  },
  {
    id: "r4",
    name: "Karthik V.",
    rating: 4.7,
    quote: "Solid food for a club. Wings and mocktails were better than expected.",
  },
  {
    id: "r5",
    name: "Divya R.",
    rating: 4.9,
    quote: "Booked a table for my birthday — seamless entry and great DJ set.",
  },
  {
    id: "r6",
    name: "Nikhil S.",
    rating: 4.8,
    quote: "Atmosphere is electric. Not too crowded on a weekday, which I liked.",
  },
  {
    id: "r7",
    name: "Meera L.",
    rating: 5.0,
    quote: "Finally a Telugu-forward club that doesn’t feel tacky. Classy neon energy.",
  },
  {
    id: "r8",
    name: "Arjun T.",
    rating: 4.7,
    quote: "Happy hour deals were legit. Will come back with the whole crew.",
  },
  {
    id: "r9",
    name: "Priya D.",
    rating: 4.9,
    quote: "Security was professional, restrooms clean — details matter and they nailed it.",
  },
  {
    id: "r10",
    name: "Harsha G.",
    rating: 4.8,
    quote: "From entry to last song, everything felt smooth. Five stars for the night.",
  },
];
