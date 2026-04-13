// Polish medication resolver. Two-stage matcher:
//   1. deterministic exact lookup on product.nameNormalized + alias table
//   2. in-memory bigram fuzzy over a cached product+alias index
//
// Fuzzy search runs JS-side because SQLite has no pg_trgm. The index is
// built lazily and cached for INDEX_TTL_MS — works comfortably up to ~20k
// products. Beyond that, migrate to Postgres + pg_trgm GIN.

import { prisma } from "@/lib/db/client";
import { normalize, type Normalized } from "./normalize";
import { diceSimilarity } from "./fuzzy";
import type { IdentifyResult } from "./types";

const FUZZY_MIN = 0.75;
const AMBIGUITY_GAP = 0.05;
const INDEX_TTL_MS = 5 * 60 * 1000;

interface IndexEntry {
  productId: number;
  key: string;            // normalized name or alias
  isAlias: boolean;
}

let indexCache: { entries: IndexEntry[]; loadedAt: number } | null = null;

async function getIndex(): Promise<IndexEntry[]> {
  if (indexCache && Date.now() - indexCache.loadedAt < INDEX_TTL_MS) {
    return indexCache.entries;
  }
  const [products, aliases] = await Promise.all([
    prisma.plProduct.findMany({
      where: { withdrawnAt: null },
      select: { id: true, nameNormalized: true },
    }),
    prisma.plProductAlias.findMany({
      select: { productId: true, aliasNormalized: true },
    }),
  ]);
  const entries: IndexEntry[] = [
    ...products.map((p) => ({ productId: p.id, key: p.nameNormalized, isAlias: false })),
    ...aliases.map((a) => ({ productId: a.productId, key: a.aliasNormalized, isAlias: true })),
  ];
  indexCache = { entries, loadedAt: Date.now() };
  return entries;
}

export function invalidateIdentifyIndex(): void {
  indexCache = null;
}

async function loadProduct(productId: number) {
  return prisma.plProduct.findUnique({
    where: { id: productId },
    include: {
      substances: { include: { substance: true } },
    },
  });
}

async function exactMatch(n: Normalized): Promise<{ productId: number; score: number; via: "exact" | "alias" } | null> {
  if (!n.normalized) return null;
  const exact = await prisma.plProduct.findFirst({
    where: { nameNormalized: n.normalized, withdrawnAt: null },
    select: { id: true },
  });
  if (exact) return { productId: exact.id, score: 1, via: "exact" };

  const alias = await prisma.plProductAlias.findFirst({
    where: { aliasNormalized: n.normalized },
    select: { productId: true },
  });
  if (alias) return { productId: alias.productId, score: 0.98, via: "alias" };

  return null;
}

async function fuzzyMatch(n: Normalized): Promise<{ productId: number; score: number }[]> {
  if (!n.normalized) return [];
  const index = await getIndex();
  const seen = new Map<number, number>(); // best score per product
  for (const e of index) {
    const s = diceSimilarity(n.normalized, e.key);
    const prev = seen.get(e.productId) ?? 0;
    if (s > prev) seen.set(e.productId, s);
  }
  return Array.from(seen.entries())
    .map(([productId, score]) => ({ productId, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export async function identify(input: string): Promise<IdentifyResult> {
  const n = normalize(input);
  if (!n.normalized) {
    return missResponse(input, n, 0, "Empty input after normalization.", []);
  }

  const exact = await exactMatch(n);
  if (exact) {
    const product = await loadProduct(exact.productId);
    if (product) return buildHit(input, n, product, exact.score, exact.via);
  }

  const candidates = await fuzzyMatch(n);
  const [top, second] = candidates;

  if (!top || top.score < FUZZY_MIN) {
    const enriched = await enrichCandidates(candidates);
    return missResponse(input, n, top?.score ?? 0, "No confident match.", enriched);
  }

  if (second && top.score - second.score < AMBIGUITY_GAP) {
    const enriched = await enrichCandidates(candidates.slice(0, 3));
    return missResponse(input, n, top.score, "Ambiguous — multiple products scored similarly.", enriched);
  }

  const product = await loadProduct(top.productId);
  if (!product) return missResponse(input, n, 0, "Index/product mismatch.", []);
  return buildHit(input, n, product, top.score, "fuzzy");
}

async function enrichCandidates(rows: { productId: number; score: number }[]) {
  if (!rows.length) return [];
  const products = await prisma.plProduct.findMany({
    where: { id: { in: rows.map((r) => r.productId) } },
    select: { id: true, commercialName: true },
  });
  const byId = new Map(products.map((p) => [p.id, p.commercialName]));
  return rows
    .filter((r) => byId.has(r.productId))
    .map((r) => ({
      commercial_name: byId.get(r.productId)!,
      confidence_score: round2(r.score),
    }));
}

type ProductWithSubs = NonNullable<Awaited<ReturnType<typeof loadProduct>>>;

function buildHit(
  input: string,
  n: Normalized,
  product: ProductWithSubs,
  score: number,
  via: "exact" | "alias" | "fuzzy",
): IdentifyResult {
  const subs = product.substances.map((ps) => ps.substance);
  const isCombo = subs.length > 1;
  const base = {
    input_name: input,
    normalized_name: n.normalized,
    country: "Poland" as const,
    identified: true as const,
    commercial_name: product.commercialName,
    atc_code: subs[0]?.atcCode ?? "",
    dosage_form: n.form ?? product.dosageForm ?? "",
    strength: n.strength ?? product.strength ?? "",
    manufacturer: product.manufacturer ?? "",
    confidence_score: round2(score),
    matched_source: product.source ?? via,
    notes: "",
  };
  if (isCombo) {
    return { ...base, active_substances: subs.map((s) => s.inn) };
  }
  return { ...base, active_substance: subs[0]?.inn ?? "" };
}

function missResponse(
  input: string,
  n: Normalized,
  score: number,
  notes: string,
  candidates: { commercial_name: string; confidence_score: number }[],
): IdentifyResult {
  return {
    input_name: input,
    normalized_name: n.normalized,
    country: "Poland",
    identified: false,
    confidence_score: round2(score),
    matched_source: "",
    notes,
    candidates,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
