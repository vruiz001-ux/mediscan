// Duplicate-therapy rules: same molecule twice, or same therapeutic class twice.

import type { Finding, MedicineEntry, Severity, Status } from "@/lib/types";
import { molecules } from "./drugDatabase";

type ClassRule = { drugClass: string; severity: Severity; status: Status; label: string };

// Class-level duplication. Source: clinical practice guidelines, FDA class labeling.
const CLASS_RULES: ClassRule[] = [
  { drugClass: "NSAID", severity: "critical", status: "no_go", label: "Two NSAIDs" },
  { drugClass: "SSRI", severity: "major", status: "caution", label: "Two SSRIs" },
  { drugClass: "Benzodiazepine", severity: "major", status: "caution", label: "Two benzodiazepines" },
];

// Anticoagulant duplication across classes: VKA + DOAC.
const ANTICOAG = new Set(["warfarin", "apixaban"]);

export function checkDuplicates(entries: MedicineEntry[]): Finding[] {
  const findings: Finding[] = [];

  // 1. Same molecule in multiple entries
  const moleculeToEntries = new Map<string, { idx: number; entry: MedicineEntry }[]>();
  entries.forEach((entry, idx) => {
    for (const m of entry.activeMolecules) {
      if (!moleculeToEntries.has(m)) moleculeToEntries.set(m, []);
      moleculeToEntries.get(m)!.push({ idx, entry });
    }
  });
  for (const [mol, list] of moleculeToEntries.entries()) {
    if (list.length >= 2) {
      const mName = molecules[mol]?.name ?? mol;
      findings.push({
        id: `duplicate:mol:${mol}`,
        type: "duplicate_therapy",
        severity: "critical",
        status: "no_go",
        title: `Duplicate ingredient: ${mName}`,
        explanation: `${list.length} of the medicines you entered all contain ${mName}. Taking them together means you would get more of ${mName} than intended, which can cause an overdose (e.g. liver damage with paracetamol, bleeding with anticoagulants).`,
        recommendedAction: "Do not combine until a healthcare professional reviews this. Typically only one product containing this ingredient should be taken.",
        affectedMedicines: list.map((l) => l.entry.normalizedName),
        affectedMolecules: [mol],
      });
    }
  }

  // 2. Same therapeutic class via different molecules
  for (const rule of CLASS_RULES) {
    const hitsByIdx = new Map<number, { molecule: string; name: string }>();
    entries.forEach((entry, idx) => {
      for (const m of entry.activeMolecules) {
        const meta = molecules[m];
        if (meta && meta.drugClass === rule.drugClass) {
          if (!hitsByIdx.has(idx)) {
            hitsByIdx.set(idx, { molecule: m, name: entry.normalizedName });
          }
        }
      }
    });
    if (hitsByIdx.size >= 2) {
      const hits = Array.from(hitsByIdx.values());
      // avoid duplicating if already flagged as same-molecule duplicate
      const distinctMolecules = new Set(hits.map((h) => h.molecule));
      if (distinctMolecules.size < 2) continue;
      findings.push({
        id: `duplicate:class:${rule.drugClass}`,
        type: "duplicate_therapy",
        severity: rule.severity,
        status: rule.status,
        title: `${rule.label} taken together (${rule.drugClass})`,
        explanation: `The medicines you entered include ${hits.length} different ${rule.drugClass}s. Combining medicines from the same class generally increases side-effect risk without extra benefit.`,
        recommendedAction:
          rule.status === "no_go"
            ? "Do not combine until a healthcare professional reviews this."
            : "Contact your doctor before taking these together.",
        affectedMedicines: hits.map((h) => h.name),
        affectedMolecules: hits.map((h) => h.molecule),
      });
    }
  }

  // 3. Anticoagulant stacking (warfarin + apixaban etc.)
  const anticoagHits: { molecule: string; name: string; idx: number }[] = [];
  entries.forEach((entry, idx) => {
    for (const m of entry.activeMolecules) {
      if (ANTICOAG.has(m)) anticoagHits.push({ molecule: m, name: entry.normalizedName, idx });
    }
  });
  const distinctAnticoags = new Set(anticoagHits.map((h) => h.molecule));
  if (distinctAnticoags.size >= 2) {
    findings.push({
      id: `duplicate:anticoagulants`,
      type: "duplicate_therapy",
      severity: "critical",
      status: "no_go",
      title: "Two blood thinners taken together",
      explanation: "Combining two anticoagulants dramatically increases the risk of serious bleeding. This is rarely done intentionally.",
      recommendedAction: "Do not combine until a healthcare professional reviews this.",
      affectedMedicines: Array.from(new Set(anticoagHits.map((h) => h.name))),
      affectedMolecules: Array.from(distinctAnticoags),
    });
  }

  return findings;
}
