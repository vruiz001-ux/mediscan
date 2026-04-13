// Orchestrates the full screening pipeline.

import type { MedicineEntry, OverallResult, PatientProfile, Severity } from "@/lib/types";
import { DISCLAIMER } from "@/lib/types";
import { checkInteractions } from "./interactionRules";
import { checkDuplicates } from "./duplicateTherapyRules";
import { checkContraindications } from "./contraindicationRules";
import { scoreOverall } from "./riskScoring";
import { applyRecommendations } from "./recommendationEngine";
import { molecules } from "./drugDatabase";

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  major: 1,
  moderate: 2,
  minor: 3,
};

export function runPipeline(
  entries: MedicineEntry[],
  profile?: PatientProfile,
): OverallResult {
  const interactions = checkInteractions(entries);
  const duplicates = checkDuplicates(entries);
  const contraindications = checkContraindications(entries, profile);

  const unresolvedFindings = entries
    .filter((e) => !e.resolved)
    .map((e, i) => ({
      id: `unresolved:${i}:${e.inputName}`,
      type: "profile_risk" as const,
      severity: "moderate" as const,
      status: "caution" as const,
      title: `We couldn't recognize "${e.inputName}"`,
      explanation:
        "This medicine was not found in our limited demo database. We cannot screen it for interactions. Check the spelling or ask a pharmacist to confirm what it contains.",
      recommendedAction: "Ask your pharmacist before combining these medicines.",
      affectedMedicines: [e.inputName],
      affectedMolecules: [],
    }));

  // "Limited data" findings: molecules resolved via RxNav that we have no
  // local rule data for (not in drugDatabase). Forces overall to at least
  // caution and surfaces an explicit disclaimer per molecule.
  const limitedDataFindings = entries
    .filter((e) => e.source === "rxnav" && e.resolved)
    .flatMap((e) => {
      const uncovered = e.activeMolecules.filter((m) => !molecules[m]);
      return uncovered.map((m) => {
        const display = m.charAt(0).toUpperCase() + m.slice(1);
        return {
          id: `limited_data:${e.inputName}:${m}`,
          type: "profile_risk" as const,
          severity: "moderate" as const,
          status: "caution" as const,
          title: `Limited data for ${display}`,
          explanation: `${display} was recognized via RxNorm but our rules database doesn't have interaction or safety information for it. This check may be incomplete.`,
          recommendedAction:
            "Ask your pharmacist to review this medicine's safety in combination with the others.",
          affectedMedicines: [e.inputName],
          affectedMolecules: [m],
        };
      });
    });

  const findings = applyRecommendations([
    ...interactions,
    ...duplicates,
    ...contraindications,
    ...unresolvedFindings,
    ...limitedDataFindings,
  ]);

  findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const { status, summary } = scoreOverall(entries, findings);

  return {
    overallStatus: status,
    summary,
    normalizedMedicines: entries.map((e) => ({
      inputName: e.inputName,
      normalizedName: e.normalizedName,
      activeMolecules: e.activeMolecules,
      source: e.source,
      rxcui: e.rxcui,
    })),
    findings,
    disclaimer: DISCLAIMER,
  };
}
