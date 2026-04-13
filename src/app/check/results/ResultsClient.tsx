"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DisclaimerBanner } from "@/components/app/DisclaimerBanner";
import { OverallStatusBanner } from "@/components/app/OverallStatusBanner";
import { FindingCard } from "@/components/app/FindingCard";
import { PrintButton } from "@/components/app/PrintButton";
import { CopyButton } from "@/components/app/CopyButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { history, type HistoryItem } from "@/lib/history/localStore";
import { sideEffectData } from "@/lib/domain/sideEffectData";
import { molecules } from "@/lib/domain/drugDatabase";
import { statusLabel } from "@/lib/utils/formatters";

const RESULT_KEY = "medscan.lastResult.v1";

export function ResultsClient() {
  const sp = useSearchParams();
  const id = sp.get("id");
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let found: HistoryItem | undefined;
    if (id) found = history.get(id);
    if (!found) {
      try {
        const raw = sessionStorage.getItem(RESULT_KEY);
        if (raw) found = JSON.parse(raw);
      } catch {}
    }
    setItem(found ?? null);
    setLoading(false);
  }, [id]);

  const summaryText = useMemo(() => {
    if (!item) return "";
    const lines: string[] = [];
    lines.push(`MediScan result: ${statusLabel(item.result.overallStatus)}`);
    lines.push(item.result.summary);
    lines.push("");
    lines.push("Medicines:");
    for (const m of item.result.normalizedMedicines) {
      lines.push(`- ${m.normalizedName} (${m.activeMolecules.join(", ") || "unresolved"})`);
    }
    lines.push("");
    lines.push(`Findings: ${item.result.findings.length}`);
    for (const f of item.result.findings) {
      lines.push(`- [${f.severity}] ${f.title} — ${f.recommendedAction}`);
    }
    lines.push("");
    lines.push(item.result.disclaimer);
    return lines.join("\n");
  }, [item]);

  if (loading) {
    return <div className="container py-20 text-center text-muted-foreground">Loading…</div>;
  }
  if (!item) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg">No result found.</p>
        <Button asChild className="mt-4">
          <Link href="/check">Start a new check</Link>
        </Button>
      </div>
    );
  }

  const r = item.result;
  const allMolecules = Array.from(new Set(r.normalizedMedicines.flatMap((m) => m.activeMolecules)));
  const redFlagMolecules = allMolecules.filter((m) => sideEffectData[m]?.redFlags?.length);

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <DisclaimerBanner />

        <OverallStatusBanner status={r.overallStatus} summary={r.summary} />

        {/* Normalized medicine list */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="text-lg font-semibold">Medicines we screened</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {r.normalizedMedicines.map((m, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{m.inputName}</span>
                {m.normalizedName !== m.inputName && (
                  <span className="text-muted-foreground">→ {m.normalizedName}</span>
                )}
                {m.source === "rxnav" && (
                  <Badge
                    variant="outline"
                    className="border-sky-500 text-sky-700"
                    title="Resolved via NIH RxNorm — limited rule data"
                  >
                    RxNorm
                  </Badge>
                )}
                {m.activeMolecules.length === 0 ? (
                  <Badge variant="outline" className="border-amber-500 text-amber-700">
                    unresolved
                  </Badge>
                ) : (
                  m.activeMolecules.map((mol) => {
                    const meta = molecules[mol];
                    return (
                      <Badge key={mol} variant="secondary">
                        {meta?.name ?? mol}
                        {meta?.isOTC ? <span className="ml-1 opacity-70">· OTC</span> : null}
                      </Badge>
                    );
                  })
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Findings */}
        <section>
          <h2 className="text-lg font-semibold">Findings ({r.findings.length})</h2>
          {r.findings.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No findings in our current rules. This does not guarantee safety — professional confirmation is recommended.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {r.findings.map((f) => (
                <FindingCard key={f.id} finding={f} />
              ))}
            </div>
          )}
        </section>

        {/* Red-flag side effects */}
        {redFlagMolecules.length > 0 && (
          <section className="rounded-xl border bg-card p-5">
            <details>
              <summary className="cursor-pointer font-semibold">When to seek urgent medical help</summary>
              <div className="mt-3 space-y-3 text-sm">
                {redFlagMolecules.map((m) => {
                  const data = sideEffectData[m];
                  const name = molecules[m]?.name ?? m;
                  return (
                    <div key={m}>
                      <div className="font-medium">{name}</div>
                      <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                        {data.redFlags.map((rf, i) => (
                          <li key={i}>{rf}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground">
                  These red-flag symptoms are informational, not diagnostic. Seek urgent care if you experience any of them.
                </p>
              </div>
            </details>
          </section>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <PrintButton id={item.id} />
          <CopyButton text={summaryText} />
          <Button asChild variant="outline">
            <Link href="/check">Check again</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/history">View history</Link>
          </Button>
        </div>

        <DisclaimerBanner />
      </div>
    </div>
  );
}
