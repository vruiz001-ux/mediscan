import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/check/route";

function req(body: unknown): Request {
  return new Request("http://localhost/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("API /api/check max entry limit", () => {
  it("returns 400 when 11 medicines are submitted", async () => {
    const medicines = Array.from({ length: 11 }, (_, i) => ({ inputName: `drug${i}` }));
    const res = await POST(req({ medicines }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(String(json.error)).toMatch(/Maximum|max|10/i);
  });

  it("rejects empty medicines list", async () => {
    const res = await POST(req({ medicines: [] }));
    expect(res.status).toBe(400);
  });
});
