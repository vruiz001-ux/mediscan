// Pairwise molecule × molecule interaction rules.
// Sources (rule comments): FDA labels, UpToDate, Stockley's Drug Interactions, EMA SmPC.

import type { Finding, MedicineEntry, Severity, Status } from "@/lib/types";

type Rule = {
  a: string;
  b: string;
  severity: Severity;
  status: Status;
  title: string;
  explanation: string;
  recommendedAction: string;
};

const RULES: Rule[] = [
  // Anticoagulants + NSAIDs (FDA warfarin label; UpToDate bleeding risk)
  {
    a: "warfarin", b: "ibuprofen", severity: "critical", status: "no_go",
    title: "Serious bleeding risk: Warfarin with Ibuprofen",
    explanation: "Combining warfarin (a blood thinner) with ibuprofen (an NSAID) can cause serious internal bleeding. NSAIDs also increase INR unpredictably.",
    recommendedAction: "Do not combine until a healthcare professional reviews this. Contact your doctor or pharmacist before taking these together.",
  },
  {
    a: "warfarin", b: "aspirin", severity: "critical", status: "no_go",
    title: "Serious bleeding risk: Warfarin with Aspirin",
    explanation: "Both medicines thin the blood through different mechanisms. Combined, they sharply increase the risk of serious bleeding.",
    recommendedAction: "Do not combine until a healthcare professional reviews this. Some cardiac patients take both intentionally — this must be confirmed by a doctor.",
  },
  {
    a: "warfarin", b: "naproxen", severity: "critical", status: "no_go",
    title: "Serious bleeding risk: Warfarin with Naproxen",
    explanation: "Naproxen increases bleeding risk in patients on warfarin through GI and platelet effects.",
    recommendedAction: "Do not combine until a healthcare professional reviews this.",
  },
  {
    a: "warfarin", b: "clarithromycin", severity: "major", status: "no_go",
    title: "Warfarin level increase: Clarithromycin interaction",
    explanation: "Clarithromycin inhibits CYP3A4 and can sharply raise warfarin levels, causing bleeding.",
    recommendedAction: "Contact your doctor before taking these together. INR monitoring is typically required.",
  },
  // Serotonergic combos (FDA boxed warnings — serotonin syndrome)
  {
    a: "sertraline", b: "tramadol", severity: "critical", status: "no_go",
    title: "Serotonin syndrome risk: Sertraline with Tramadol",
    explanation: "Both medicines raise serotonin levels. Together they can cause serotonin syndrome — a potentially life-threatening reaction (agitation, fever, tremor, fast heartbeat).",
    recommendedAction: "Do not combine until a healthcare professional reviews this. Seek urgent medical advice if already taken and symptoms appear.",
  },
  {
    a: "fluoxetine", b: "tramadol", severity: "critical", status: "no_go",
    title: "Serotonin syndrome risk: Fluoxetine with Tramadol",
    explanation: "Combining fluoxetine (SSRI) with tramadol can trigger serotonin syndrome. Fluoxetine's long half-life extends the risk for weeks after stopping.",
    recommendedAction: "Do not combine until a healthcare professional reviews this. Seek urgent medical advice if symptoms appear.",
  },
  {
    a: "sertraline", b: "fluoxetine", severity: "major", status: "caution",
    title: "Two SSRIs together: Sertraline + Fluoxetine",
    explanation: "Two SSRIs taken together increases serotonin syndrome risk. Normally one replaces the other with a washout period.",
    recommendedAction: "Contact your doctor before taking these together.",
  },
  // CNS depressants (FDA boxed warning — opioid + benzo)
  {
    a: "diazepam", b: "tramadol", severity: "major", status: "caution",
    title: "Respiratory depression risk: Diazepam + Tramadol",
    explanation: "Combining benzodiazepines and opioids can cause dangerous breathing depression, deep sedation, coma, and death.",
    recommendedAction: "Contact your doctor before taking these together.",
  },
  {
    a: "diazepam", b: "codeine", severity: "major", status: "caution",
    title: "Respiratory depression risk: Diazepam + Codeine",
    explanation: "Benzodiazepine + opioid combinations increase risk of profound sedation and breathing depression.",
    recommendedAction: "Contact your doctor before taking these together.",
  },
  {
    a: "diazepam", b: "morphine", severity: "critical", status: "no_go",
    title: "Serious respiratory depression: Diazepam + Morphine",
    explanation: "Benzodiazepine combined with a strong opioid markedly raises the risk of fatal respiratory depression.",
    recommendedAction: "Do not combine until a healthcare professional reviews this.",
  },
  // Statin + macrolide (FDA statin labels — CYP3A4)
  {
    a: "atorvastatin", b: "clarithromycin", severity: "major", status: "caution",
    title: "Muscle damage risk: Atorvastatin + Clarithromycin",
    explanation: "Clarithromycin blocks statin breakdown (CYP3A4), raising statin levels and risk of muscle damage (rhabdomyolysis).",
    recommendedAction: "Contact your doctor before taking these together. The statin is often paused while the antibiotic is taken.",
  },
  {
    a: "simvastatin", b: "clarithromycin", severity: "critical", status: "no_go",
    title: "Do not combine: Simvastatin + Clarithromycin",
    explanation: "Simvastatin and clarithromycin together sharply raise risk of rhabdomyolysis (severe muscle breakdown). Simvastatin labelling contraindicates this combination.",
    recommendedAction: "Do not combine until a healthcare professional reviews this.",
  },
  // NSAID + ACEi / NSAID + NSAID / NSAID + DOAC
  {
    a: "ibuprofen", b: "lisinopril", severity: "moderate", status: "caution",
    title: "Reduced blood pressure effect & kidney risk",
    explanation: "NSAIDs can reduce the blood pressure-lowering effect of ACE inhibitors and, especially in dehydration or kidney disease, cause acute kidney injury.",
    recommendedAction: "Ask your pharmacist before combining these medicines. Monitoring may be needed.",
  },
  {
    a: "aspirin", b: "ibuprofen", severity: "major", status: "caution",
    title: "GI bleeding risk & reduced aspirin effect",
    explanation: "Taking ibuprofen with aspirin can increase stomach/intestinal bleeding and blunt aspirin's protective effect on the heart.",
    recommendedAction: "Contact your doctor before taking these together.",
  },
  {
    a: "apixaban", b: "ibuprofen", severity: "major", status: "caution",
    title: "Bleeding risk: Apixaban + Ibuprofen",
    explanation: "Apixaban is an anticoagulant; adding ibuprofen (NSAID) increases the risk of GI and other bleeding.",
    recommendedAction: "Contact your doctor before taking these together.",
  },
];

// Symmetric lookup
function ruleFor(a: string, b: string): Rule | undefined {
  return RULES.find(
    (r) => (r.a === a && r.b === b) || (r.a === b && r.b === a),
  );
}

export function checkInteractions(entries: MedicineEntry[]): Finding[] {
  const findings: Finding[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const A = entries[i];
      const B = entries[j];
      for (const ma of A.activeMolecules) {
        for (const mb of B.activeMolecules) {
          if (ma === mb) continue; // duplicate-therapy handled elsewhere
          const rule = ruleFor(ma, mb);
          if (!rule) continue;
          const key = [ma, mb].sort().join("|") + "@" + i + "-" + j;
          if (seen.has(key)) continue;
          seen.add(key);
          findings.push({
            id: `interaction:${ma}:${mb}:${i}:${j}`,
            type: "interaction",
            severity: rule.severity,
            status: rule.status,
            title: rule.title,
            explanation: rule.explanation,
            recommendedAction: rule.recommendedAction,
            affectedMedicines: [A.normalizedName, B.normalizedName],
            affectedMolecules: [ma, mb],
          });
        }
      }
    }
  }
  return findings;
}
