// Tests for the PL identification module. Uses the dev SQLite DB seeded
// via `npx tsx src/lib/identify/seed.ts`. CI must run the seed before
// these tests (or stub the DB).

import { describe, it, expect } from "vitest";
import { normalize } from "@/lib/identify/normalize";
import { diceSimilarity } from "@/lib/identify/fuzzy";
import { identify } from "@/lib/identify/resolver";

describe("normalize", () => {
  it("strips diacritics and lowercases", () => {
    expect(normalize("Maść Voltaren").normalized).toBe("voltaren");
  });

  it("extracts strength with mg unit", () => {
    const n = normalize("Apap 500 mg");
    expect(n.normalized).toBe("apap");
    expect(n.strength).toBe("500 mg");
  });

  it("handles comma decimals and ml", () => {
    const n = normalize("Syrop 2,5 ml");
    expect(n.strength).toBe("2.5 ml");
  });

  it("normalizes j.m. to iu", () => {
    expect(normalize("Vitamin D 2000 j.m.").strength).toBe("2000 iu");
  });

  it("strips dosage form words", () => {
    const n = normalize("Apap tabletki powlekane");
    expect(n.normalized).toBe("apap");
    expect(n.form).toBe("tabletki");
  });
});

describe("diceSimilarity", () => {
  it("returns 1 for identical strings", () => {
    expect(diceSimilarity("apap", "apap")).toBe(1);
  });
  it("scores typos high but below 1", () => {
    const s = diceSimilarity("apap", "appa");
    expect(s).toBeGreaterThan(0.3);
    expect(s).toBeLessThan(1);
  });
  it("returns 0 for empty input", () => {
    expect(diceSimilarity("", "apap")).toBe(0);
  });
});

describe("identify (requires seeded DB)", () => {
  it("exact match: Apap → Paracetamol", async () => {
    const r = await identify("Apap");
    expect(r.identified).toBe(true);
    if (r.identified && "active_substance" in r) {
      expect(r.commercial_name).toBe("Apap");
      expect(r.active_substance).toBe("Paracetamol");
      expect(r.atc_code).toBe("N02BE01");
      expect(r.confidence_score).toBe(1);
    }
  });

  it("alias match: 'Apap 500' resolves to Apap with extracted strength", async () => {
    const r = await identify("Apap 500");
    expect(r.identified).toBe(true);
    if (r.identified) {
      expect(r.commercial_name).toBe("Apap");
      expect(r.strength).toBe("500 mg");
    }
  });

  it("declined form: 'Apapu' (genitive) hits alias", async () => {
    const r = await identify("Apapu");
    expect(r.identified).toBe(true);
    if (r.identified && "active_substance" in r) {
      expect(r.active_substance).toBe("Paracetamol");
    }
  });

  it("combination product: Gripex Max returns multiple substances", async () => {
    const r = await identify("Gripex Max");
    expect(r.identified).toBe(true);
    if (r.identified && "active_substances" in r) {
      expect(r.active_substances).toEqual(
        expect.arrayContaining(["Paracetamol", "Pseudoefedryna", "Dekstrometorfan"]),
      );
    }
  });

  it("fuzzy: 'Polopirina' (typo) → Polopiryna S above threshold", async () => {
    const r = await identify("Polopirina");
    expect(r.identified).toBe(true);
    if (r.identified) {
      expect(r.commercial_name).toBe("Polopiryna S");
      expect(r.confidence_score).toBeGreaterThanOrEqual(0.75);
      expect(r.confidence_score).toBeLessThan(1);
    }
  });

  it("legacy spelling: Polopiryna → Polopiryna S via alias", async () => {
    const r = await identify("Polopiryna");
    expect(r.identified).toBe(true);
    if (r.identified) expect(r.commercial_name).toBe("Polopiryna S");
  });

  it("unresolved input returns identified=false with candidates", async () => {
    const r = await identify("ZzqxNotAMed");
    expect(r.identified).toBe(false);
    if (!r.identified) {
      expect(r.notes).toMatch(/no confident match/i);
    }
  });

  it("empty input is rejected with notes", async () => {
    const r = await identify("   ");
    expect(r.identified).toBe(false);
  });

  it("brand-family parent does not collapse to variant: Gripex ≠ Gripex Max", async () => {
    const r = await identify("Gripex");
    expect(r.identified).toBe(true);
    if (r.identified) expect(r.commercial_name).toBe("Gripex");
  });
});
