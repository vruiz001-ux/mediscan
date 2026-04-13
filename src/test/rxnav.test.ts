import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  searchApproximate,
  resolveIngredients,
  __clearLru,
} from "@/lib/integrations/rxnav";

// Mock payloads that mirror the shape returned by rxnav.nlm.nih.gov
const APPROX_PAYLOAD = {
  approximateGroup: {
    candidate: [
      { rxcui: "5640", score: "100", rank: "1" },
      { rxcui: "153010", score: "85", rank: "2" },
    ],
  },
};
const NAME_IBUPROFEN = {
  propConceptGroup: { propConcept: [{ propValue: "Ibuprofen" }] },
};
const NAME_ADVIL = {
  propConceptGroup: { propConcept: [{ propValue: "Advil" }] },
};
const RXCUI_ADVIL = { idGroup: { rxnormId: ["153010"] } };
const RELATED_IBUPROFEN = {
  relatedGroup: {
    conceptGroup: [
      {
        tty: "IN",
        conceptProperties: [{ name: "Ibuprofen", rxcui: "5640" }],
      },
    ],
  },
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function routeFetch(url: string): Response {
  if (url.includes("approximateTerm.json")) return jsonResponse(APPROX_PAYLOAD);
  if (url.includes("/rxcui/5640/property.json")) return jsonResponse(NAME_IBUPROFEN);
  if (url.includes("/rxcui/153010/property.json")) return jsonResponse(NAME_ADVIL);
  if (url.includes("rxcui.json?name=")) return jsonResponse(RXCUI_ADVIL);
  if (url.includes("/related.json")) return jsonResponse(RELATED_IBUPROFEN);
  return jsonResponse({});
}

describe("rxnav integration", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __clearLru();
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      return routeFetch(url);
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("searchApproximate returns suggestions with names from NIH payload", async () => {
    const out = await searchApproximate("advi");
    expect(out.length).toBeGreaterThan(0);
    expect(out[0].rxcui).toBe("5640");
    expect(out.map((s) => s.name)).toContain("Ibuprofen");
  });

  it("resolveIngredients('Advil') returns ['ibuprofen']", async () => {
    const out = await resolveIngredients("Advil");
    expect(out).toEqual(["ibuprofen"]);
  });

  it("returns [] on timeout without throwing", async () => {
    fetchSpy.mockImplementation(
      () =>
        new Promise((_res, rej) => {
          // Simulate AbortController aborting the request
          setTimeout(() => rej(new DOMException("aborted", "AbortError")), 10);
        }) as unknown as Promise<Response>,
    );
    const out = await resolveIngredients("neverexists123");
    expect(out).toEqual([]);
  });

  it("cache hit: second call skips fetch", async () => {
    await resolveIngredients("Advil");
    const countAfterFirst = fetchSpy.mock.calls.length;
    await resolveIngredients("Advil");
    expect(fetchSpy.mock.calls.length).toBe(countAfterFirst);
  });
});
