import { describe, it, expect } from "vitest";
import { checkContraindications } from "@/lib/domain/contraindicationRules";
import { normalizeEntry } from "@/lib/domain/normalizationEngine";

describe("contraindicationRules", () => {
  it("pregnant + warfarin → critical no_go", () => {
    const entries = [normalizeEntry({ inputName: "warfarin" })];
    const findings = checkContraindications(entries, { pregnant: true });
    const f = findings.find((x) => x.affectedMolecules.includes("warfarin"));
    expect(f).toBeTruthy();
    expect(f!.severity).toBe("critical");
    expect(f!.status).toBe("no_go");
  });
  it("kidneyDisease + metformin → caution", () => {
    const entries = [normalizeEntry({ inputName: "metformin" })];
    const findings = checkContraindications(entries, { kidneyDisease: true });
    const f = findings.find((x) => x.affectedMolecules.includes("metformin"));
    expect(f).toBeTruthy();
    expect(f!.status).toBe("caution");
  });
  it("no profile → no contraindications", () => {
    const entries = [normalizeEntry({ inputName: "warfarin" })];
    expect(checkContraindications(entries, undefined)).toEqual([]);
  });
});
