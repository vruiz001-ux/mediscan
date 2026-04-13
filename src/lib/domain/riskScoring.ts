// Combines findings into overall Go / Caution / No Go status.

import type { Finding, MedicineEntry, Status } from "@/lib/types";

export function scoreOverall(
  entries: MedicineEntry[],
  findings: Finding[],
): { status: Status; summary: string } {
  const critical = findings.filter((f) => f.severity === "critical").length;
  const major = findings.filter((f) => f.severity === "major").length;
  const moderate = findings.filter((f) => f.severity === "moderate").length;
  const minor = findings.filter((f) => f.severity === "minor").length;
  const unresolved = entries.filter((e) => !e.resolved).length;

  let status: Status;
  if (critical > 0) status = "no_go";
  else if (major > 0 || moderate > 0) status = "caution";
  else status = "go";

  // Unresolved items force at least "caution"
  if (unresolved > 0 && status === "go") status = "caution";

  const parts: string[] = [];
  if (critical > 0) parts.push(`${critical} serious issue${critical > 1 ? "s" : ""}`);
  if (major > 0) parts.push(`${major} major concern${major > 1 ? "s" : ""}`);
  if (moderate > 0) parts.push(`${moderate} moderate concern${moderate > 1 ? "s" : ""}`);
  if (minor > 0) parts.push(`${minor} minor note${minor > 1 ? "s" : ""}`);
  if (unresolved > 0) parts.push(`${unresolved} unrecognised medicine${unresolved > 1 ? "s" : ""}`);

  let summary: string;
  if (status === "no_go") {
    summary = `${parts.join(", ")} found — professional review required before taking these together. No major interaction found does not mean a combination is safe; always confirm with a professional.`;
  } else if (status === "caution") {
    summary = parts.length
      ? `${parts.join(", ")} found — please confirm with a pharmacist or doctor before taking these together.`
      : "Please confirm with a pharmacist or doctor before taking these together.";
  } else {
    summary =
      "No major interaction found in the current rules and profile information. This does not guarantee safety — professional confirmation is recommended.";
  }

  return { status, summary };
}
