"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MedicineEntryRow, type RowState } from "@/components/app/MedicineEntryRow";
import { MedicineCounter } from "@/components/app/MedicineCounter";
import { PatientProfileForm } from "@/components/app/PatientProfileForm";
import type { PatientProfile } from "@/lib/types";
import { history } from "@/lib/history/localStore";

const MAX = 10;
const RESULT_KEY = "medscan.lastResult.v1";

function emptyRow(): RowState {
  return { inputName: "" };
}

export function CheckClient() {
  const router = useRouter();
  const [rows, setRows] = useState<RowState[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [profile, setProfile] = useState<PatientProfile>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = rows.filter((r) => r.inputName.trim().length > 0).length;

  function addRow() {
    if (rows.length >= MAX) return;
    setRows([...rows, emptyRow()]);
  }
  function removeRow(i: number) {
    setRows(rows.filter((_, idx) => idx !== i));
  }
  function updateRow(i: number, patch: Partial<RowState>) {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function clearAll() {
    setRows([emptyRow(), emptyRow(), emptyRow()]);
    setProfile({});
    setError(null);
  }

  async function onRun() {
    setError(null);
    const filled = rows.filter((r) => r.inputName.trim().length > 0);
    if (filled.length === 0) {
      setError("Please enter at least one medicine.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicines: filled.map((r) => ({
            inputName: r.inputName,
            normalizedName: r.normalizedName,
            activeMolecules: r.activeMolecules,
            resolved: r.resolved,
            strength: r.strength,
            dosage: r.dosage,
            frequency: r.frequency,
            route: r.route,
            reasonForUse: r.reasonForUse,
          })),
          profile: Object.keys(profile).length ? profile : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }
      const id = json.checkId ?? `local-${Date.now()}`;
      const payload = {
        id,
        createdAt: new Date().toISOString(),
        medicines: filled.map((r) => ({
          inputName: r.inputName,
          normalizedName: r.normalizedName ?? r.inputName,
          activeMolecules: r.activeMolecules ?? [],
          resolved: !!r.resolved,
          strength: r.strength,
          dosage: r.dosage,
          frequency: r.frequency,
          route: r.route,
          reasonForUse: r.reasonForUse,
        })),
        profile: Object.keys(profile).length ? profile : undefined,
        result: json.result,
      };
      history.save(payload);
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(payload));
      router.push(`/check/results?id=${id}`);
    } catch (e: any) {
      setError(e?.message ?? "Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <MedicineCounter count={count} max={MAX} />
        {rows.length >= MAX && (
          <p className="text-xs text-amber-700">Maximum of 10 medicines can be checked at one time.</p>
        )}
      </div>

      <div className="space-y-3">
        {rows.map((row, i) => (
          <MedicineEntryRow
            key={i}
            index={i}
            state={row}
            onChange={(patch) => updateRow(i, patch)}
            onRemove={() => removeRow(i)}
            canRemove={rows.length > 1}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={addRow}
          disabled={rows.length >= MAX}
        >
          <Plus className="h-4 w-4" /> Add medicine
        </Button>
        <Button type="button" variant="ghost" onClick={clearAll}>
          Clear all
        </Button>
      </div>

      <PatientProfileForm value={profile} onChange={setProfile} />

      {error && (
        <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">{error}</div>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button size="lg" onClick={onRun} disabled={submitting || count === 0}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Checking…" : "Run check"}
        </Button>
      </div>
    </div>
  );
}
