"use client";
import { useEffect, useState } from "react";
import { history, type HistoryItem } from "@/lib/history/localStore";
import { statusLabel, severityLabel, formatDate } from "@/lib/utils/formatters";
import { DISCLAIMER } from "@/lib/types";

export function PrintClient({ id }: { id: string }) {
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const it = history.get(id) ?? null;
    setItem(it);
    setLoaded(true);
    if (it) {
      const t = setTimeout(() => {
        try { window.print(); } catch {}
      }, 300);
      return () => clearTimeout(t);
    }
  }, [id]);

  if (!loaded) return null;
  if (!item) {
    return <div className="p-10 font-sans">Result not found. Please re-open from your device.</div>;
  }
  const r = item.result;

  return (
    <div className="mx-auto max-w-3xl p-8 font-sans text-black print:p-0">
      <h1 className="text-2xl font-bold">MediScan — Medication Screening Summary</h1>
      <p className="mt-1 text-sm">Generated: {formatDate(item.createdAt)}</p>
      <div className="mt-2 rounded border border-black p-3 text-sm">
        <strong>IMPORTANT:</strong> {DISCLAIMER}
      </div>

      <h2 className="mt-6 text-lg font-bold">Overall status: {statusLabel(r.overallStatus)}</h2>
      <p className="mt-1 text-sm">{r.summary}</p>

      <h3 className="mt-4 font-bold">Medicines screened</h3>
      <ul className="mt-1 list-disc pl-5 text-sm">
        {r.normalizedMedicines.map((m, i) => (
          <li key={i}>
            <strong>{m.inputName}</strong>
            {m.normalizedName !== m.inputName ? ` → ${m.normalizedName}` : ""}
            {" · "}
            {m.activeMolecules.length ? m.activeMolecules.join(", ") : "unresolved"}
          </li>
        ))}
      </ul>

      <h3 className="mt-4 font-bold">Findings ({r.findings.length})</h3>
      {r.findings.length === 0 ? (
        <p className="text-sm">No findings in current rules.</p>
      ) : (
        <ol className="mt-1 space-y-3 text-sm">
          {r.findings.map((f) => (
            <li key={f.id} className="border border-black/40 p-2">
              <div className="font-semibold">
                [{severityLabel(f.severity)}] {f.title}
              </div>
              <div className="mt-1">{f.explanation}</div>
              <div className="mt-1">
                <strong>Affected:</strong> {f.affectedMedicines.join(", ")}
              </div>
              <div className="mt-1">
                <strong>Recommended action:</strong> {f.recommendedAction}
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-6 border-t pt-3 text-xs">{DISCLAIMER}</div>
    </div>
  );
}
