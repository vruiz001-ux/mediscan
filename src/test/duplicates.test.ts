import { describe, it, expect } from "vitest";
import { checkDuplicates } from "@/lib/domain/duplicateTherapyRules";
import { normalizeEntry } from "@/lib/domain/normalizationEngine";

describe("duplicateTherapyRules", () => {
  it("Doliprane + Tylenol → duplicate paracetamol critical no_go", () => {
    const entries = [
      normalizeEntry({ inputName: "Doliprane" }),
      normalizeEntry({ inputName: "Tylenol" }),
    ];
    const findings = checkDuplicates(entries);
    const dup = findings.find((f) => f.affectedMolecules.includes("paracetamol"));
    expect(dup).toBeTruthy();
    expect(dup!.severity).toBe("critical");
    expect(dup!.status).toBe("no_go");
  });
  it("ibuprofen + naproxen → NSAID class duplication critical", () => {
    const entries = [
      normalizeEntry({ inputName: "ibuprofen" }),
      normalizeEntry({ inputName: "naproxen" }),
    ];
    const findings = checkDuplicates(entries);
    const cls = findings.find((f) => f.id.includes("class"));
    expect(cls).toBeTruthy();
    expect(cls!.severity).toBe("critical");
    expect(cls!.status).toBe("no_go");
  });
  it("warfarin + apixaban → anticoagulant duplication critical", () => {
    const entries = [
      normalizeEntry({ inputName: "warfarin" }),
      normalizeEntry({ inputName: "apixaban" }),
    ];
    const findings = checkDuplicates(entries);
    expect(findings.find((f) => f.id === "duplicate:anticoagulants")).toBeTruthy();
  });
});
