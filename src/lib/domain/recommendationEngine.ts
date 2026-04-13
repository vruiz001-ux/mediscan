// Maps severity/type to a plain-language action phrase when a finding lacks one.

import type { Finding } from "@/lib/types";

export function ensureRecommendation(f: Finding): Finding {
  if (f.recommendedAction && f.recommendedAction.trim().length > 0) return f;
  let action = "Ask your pharmacist before combining these medicines.";
  if (f.severity === "critical") action = "Do not combine until a healthcare professional reviews this.";
  else if (f.severity === "major") action = "Contact your doctor before taking these together.";
  else if (f.severity === "moderate") action = "Ask your pharmacist before combining these medicines. Monitoring may be needed.";
  return { ...f, recommendedAction: action };
}

export function applyRecommendations(findings: Finding[]): Finding[] {
  return findings.map(ensureRecommendation);
}
