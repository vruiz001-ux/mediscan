import { NextResponse } from "next/server";
import { z } from "zod";
import { identify } from "@/lib/identify/resolver";

const Body = z.union([
  z.object({
    name: z.string().min(1).max(200),
    country: z.literal("PL").optional(),
  }),
  z.object({
    names: z.array(z.string().min(1).max(200)).min(1).max(50),
    country: z.literal("PL").optional(),
  }),
]);

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  if ("name" in parsed.data) {
    return NextResponse.json(await identify(parsed.data.name));
  }
  const results = await Promise.all(parsed.data.names.map((n) => identify(n)));
  return NextResponse.json({ results });
}
