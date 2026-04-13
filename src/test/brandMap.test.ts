import { describe, it, expect } from "vitest";
import { lookupDrug } from "@/lib/domain/brandToMoleculeMap";

describe("brandToMoleculeMap", () => {
  it("maps Advil → ibuprofen", () => {
    const rec = lookupDrug("Advil");
    expect(rec?.activeMolecules).toEqual(["ibuprofen"]);
  });
  it("maps Doliprane → paracetamol", () => {
    const rec = lookupDrug("Doliprane");
    expect(rec?.activeMolecules).toEqual(["paracetamol"]);
  });
  it("maps Co-codamol → [paracetamol, codeine]", () => {
    const rec = lookupDrug("Co-codamol");
    expect(rec?.activeMolecules.sort()).toEqual(["codeine", "paracetamol"]);
  });
  it("handles case and whitespace", () => {
    expect(lookupDrug(" ADVIL ")?.activeMolecules).toEqual(["ibuprofen"]);
  });
  it("maps acetaminophen alias → paracetamol", () => {
    expect(lookupDrug("acetaminophen")?.activeMolecules).toEqual(["paracetamol"]);
  });
});
