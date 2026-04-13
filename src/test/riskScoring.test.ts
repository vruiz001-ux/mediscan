import { describe, it, expect } from "vitest";
import { scoreOverall } from "@/lib/domain/riskScoring";
import type { Finding, MedicineEntry } from "@/lib/types";

function f(severity: Finding["severity"]): Finding {
  return {
    id: `f-${severity}`,
    type: "interaction",
    severity,
    status: severity === "critical" ? "no_go" : "caution",
    title: "t",
    explanation: "e",
    recommendedAction: "r",
    affectedMedicines: [],
    affectedMolecules: [],
  };
}
const entry: MedicineEntry = {
  inputName: "x",
  normalizedName: "x",
  activeMolecules: ["ibuprofen"],
  resolved: true,
};
const unresolved: MedicineEntry = {
  inputName: "x",
  normalizedName: "x",
  activeMolecules: [],
  resolved: false,
};

describe("riskScoring", () => {
  it("critical finding → no_go", () => {
    expect(scoreOverall([entry], [f("critical")]).status).toBe("no_go");
  });
  it("major + moderate → caution", () => {
    expect(scoreOverall([entry], [f("major"), f("moderate")]).status).toBe("caution");
  });
  it("no findings, all resolved → go", () => {
    expect(scoreOverall([entry], []).status).toBe("go");
  });
  it("unresolved entry with no findings → at least caution", () => {
    expect(scoreOverall([unresolved], []).status).toBe("caution");
  });
});
