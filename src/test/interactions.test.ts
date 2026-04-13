import { describe, it, expect } from "vitest";
import { checkInteractions } from "@/lib/domain/interactionRules";
import { normalizeEntry } from "@/lib/domain/normalizationEngine";

describe("interactionRules", () => {
  it("warfarin + ibuprofen → critical no_go", () => {
    const entries = [
      normalizeEntry({ inputName: "Coumadin" }),
      normalizeEntry({ inputName: "Advil" }),
    ];
    const findings = checkInteractions(entries);
    expect(findings.length).toBeGreaterThan(0);
    const f = findings[0];
    expect(f.severity).toBe("critical");
    expect(f.status).toBe("no_go");
    expect(f.affectedMolecules.sort()).toEqual(["ibuprofen", "warfarin"]);
  });
  it("sertraline + tramadol → critical no_go", () => {
    const entries = [
      normalizeEntry({ inputName: "Zoloft" }),
      normalizeEntry({ inputName: "tramadol" }),
    ];
    const findings = checkInteractions(entries);
    const f = findings.find((x) => x.type === "interaction");
    expect(f).toBeTruthy();
    expect(f!.severity).toBe("critical");
    expect(f!.status).toBe("no_go");
  });
  it("aspirin + ibuprofen → major caution (NSAID pair interaction)", () => {
    const entries = [
      normalizeEntry({ inputName: "aspirin" }),
      normalizeEntry({ inputName: "ibuprofen" }),
    ];
    const findings = checkInteractions(entries);
    const match = findings.find((f) => f.affectedMolecules.includes("aspirin") && f.affectedMolecules.includes("ibuprofen"));
    expect(match).toBeTruthy();
    expect(match!.severity).toBe("major");
  });
});
