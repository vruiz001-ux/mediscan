// Molecule metadata — source: FDA drug labels, EMA SmPC summaries, UpToDate class notes.
// NOTE: demo ruleset. Not a validated clinical database.

import type { Molecule } from "@/lib/types";

export const molecules: Record<string, Molecule> = {
  ibuprofen: {
    id: "ibuprofen",
    name: "Ibuprofen",
    drugClass: "NSAID",
    aliases: ["ibuprofen"],
    warnings: ["GI bleeding risk", "Kidney risk with dehydration"],
    isOTC: true,
  },
  aspirin: {
    id: "aspirin",
    name: "Aspirin",
    drugClass: "NSAID",
    aliases: ["acetylsalicylic acid", "asa"],
    warnings: ["Bleeding risk", "Reye syndrome in children"],
    isOTC: true,
  },
  paracetamol: {
    id: "paracetamol",
    name: "Paracetamol",
    drugClass: "Analgesic / Antipyretic",
    aliases: ["acetaminophen", "apap"],
    warnings: ["Liver toxicity at high dose"],
    isOTC: true,
  },
  warfarin: {
    id: "warfarin",
    name: "Warfarin",
    drugClass: "Vitamin K antagonist (anticoagulant)",
    aliases: [],
    warnings: ["Narrow therapeutic index", "Bleeding risk"],
    isOTC: false,
  },
  metformin: {
    id: "metformin",
    name: "Metformin",
    drugClass: "Biguanide (antidiabetic)",
    aliases: [],
    warnings: ["Lactic acidosis in renal impairment"],
    isOTC: false,
  },
  lisinopril: {
    id: "lisinopril",
    name: "Lisinopril",
    drugClass: "ACE inhibitor",
    aliases: [],
    warnings: ["Hyperkalemia", "Cough"],
    isOTC: false,
  },
  atorvastatin: {
    id: "atorvastatin",
    name: "Atorvastatin",
    drugClass: "Statin (HMG-CoA reductase inhibitor)",
    aliases: [],
    warnings: ["Myopathy", "Liver enzyme elevation"],
    isOTC: false,
  },
  simvastatin: {
    id: "simvastatin",
    name: "Simvastatin",
    drugClass: "Statin (HMG-CoA reductase inhibitor)",
    aliases: [],
    warnings: ["Myopathy/rhabdomyolysis risk"],
    isOTC: false,
  },
  omeprazole: {
    id: "omeprazole",
    name: "Omeprazole",
    drugClass: "Proton pump inhibitor",
    aliases: [],
    warnings: ["Long-term: B12/magnesium deficiency"],
    isOTC: true,
  },
  sertraline: {
    id: "sertraline",
    name: "Sertraline",
    drugClass: "SSRI",
    aliases: [],
    warnings: ["Serotonin syndrome risk in combinations"],
    isOTC: false,
  },
  fluoxetine: {
    id: "fluoxetine",
    name: "Fluoxetine",
    drugClass: "SSRI",
    aliases: [],
    warnings: ["Long half-life", "Serotonin syndrome risk"],
    isOTC: false,
  },
  tramadol: {
    id: "tramadol",
    name: "Tramadol",
    drugClass: "Opioid analgesic (serotonergic)",
    aliases: [],
    warnings: ["Seizure risk", "Serotonin syndrome risk"],
    isOTC: false,
  },
  diazepam: {
    id: "diazepam",
    name: "Diazepam",
    drugClass: "Benzodiazepine",
    aliases: [],
    warnings: ["Respiratory depression with opioids/alcohol"],
    isOTC: false,
  },
  amoxicillin: {
    id: "amoxicillin",
    name: "Amoxicillin",
    drugClass: "Penicillin antibiotic",
    aliases: [],
    warnings: ["Penicillin allergy"],
    isOTC: false,
  },
  naproxen: {
    id: "naproxen",
    name: "Naproxen",
    drugClass: "NSAID",
    aliases: [],
    warnings: ["GI bleeding risk"],
    isOTC: true,
  },
  clarithromycin: {
    id: "clarithromycin",
    name: "Clarithromycin",
    drugClass: "Macrolide antibiotic (CYP3A4 inhibitor)",
    aliases: [],
    warnings: ["QT prolongation", "Many CYP3A4 interactions"],
    isOTC: false,
  },
  codeine: {
    id: "codeine",
    name: "Codeine",
    drugClass: "Opioid analgesic",
    aliases: [],
    warnings: ["Respiratory depression", "CYP2D6 variable metabolism"],
    isOTC: false,
  },
  morphine: {
    id: "morphine",
    name: "Morphine",
    drugClass: "Opioid analgesic",
    aliases: [],
    warnings: ["Respiratory depression"],
    isOTC: false,
  },
  apixaban: {
    id: "apixaban",
    name: "Apixaban",
    drugClass: "Direct oral anticoagulant (DOAC)",
    aliases: [],
    warnings: ["Bleeding risk"],
    isOTC: false,
  },
  clavulanate: {
    id: "clavulanate",
    name: "Clavulanic acid",
    drugClass: "Beta-lactamase inhibitor",
    aliases: ["clavulanic acid"],
    warnings: [],
    isOTC: false,
  },
  caffeine: {
    id: "caffeine",
    name: "Caffeine",
    drugClass: "Stimulant (adjuvant)",
    aliases: [],
    warnings: [],
    isOTC: true,
  },
};

export function getMolecule(id: string): Molecule | undefined {
  return molecules[id];
}

export function allMolecules(): Molecule[] {
  return Object.values(molecules);
}
