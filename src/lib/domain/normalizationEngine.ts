// Normalize raw user input → MedicineEntry. Preserves optional dosage/frequency/etc.

import type { MedicineEntry } from "@/lib/types";
import { lookupDrug } from "./brandToMoleculeMap";

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
  };
}

export function normalizeEntries(raws: RawEntry[]): MedicineEntry[] {
  return raws.map(normalizeEntry);
}
