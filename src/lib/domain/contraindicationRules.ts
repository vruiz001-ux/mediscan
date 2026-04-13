// Profile × molecule contraindications.
// Sources: FDA pregnancy labels, ACOG, UK NICE, manufacturer SmPC.

import type { Finding, MedicineEntry, PatientProfile, Severity, Status } from "@/lib/types";
import { molecules } from "./drugDatabase";

type Rule = {
  test: (p: PatientProfile) => boolean;
  molecule: string;
  severity: Severity;
  status: Status;
  title: (molName: string) => string;
  explanation: string;
  recommendedAction: string;
};

const RULES: Rule[] = [
  // Pregnancy
  {
    test: (p) => !!p.pregnant,
    molecule: "warfarin",
    severity: "critical",
    status: "no_go",
    title: (m) => `${m} is not safe in pregnancy`,
    explanation: "Warfarin crosses the placenta and can cause serious birth defects and fetal bleeding.",
    recommendedAction: "Do not combine until a healthcare professional reviews this. Seek urgent medical advice if already taken in pregnancy.",
  },
  {
    test: (p) => !!p.pregnant,
    molecule: "ibuprofen",
    severity: "critical",
    status: "no_go",
    title: (m) => `${m} should be avoided in pregnancy`,
    explanation: "Ibuprofen (especially in the third trimester) can harm the baby's heart and kidneys and cause complications at delivery.",
    recommendedAction: "Contact your doctor before taking these together. Paracetamol is usually preferred in pregnancy if needed.",
  },
  {
    test: (p) => !!p.pregnant,
    molecule: "naproxen",
    severity: "critical",
    status: "no_go",
    title: (m) => `${m} should be avoided in pregnancy`,
    explanation: "Naproxen, an NSAID, can harm the baby in the later stages of pregnancy.",
    recommendedAction: "Contact your doctor before taking these together.",
  },
  {
    test: (p) => !!p.pregnant,
    molecule: "atorvastatin",
    severity: "critical",
    status: "no_go",
    title: (m) => `${m} is contraindicated in pregnancy`,
    explanation: "Statins are not recommended in pregnancy due to potential effects on fetal development.",
    recommendedAction: "Contact your doctor — statins are normally stopped during pregnancy.",
  },
  {
    test: (p) => !!p.pregnant,
    molecule: "simvastatin",
    severity: "critical",
    status: "no_go",
    title: (m) => `${m} is contraindicated in pregnancy`,
    explanation: "Statins are not recommended in pregnancy due to potential effects on fetal development.",
    recommendedAction: "Contact your doctor — statins are normally stopped during pregnancy.",
  },

  // Ulcer history + NSAIDs
  ...(["ibuprofen", "naproxen", "aspirin"] as const).map<Rule>((mol) => ({
    test: (p) => !!p.ulcerHistory,
    molecule: mol,
    severity: "major",
    status: "caution",
    title: (m) => `Stomach ulcer history with ${m}`,
    explanation: "NSAIDs like this one can re-trigger stomach or intestinal ulcers and bleeding, especially in people with a prior ulcer.",
    recommendedAction: "Contact your doctor before taking these together. A safer alternative or a stomach-protecting medicine may be needed.",
  })),

  // Kidney disease
  {
    test: (p) => !!p.kidneyDisease,
    molecule: "metformin",
    severity: "moderate",
    status: "caution",
    title: (m) => `Kidney disease + ${m}`,
    explanation: "Metformin is cleared by the kidneys. In reduced kidney function, it can accumulate and rarely cause a serious condition called lactic acidosis.",
    recommendedAction: "Discuss dose adjustment with your prescriber. Monitoring may be needed.",
  },
  {
    test: (p) => !!p.kidneyDisease,
    molecule: "ibuprofen",
    severity: "major",
    status: "caution",
    title: (m) => `Kidney disease + ${m}`,
    explanation: "NSAIDs can worsen kidney function, especially if the kidneys are already impaired.",
    recommendedAction: "Contact your doctor before taking these together.",
  },

  // Liver disease
  {
    test: (p) => !!p.liverDisease,
    molecule: "paracetamol",
    severity: "moderate",
    status: "caution",
    title: (m) => `Liver disease + ${m}`,
    explanation: "Paracetamol is processed by the liver. In liver disease, even normal doses can be harmful.",
    recommendedAction: "Discuss dose adjustment with your prescriber.",
  },
  {
    test: (p) => !!p.liverDisease,
    molecule: "atorvastatin",
    severity: "major",
    status: "caution",
    title: (m) => `Liver disease + ${m}`,
    explanation: "Statins can further stress an already-damaged liver.",
    recommendedAction: "Contact your doctor before taking these together.",
  },
  {
    test: (p) => !!p.liverDisease,
    molecule: "simvastatin",
    severity: "major",
    status: "caution",
    title: (m) => `Liver disease + ${m}`,
    explanation: "Statins can further stress an already-damaged liver.",
    recommendedAction: "Contact your doctor before taking these together.",
  },

  // Alcohol
  {
    test: (p) => p.alcoholUse === "heavy",
    molecule: "paracetamol",
    severity: "major",
    status: "caution",
    title: (m) => `Heavy alcohol use + ${m}`,
    explanation: "Heavy drinking plus paracetamol sharply increases the risk of liver damage, even at standard doses.",
    recommendedAction: "Contact your doctor before taking these together.",
  },
  {
    test: (p) => p.alcoholUse === "heavy",
    molecule: "diazepam",
    severity: "critical",
    status: "no_go",
    title: (m) => `Heavy alcohol use + ${m}`,
    explanation: "Alcohol and diazepam both depress breathing and consciousness. Combining them can be fatal.",
    recommendedAction: "Do not combine until a healthcare professional reviews this.",
  },
];

export function checkContraindications(
  entries: MedicineEntry[],
  profile: PatientProfile | undefined,
): Finding[] {
  const findings: Finding[] = [];
  if (!profile) return findings;
  entries.forEach((entry, idx) => {
    for (const mol of entry.activeMolecules) {
      for (const rule of RULES) {
        if (rule.molecule !== mol) continue;
        if (!rule.test(profile)) continue;
        const molName = molecules[mol]?.name ?? mol;
        findings.push({
          id: `contraindication:${mol}:${idx}:${rule.severity}`,
          type: "contraindication",
          severity: rule.severity,
          status: rule.status,
          title: rule.title(molName),
          explanation: rule.explanation,
          recommendedAction: rule.recommendedAction,
          affectedMedicines: [entry.normalizedName],
          affectedMolecules: [mol],
        });
      }
    }

    // Allergies — simple string-match contraindication
    if (profile.allergies && profile.allergies.length) {
      for (const mol of entry.activeMolecules) {
        const molName = (molecules[mol]?.name ?? mol).toLowerCase();
        const hit = profile.allergies.find((a) => {
          const al = a.toLowerCase().trim();
          return al && (molName.includes(al) || al.includes(molName));
        });
        if (hit) {
          findings.push({
            id: `contraindication:allergy:${mol}:${idx}`,
            type: "contraindication",
            severity: "critical",
            status: "no_go",
            title: `Reported allergy to ${molecules[mol]?.name ?? mol}`,
            explanation: `You listed an allergy matching this medicine's ingredient. Taking it could cause a serious allergic reaction.`,
            recommendedAction: "Do not combine until a healthcare professional reviews this. Seek urgent medical advice if already taken and symptoms appear.",
            affectedMedicines: [entry.normalizedName],
            affectedMolecules: [mol],
          });
        }
      }
    }
  });
  return findings;
}
