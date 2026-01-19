export const CATEGORIES = [
  "Music",
  "Movie",
  "Talent",
  "Sports",
  "Matches",
  "Drama & OTT",
  "Shows",
] as const;

export type CategoryKey = (typeof CATEGORIES)[number];
