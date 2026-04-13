import { NextResponse } from "next/server";
import { searchDrugs, normalizeKey } from "@/lib/domain/brandToMoleculeMap";
import { searchApproximate } from "@/lib/integrations/rxnav";
import { cached, CACHE_TTL } from "@/lib/integrations/cache";
import { resolveIngredients } from "@/lib/integrations/rxnav";
import type { DrugRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

type SuggestItem = DrugRecord & { source?: "local" | "rxnav" };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ suggestions: [] });

  const local = searchDrugs(q, 10);
  const normQ = normalizeKey(q);
  const hasExact = local.some(
    (r) =>
      normalizeKey(r.displayName) === normQ ||
      r.brandAliases.some((a) => normalizeKey(a) === normQ),
  );

  // If we have ≥3 local results OR an exact match, skip RxNav entirely.
  if (local.length >= 3 || hasExact) {
    return NextResponse.json({
      suggestions: local.map<SuggestItem>((r) => ({ ...r, source: "local" })),
    });
  }

  // Cache the full merged suggestion list for 1 day.
  const cacheKey = `suggest:${q.toLowerCase()}`;
  const merged = await cached<SuggestItem[]>(cacheKey, CACHE_TTL.SEARCH, async () => {
    const rxnav = await searchApproximate(q);
    // Map RxNav suggestions → DrugRecord-ish. Ingredient resolution happens
    // only when the user picks one (via /api/normalize on submit), not here —
    // otherwise a single keystroke would fire N ingredient lookups.
    const rxItems: SuggestItem[] = rxnav.map((s) => ({
      id: `rxnav:${s.rxcui}`,
      displayName: s.name,
      kind: "generic",
      activeMolecules: [],
      brandAliases: [s.name],
      source: "rxnav",
    }));
    // Dedupe by normalized name — local wins.
    const seen = new Set<string>(local.map((r) => normalizeKey(r.displayName)));
    const out: SuggestItem[] = local.map((r) => ({ ...r, source: "local" }));
    for (const item of rxItems) {
      const k = normalizeKey(item.displayName);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(item);
      if (out.length >= 10) break;
    }
    return out;
  });

  return NextResponse.json({ suggestions: merged });
}

// Keep import used so tree-shaking doesn't drop it in dev; marked side-effect-free.
void resolveIngredients;
