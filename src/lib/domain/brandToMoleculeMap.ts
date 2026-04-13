// Brand / alias → molecule IDs. Sources: manufacturer labels, national formularies.
// NOTE: demo ruleset; real deployments must use curated datasets (RxNorm, DM+D, ATC).

import type { DrugRecord } from "@/lib/types";
import { molecules } from "./drugDatabase";

export const drugRecords: DrugRecord[] = [
  // Generics
  ...Object.values(molecules).map<DrugRecord>((m) => ({
    id: m.id,
    displayName: m.name,
    kind: "generic",
    activeMolecules: [m.id],
    brandAliases: [m.name, ...m.aliases],
  })),

  // Brands (single-molecule)
  { id: "doliprane", displayName: "Doliprane", kind: "brand", activeMolecules: ["paracetamol"], brandAliases: ["Doliprane"] },
  { id: "tylenol", displayName: "Tylenol", kind: "brand", activeMolecules: ["paracetamol"], brandAliases: ["Tylenol"] },
  { id: "advil", displayName: "Advil", kind: "brand", activeMolecules: ["ibuprofen"], brandAliases: ["Advil"] },
  { id: "nurofen", displayName: "Nurofen", kind: "brand", activeMolecules: ["ibuprofen"], brandAliases: ["Nurofen"] },
  { id: "brufen", displayName: "Brufen", kind: "brand", activeMolecules: ["ibuprofen"], brandAliases: ["Brufen"] },
  { id: "aspegic", displayName: "Aspegic", kind: "brand", activeMolecules: ["aspirin"], brandAliases: ["Aspegic"] },
  { id: "zoloft", displayName: "Zoloft", kind: "brand", activeMolecules: ["sertraline"], brandAliases: ["Zoloft"] },
  { id: "prozac", displayName: "Prozac", kind: "brand", activeMolecules: ["fluoxetine"], brandAliases: ["Prozac"] },
  { id: "lipitor", displayName: "Lipitor", kind: "brand", activeMolecules: ["atorvastatin"], brandAliases: ["Lipitor"] },
  { id: "zocor", displayName: "Zocor", kind: "brand", activeMolecules: ["simvastatin"], brandAliases: ["Zocor"] },
  { id: "prilosec", displayName: "Prilosec", kind: "brand", activeMolecules: ["omeprazole"], brandAliases: ["Prilosec"] },
  { id: "losec", displayName: "Losec", kind: "brand", activeMolecules: ["omeprazole"], brandAliases: ["Losec"] },
  { id: "glucophage", displayName: "Glucophage", kind: "brand", activeMolecules: ["metformin"], brandAliases: ["Glucophage"] },
  { id: "coumadin", displayName: "Coumadin", kind: "brand", activeMolecules: ["warfarin"], brandAliases: ["Coumadin"] },
  { id: "valium", displayName: "Valium", kind: "brand", activeMolecules: ["diazepam"], brandAliases: ["Valium"] },
  { id: "eliquis", displayName: "Eliquis", kind: "brand", activeMolecules: ["apixaban"], brandAliases: ["Eliquis"] },
  { id: "biaxin", displayName: "Biaxin", kind: "brand", activeMolecules: ["clarithromycin"], brandAliases: ["Biaxin"] },
  { id: "amoxil", displayName: "Amoxil", kind: "brand", activeMolecules: ["amoxicillin"], brandAliases: ["Amoxil"] },
  { id: "ultram", displayName: "Ultram", kind: "brand", activeMolecules: ["tramadol"], brandAliases: ["Ultram"] },

  // Combinations
  {
    id: "co-codamol",
    displayName: "Co-codamol",
    kind: "combination",
    activeMolecules: ["paracetamol", "codeine"],
    brandAliases: ["Co-codamol", "co codamol", "cocodamol"],
  },
  {
    id: "panadol-extra",
    displayName: "Panadol Extra",
    kind: "combination",
    activeMolecules: ["paracetamol", "caffeine"],
    brandAliases: ["Panadol Extra", "Panadol"],
  },
  {
    id: "augmentin",
    displayName: "Augmentin",
    kind: "combination",
    activeMolecules: ["amoxicillin", "clavulanate"],
    brandAliases: ["Augmentin"],
  },
];

// Lookup: any alias (lowercased, stripped) → DrugRecord
const lookup: Map<string, DrugRecord> = new Map();
for (const rec of drugRecords) {
  const names = new Set<string>([
    rec.id,
    rec.displayName,
    ...rec.brandAliases,
    ...rec.activeMolecules,
  ]);
  for (const n of names) {
    const k = normalizeKey(n);
    if (!k || lookup.has(k)) continue;
    lookup.set(k, rec);
  }
  // Only single-ingredient records may claim molecule aliases (prevents
  // combination products stealing e.g. "acetaminophen" from the paracetamol generic).
  if (rec.activeMolecules.length === 1) {
    const m = molecules[rec.activeMolecules[0]];
    if (m) {
      for (const a of m.aliases) {
        const k = normalizeKey(a);
        if (!k || lookup.has(k)) continue;
        lookup.set(k, rec);
      }
    }
  }
}

export function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function lookupDrug(input: string): DrugRecord | undefined {
  const key = normalizeKey(input);
  if (!key) return undefined;
  if (lookup.has(key)) return lookup.get(key);
  // loose: match if key is a prefix of any alias key with length >= 3
  if (key.length >= 3) {
    for (const [k, v] of lookup.entries()) {
      if (k === key) return v;
    }
    // partial — starts-with match
    for (const [k, v] of lookup.entries()) {
      if (k.startsWith(key) && key.length >= 4) return v;
    }
  }
  return undefined;
}

export function searchDrugs(q: string, limit = 10): DrugRecord[] {
  const key = normalizeKey(q);
  if (!key) return [];
  const scored: Array<{ rec: DrugRecord; score: number }> = [];
  const seen = new Set<string>();
  for (const rec of drugRecords) {
    if (seen.has(rec.id)) continue;
    const candidates = [rec.displayName, ...rec.brandAliases, ...rec.activeMolecules]
      .map(normalizeKey);
    // also molecule aliases
    for (const mid of rec.activeMolecules) {
      const m = molecules[mid];
      if (m) for (const a of m.aliases) candidates.push(normalizeKey(a));
    }
    let best = -1;
    for (const c of candidates) {
      if (!c) continue;
      if (c === key) best = Math.max(best, 100);
      else if (c.startsWith(key)) best = Math.max(best, 80 - (c.length - key.length));
      else if (c.includes(key)) best = Math.max(best, 50 - (c.length - key.length));
    }
    if (best >= 0) {
      scored.push({ rec, score: best });
      seen.add(rec.id);
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.rec);
}
