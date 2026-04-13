// Polish medication name normalization. Strips diacritics, extracts strength
// and dosage form, and collapses tokens to a deterministic key suitable for
// exact + fuzzy matching. Form/strength are pulled OUT of the query so they
// don't contaminate name similarity (e.g. "500" matching every product).

const FORM_WORDS = [
  "tabletki", "tabletka", "tabl", "tab",
  "kapsulki", "kapsulka", "kaps",
  "syrop", "krople", "krem", "masc", "zel",
  "czopki", "plaster", "plastry",
  "roztwor", "zawiesina", "proszek", "granulat",
  "aerozol", "spray",
  "powlekane", "dojelitowe", "musujace",
] as const;

// Strength: number (with comma or dot) + unit. Polish labels use "j.m." for IU.
const STRENGTH_RE =
  /(\d+(?:[.,]\d+)?)\s?(mg|g|mcg|µg|ug|ml|j\.?\s?m\.?|iu|%)\b/iu;

export interface Normalized {
  raw: string;
  normalized: string;
  tokens: string[];
  strength?: string;
  form?: string;
}

export function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function canonicalUnit(unit: string): string {
  const u = unit.toLowerCase().replace(/[.\s]/g, "");
  if (u === "jm" || u === "iu") return "iu";
  if (u === "ug" || u === "µg") return "mcg";
  return u;
}

export function normalize(input: string): Normalized {
  const raw = input.trim();
  let working = stripDiacritics(raw.toLowerCase())
    .replace(/[^\p{L}\p{N}\s.,%-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  let strength: string | undefined;
  const sm = working.match(STRENGTH_RE);
  if (sm) {
    strength = `${sm[1].replace(",", ".")} ${canonicalUnit(sm[2])}`;
    working = working.replace(sm[0], " ").replace(/\s+/g, " ").trim();
  }

  let form: string | undefined;
  for (const f of FORM_WORDS) {
    const re = new RegExp(`\\b${f}\\w*`, "g");
    if (re.test(working)) {
      form ??= f; // remember the first match as the canonical form
      working = working.replace(re, " ").replace(/\s+/g, " ").trim();
    }
  }

  const tokens = working.split(" ").filter(Boolean);
  return {
    raw,
    normalized: tokens.join(" "),
    tokens,
    strength,
    form,
  };
}

export function normalizeKey(s: string): string {
  return stripDiacritics(s.toLowerCase())
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
