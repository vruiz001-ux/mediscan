import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeEntries } from "@/lib/domain/normalizationEngine";

const Body = z.object({
  entries: z
    .array(
      z.object({
        inputName: z.string().min(1),
        strength: z.string().optional(),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
        route: z.string().optional(),
        reasonForUse: z.string().optional(),
      }),
    )
    .min(1)
    .max(10),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }
  const normalized = normalizeEntries(parsed.data.entries);
  return NextResponse.json({ normalized });
}
