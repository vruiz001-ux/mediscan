import { NextResponse } from "next/server";
import { searchDrugs } from "@/lib/domain/brandToMoleculeMap";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const suggestions = searchDrugs(q, 10);
  return NextResponse.json({ suggestions });
}
