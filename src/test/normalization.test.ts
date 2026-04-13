import { describe, it, expect } from "vitest";
import { normalizeEntry } from "@/lib/domain/normalizationEngine";

describe("normalizationEngine", () => {
  it("normalizes 'ADVIL ' to ibuprofen", () => {
    const n = normalizeEntry({ inputName: "ADVIL " });
    expect(n.resolved).toBe(true);
    expect(n.activeMolecules).toEqual(["ibuprofen"]);
    expect(n.normalizedName).toBe("Advil");
  });
  it("returns resolved=false for unknown string", () => {
    const n = normalizeEntry({ inputName: "xyzfoobar123" });
    expect(n.resolved).toBe(false);
    expect(n.activeMolecules).toEqual([]);
  });
  it("preserves optional dosage fields", () => {
    const n = normalizeEntry({ inputName: "Tylenol", strength: "500mg", frequency: "twice daily" });
    expect(n.strength).toBe("500mg");
    expect(n.frequency).toBe("twice daily");
    expect(n.activeMolecules).toEqual(["paracetamol"]);
  });
});
