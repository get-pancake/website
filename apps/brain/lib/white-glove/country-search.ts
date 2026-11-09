import { COMMON_COUNTRIES, COUNTRIES, type Country } from "./countries";

/**
 * The country field's search (WgCountryField.tsx): what the list shows for
 * what the visitor typed. Pure, so it can be tested without a browser.
 *
 * Empty query: the most common countries first, then every other one,
 * alphabetically. Otherwise: names that start with the query, then names
 * with a word that starts with it ("kingdom" → United Kingdom), then names
 * that contain it; accents and case ignored ("cote" → Côte d’Ivoire). Common
 * short names also work ("uk", "usa", "uae", "holland").
 */

const ALIASES: Readonly<Record<string, Country>> = {
  us: "United States",
  usa: "United States",
  america: "United States",
  "united states of america": "United States",
  uk: "United Kingdom",
  england: "United Kingdom",
  scotland: "United Kingdom",
  wales: "United Kingdom",
  britain: "United Kingdom",
  "great britain": "United Kingdom",
  uae: "United Arab Emirates",
  emirates: "United Arab Emirates",
  dubai: "United Arab Emirates",
  holland: "Netherlands",
  "the netherlands": "Netherlands",
  korea: "South Korea",
  "czech republic": "Czechia",
  turkey: "Türkiye",
  "ivory coast": "Côte d’Ivoire",
  swiss: "Switzerland",
  deutschland: "Germany",
  espana: "Spain",
  italia: "Italy",
  suisse: "Switzerland",
  belgique: "Belgium",
};

/** Lowercase, no accents, no punctuation, single spaces. */
export function normalizeCountryQuery(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’'.,()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const NORMALIZED = new Map<Country, string>(COUNTRIES.map((c) => [c, normalizeCountryQuery(c)]));
const COMMON = new Set<Country>(COMMON_COUNTRIES);

/** The list with nothing typed: the common ones, then the rest, A to Z. */
export const DEFAULT_COUNTRY_LIST: readonly Country[] = [
  ...COMMON_COUNTRIES,
  ...COUNTRIES.filter((c) => !COMMON.has(c)),
];

/** The country a text names exactly (its name or a common short name), else null. */
export function resolveCountry(text: string): Country | null {
  const q = normalizeCountryQuery(text);
  if (!q) return null;
  for (const [country, name] of NORMALIZED) if (name === q) return country;
  return ALIASES[q] ?? null;
}

/** What the list shows for a query, best match first. */
export function searchCountries(text: string): readonly Country[] {
  const q = normalizeCountryQuery(text);
  if (!q) return DEFAULT_COUNTRY_LIST;
  const alias = ALIASES[q];
  const starts: Country[] = [];
  const wordStarts: Country[] = [];
  const contains: Country[] = [];
  for (const country of DEFAULT_COUNTRY_LIST) {
    const name = NORMALIZED.get(country)!;
    if (country === alias) continue;
    if (name.startsWith(q)) starts.push(country);
    else if (name.split(" ").some((word) => word.startsWith(q))) wordStarts.push(country);
    else if (name.includes(q)) contains.push(country);
  }
  return [...(alias ? [alias] : []), ...starts, ...wordStarts, ...contains];
}
