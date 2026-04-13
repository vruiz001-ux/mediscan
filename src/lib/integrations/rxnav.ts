// Integration with the NIH RxNav public API (https://rxnav.nlm.nih.gov).
// No API key is required. All calls are failure-tolerant: on timeout or
// non-2xx response (after one retry for 5xx) we return an empty result
// and log, so MediScan continues to work offline with local data only.

const BASE_URL = process.env.RXNAV_BASE_URL || "https://rxnav.nlm.nih.gov/REST";
const TIMEOUT_MS = 3000;
const MAX_RETRIES = 1;

// ---------- In-memory LRU (100 entries / 1h TTL) ----------
const LRU_MAX = 100;
const LRU_TTL = 60 * 60 * 1000;
const lru = new Map<string, { value: unknown; expiresAt: number }>();

function lruGet<T>(key: string): T | undefined {
  const hit = lru.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt < Date.now()) {
    lru.delete(key);
    return undefined;
  }
  // refresh recency
  lru.delete(key);
  lru.set(key, hit);
  return hit.value as T;
}

function lruSet<T>(key: string, value: T) {
  if (lru.size >= LRU_MAX) {
    const first = lru.keys().next().value;
    if (first !== undefined) lru.delete(first);
  }
  lru.set(key, { value, expiresAt: Date.now() + LRU_TTL });
}

// ---------- Token-bucket rate limiter (~20 req/s) ----------
const RATE = 20; // tokens per second
let tokens = RATE;
let lastRefill = Date.now();

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = (now - lastRefill) / 1000;
  tokens = Math.min(RATE, tokens + elapsed * RATE);
  lastRefill = now;
  if (tokens < 1) {
    const waitMs = Math.ceil(((1 - tokens) / RATE) * 1000);
    await new Promise((r) => setTimeout(r, waitMs));
    tokens = 0;
  } else {
    tokens -= 1;
  }
}

// ---------- fetch with timeout + one retry on 5xx ----------
async function fetchJson(url: string): Promise<unknown | null> {
  await rateLimit();
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(t);
      if (res.ok) return await res.json();
      if (res.status >= 500 && attempt < MAX_RETRIES) continue;
      console.warn(`[rxnav] ${res.status} ${url}`);
      return null;
    } catch (err) {
      clearTimeout(t);
      if (attempt < MAX_RETRIES) continue;
      console.warn(`[rxnav] fetch failed for ${url}:`, (err as Error).message);
      return null;
    }
  }
  return null;
}

function isEnabled(): boolean {
  return process.env.MEDISCAN_USE_RXNAV !== "false";
}

// ---------- Public API ----------

export type RxNavSuggestion = { name: string; rxcui: string; score: number };

export async function searchApproximate(q: string): Promise<RxNavSuggestion[]> {
  if (!isEnabled()) return [];
  const query = q.trim();
  if (query.length < 2) return [];
  const key = `rxnav:search:${query.toLowerCase()}`;
  const hit = lruGet<RxNavSuggestion[]>(key);
  if (hit) return hit;

  const url = `${BASE_URL}/approximateTerm.json?term=${encodeURIComponent(
    query,
  )}&maxEntries=10`;
  const data = (await fetchJson(url)) as
    | { approximateGroup?: { candidate?: Array<{ rxcui?: string; score?: string; rank?: string }> } }
    | null;
  const candidates = data?.approximateGroup?.candidate ?? [];

  // candidate rows from approximateTerm return rxcui + score, but not the
  // display name. We resolve unique rxcuis to their canonical name.
  const seen = new Set<string>();
  const uniq: Array<{ rxcui: string; score: number }> = [];
  for (const c of candidates) {
    if (!c.rxcui || seen.has(c.rxcui)) continue;
    seen.add(c.rxcui);
    uniq.push({ rxcui: c.rxcui, score: Number(c.score ?? 0) });
    if (uniq.length >= 10) break;
  }

  const suggestions: RxNavSuggestion[] = [];
  for (const c of uniq) {
    const name = await lookupRxcuiName(c.rxcui);
    if (name) suggestions.push({ name, rxcui: c.rxcui, score: c.score });
  }

  lruSet(key, suggestions);
  return suggestions;
}

async function lookupRxcuiName(rxcui: string): Promise<string | null> {
  const key = `rxnav:name:${rxcui}`;
  const hit = lruGet<string | null>(key);
  if (hit !== undefined) return hit;
  const url = `${BASE_URL}/rxcui/${encodeURIComponent(rxcui)}/property.json?propName=RxNorm%20Name`;
  const data = (await fetchJson(url)) as
    | { propConceptGroup?: { propConcept?: Array<{ propValue?: string }> } }
    | null;
  const name = data?.propConceptGroup?.propConcept?.[0]?.propValue ?? null;
  lruSet(key, name);
  return name;
}

// Returns lowercase ingredient names, e.g. ["ibuprofen"] or ["paracetamol","codeine"].
// Accepts either a free-text name (brand/generic) OR an rxcui string.
export async function resolveIngredients(nameOrRxcui: string): Promise<string[]> {
  if (!isEnabled()) return [];
  const input = nameOrRxcui.trim();
  if (!input) return [];
  const key = `rxnav:resolve:${input.toLowerCase()}`;
  const hit = lruGet<string[]>(key);
  if (hit) return hit;

  // Step 1: get an rxcui
  let rxcui = /^\d+$/.test(input) ? input : "";
  if (!rxcui) {
    const url = `${BASE_URL}/rxcui.json?name=${encodeURIComponent(input)}&search=2`;
    const data = (await fetchJson(url)) as
      | { idGroup?: { rxnormId?: string[] } }
      | null;
    rxcui = data?.idGroup?.rxnormId?.[0] ?? "";
  }
  if (!rxcui) {
    lruSet(key, []);
    return [];
  }

  // Step 2: rxcui → IN (ingredient) related concepts
  const relatedUrl = `${BASE_URL}/rxcui/${encodeURIComponent(rxcui)}/related.json?tty=IN`;
  const rel = (await fetchJson(relatedUrl)) as
    | {
        relatedGroup?: {
          conceptGroup?: Array<{
            tty?: string;
            conceptProperties?: Array<{ name?: string; rxcui?: string }>;
          }>;
        };
      }
    | null;
  const groups = rel?.relatedGroup?.conceptGroup ?? [];
  const ingredients: string[] = [];
  for (const g of groups) {
    if (g.tty !== "IN") continue;
    for (const cp of g.conceptProperties ?? []) {
      if (cp.name) ingredients.push(cp.name.toLowerCase());
    }
  }
  const deduped = Array.from(new Set(ingredients));
  lruSet(key, deduped);
  return deduped;
}

// Test-only: clear the LRU so fetch spies observe the first call
export function __clearLru() {
  lru.clear();
}

// Expose rxcui lookup for normalizationEngine (attach rxcui to MedicineEntry).
export async function resolveNameToRxcui(name: string): Promise<string | null> {
  if (!isEnabled()) return null;
  const input = name.trim();
  if (!input) return null;
  const url = `${BASE_URL}/rxcui.json?name=${encodeURIComponent(input)}&search=2`;
  const data = (await fetchJson(url)) as
    | { idGroup?: { rxnormId?: string[] } }
    | null;
  return data?.idGroup?.rxnormId?.[0] ?? null;
}
