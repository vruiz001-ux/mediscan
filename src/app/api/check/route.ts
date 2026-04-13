import { NextResponse } from "next/server";
import { z } from "zod";
import { runPipeline } from "@/lib/domain/pipeline";
import { normalizeEntries } from "@/lib/domain/normalizationEngine";
import { prisma } from "@/lib/db/client";
import type { MedicineEntry } from "@/lib/types";

const MedicineSchema = z.object({
  inputName: z.string().min(1),
  normalizedName: z.string().optional(),
  activeMolecules: z.array(z.string()).optional(),
  resolved: z.boolean().optional(),
  strength: z.string().optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  route: z.string().optional(),
  reasonForUse: z.string().optional(),
});

const ProfileSchema = z
  .object({
    age: z.number().int().min(0).max(130).optional(),
    sex: z.enum(["female", "male", "other", "prefer_not_to_say"]).optional(),
    pregnant: z.boolean().optional(),
    breastfeeding: z.boolean().optional(),
    allergies: z.array(z.string()).optional(),
    kidneyDisease: z.boolean().optional(),
    liverDisease: z.boolean().optional(),
    ulcerHistory: z.boolean().optional(),
    alcoholUse: z.enum(["none", "occasional", "regular", "heavy"]).optional(),
    chronicConditions: z.array(z.string()).optional(),
    notes: z.string().optional(),
  })
  .optional();

const Body = z.object({
  medicines: z.array(MedicineSchema).min(1),
  profile: ProfileSchema,
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.medicines.length > 10) {
    return NextResponse.json(
      { error: "Maximum of 10 medicines can be checked at one time." },
      { status: 400 },
    );
  }

  // Ensure every medicine is fully normalized (server-side re-normalization for unresolved ones)
  const entries: MedicineEntry[] = parsed.data.medicines.map((m) => {
    if (m.resolved && m.activeMolecules && m.normalizedName) {
      return {
        inputName: m.inputName,
        normalizedName: m.normalizedName,
        activeMolecules: m.activeMolecules,
        resolved: true,
        strength: m.strength,
        dosage: m.dosage,
        frequency: m.frequency,
        route: m.route,
        reasonForUse: m.reasonForUse,
      };
    }
    // re-normalize from raw
    const [n] = normalizeEntries([
      {
        inputName: m.inputName,
        strength: m.strength,
        dosage: m.dosage,
        frequency: m.frequency,
        route: m.route,
        reasonForUse: m.reasonForUse,
      },
    ]);
    return n;
  });

  const result = runPipeline(entries, parsed.data.profile);

  let checkId: string | undefined;
  try {
    const row = await prisma.check.create({
      data: {
        inputJson: JSON.stringify({ medicines: entries, profile: parsed.data.profile ?? null }),
        resultJson: JSON.stringify(result),
        status: result.overallStatus,
      },
      select: { id: true },
    });
    checkId = row.id;
  } catch {
    // DB unavailable — still return result; history falls back to localStorage.
    checkId = undefined;
  }

  return NextResponse.json({ result, checkId });
}
