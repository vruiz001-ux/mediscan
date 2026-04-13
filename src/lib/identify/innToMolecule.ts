// Polish INN → local molecule ID, so PL identifications can feed the
// existing rules engine (which keys on English molecule IDs).
//
// Unmapped INNs flow through as their lowercased Polish form — the rules
// engine flags those as "limited data". Add entries here as MediScan's
// rule coverage grows.

export const PL_INN_TO_MOLECULE: Record<string, string> = {
  "paracetamol": "paracetamol",
  "ibuprofen": "ibuprofen",
  "kwas acetylosalicylowy": "aspirin",
  "kodeina": "codeine",
  "kofeina": "caffeine",
  "amoksycylina": "amoxicillin",
  "kwas klawulanowy": "clavulanate",
  "omeprazol": "omeprazole",
  "diklofenak": "diclofenac",
  // not yet in local molecules table — flow through:
  // metamizol, pseudoefedryna, dekstrometorfan, fenylefryna,
  // cetyryzyna, loratadyna, rutozyd, kwas askorbinowy, drotaweryna
};

export function plInnToMoleculeId(inn: string): string {
  const k = inn.toLowerCase().trim();
  return PL_INN_TO_MOLECULE[k] ?? k;
}
