export const LEGAL_CATEGORIES = [
  "Droit de la famille / Divorce",
  "Droit du travail",
  "Droit des affaires",
  "Immobilier",
  "Pénal",
] as const;

export const CITIES = ["Casablanca", "Rabat", "Marrakech", "Tanger"] as const;

export type LegalCategory = (typeof LEGAL_CATEGORIES)[number];
export type City = (typeof CITIES)[number];
