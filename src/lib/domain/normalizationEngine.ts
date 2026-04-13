// Normalize raw user input → MedicineEntry. Preserves optional dosage/frequency/etc.
//
// Two flavors:
//   - `normalizeEntry` / `normalizeEntries`           → synchronous, local-only
//   - `normalizeEntryWithRxNav` / `normalizeEntriesWithRxNav` → async, falls
//      back to the NIH RxNav API when local lookup misses.

import type { MedicineEntry } from "@/lib/types";
import { lookupDrug } from "./brandToMoleculeMap";
import { molecules } from "./drugDatabase";
import { resolveIngredients, resolveNameToRxcui } from "@/lib/integrations/rxnav";
import { cached, CACHE_TTL } from "@/lib/integrations/cache";

export type RawEntry = {
  inputName: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  reasonForUse?: string;
};

export function normalizeEntry(raw: RawEntry): MedicineEntry {
  const trimmed = raw.inputName.trim();
  const rec = lookupDrug(trimmed);
  if (rec) {
    return {
      inputName: trimmed,
      normalizedName: rec.displayName,
      activeMolecules: rec.activeMolecules.slice(),
      strength: raw.strength,
      dosage: raw.dosage,
      frequency: raw.frequency,
      route: raw.route,
      reasonForUse: raw.reasonForUse,
      resolved: true,
      source: "local",
    };
  }
  return {
    inputName: trimmed,
    normalizedName: trimmed,
    activeMolecules: [],
    strength: raw.strength,
    dosage: raw.dosage,
    frequency: raw.frequency,
    route: raw.route,
    reasonForUse: raw.reasonForUse,
    resolved: false,
    source: "unresolved",
  };
}

export function normalizeEntries(raws: RawEntry[]): MedicineEntry[] {
  return raws.map(normalizeEntry);
}

// Map an RxNorm ingredient name (e.g. "ibuprofen") back to a local molecule ID
// if we have one, so downstream rules can match. Tries direct key + alias.
function mapIngredientToLocalMoleculeId(name: string): string {
  const key = name.toLowerCase().trim();
  if (molecules[key]) return key;
  for (const m of Object.values(molecules)) {
    if (m.name.toLowerCase() === key) return m.id;
    if (m.aliases.some((a) => a.toLowerCase() === key)) return m.id;
  }
  return key; // fall back to raw ingredient name — pipeline will flag "limited data"
}

export async function normalizeEntryWithRxNav(raw: RawEntry): Promise<MedicineEntry> {
  const local = normalizeEntry(raw);
  if (local.resolved) return local;

  const trimmed = raw.inputName.trim();
  if (!trimmed) return local;

  try {
    const ingredients = await cached(
      `rxnav:resolve:${trimmed.toLowerCase()}`,
      CACHE_TTL.RESOLVE,
      () => resolveIngredients(trimmed),
    );
    if (ingredients.length > 0) {
      const rxcui = (await resolveNameToRxcui(trimmed)) ?? undefined;
      const moleculeIds = ingredients.map(mapIngredientToLocalMoleculeId);
      const displayNames = ingredients.map((n) => {
        const id = mapIngredientToLocalMoleculeId(n);
        return molecules[id]?.name ?? n.charAt(0).toUpperCase() + n.slice(1);
      });
      return {
        ...local,
        normalizedName: displayNames.join(" + "),
        activeMolecules: moleculeIds,
        resolved: true,
        source: "rxnav",
        rxcui,
      };
    }
  } catch (err) {
    console.warn("[normalize] RxNav fallback failed:", (err as Error).message);
  }
  return local;
}

export async function normalizeEntriesWithRxNav(
  raws: RawEntry[],
): Promise<MedicineEntry[]> {
  return Promise.all(raws.map(normalizeEntryWithRxNav));
}
