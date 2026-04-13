"use client";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MedicineComboBox } from "./MedicineComboBox";
import type { DrugRecord } from "@/lib/types";

export type RowState = {
  inputName: string;
  normalizedName?: string;
  activeMolecules?: string[];
  resolved?: boolean;
  strength?: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  reasonForUse?: string;
};

export function MedicineEntryRow({
  index,
  state,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  state: RowState;
  onChange: (patch: Partial<RowState>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const unresolved = state.inputName.trim().length > 1 && state.resolved === false;

  function handlePick(rec: DrugRecord) {
    const hasMolecules = rec.activeMolecules && rec.activeMolecules.length > 0;
    onChange({
      inputName: rec.displayName,
      normalizedName: hasMolecules ? rec.displayName : undefined,
      activeMolecules: hasMolecules ? rec.activeMolecules : undefined,
      // If the suggestion has no molecules yet (e.g. RxNav result),
      // leave resolved unset so the server re-normalizes on submit.
      resolved: hasMolecules ? true : undefined,
    });
  }

  function handleText(v: string) {
    onChange({ inputName: v, resolved: undefined, activeMolecules: undefined, normalizedName: undefined });
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="mt-2 text-xs font-medium text-muted-foreground w-6">{index + 1}.</div>
        <div className="flex-1 space-y-2">
          <MedicineComboBox value={state.inputName} onChange={handleText} onPick={handlePick} />
          {state.resolved && state.activeMolecules?.length ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Active ingredient{state.activeMolecules.length > 1 ? "s" : ""}:</span>
              {state.activeMolecules.map((m) => (
                <Badge key={m} variant="secondary">{m}</Badge>
              ))}
            </div>
          ) : null}
          {unresolved && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              We couldn&apos;t recognise this medicine. A pharmacist should confirm what it contains.
            </p>
          )}
          <button
            type="button"
            onClick={() => setShowDetails((s) => !s)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={`h-3 w-3 transition ${showDetails ? "rotate-180" : ""}`} /> Details (optional)
          </button>
          {showDetails && (
            <div className="grid gap-2 pt-2 sm:grid-cols-2">
              <Input
                value={state.strength ?? ""}
                onChange={(e) => onChange({ strength: e.target.value })}
                placeholder="Strength (e.g. 200mg)"
              />
              <Input
                value={state.dosage ?? ""}
                onChange={(e) => onChange({ dosage: e.target.value })}
                placeholder="Dosage (e.g. 1 tablet)"
              />
              <Input
                value={state.frequency ?? ""}
                onChange={(e) => onChange({ frequency: e.target.value })}
                placeholder="Frequency (e.g. twice daily)"
              />
              <Input
                value={state.route ?? ""}
                onChange={(e) => onChange({ route: e.target.value })}
                placeholder="Route (e.g. oral)"
              />
              <Input
                className="sm:col-span-2"
                value={state.reasonForUse ?? ""}
                onChange={(e) => onChange({ reasonForUse: e.target.value })}
                placeholder="Reason for use (optional)"
              />
            </div>
          )}
        </div>
        {canRemove && (
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Remove medicine">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
