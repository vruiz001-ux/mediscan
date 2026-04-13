"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { PatientProfile } from "@/lib/types";

export function PatientProfileForm({
  value,
  onChange,
}: {
  value: PatientProfile;
  onChange: (v: PatientProfile) => void;
}) {
  const [open, setOpen] = useState(false);

  function patch(p: Partial<PatientProfile>) {
    onChange({ ...value, ...p });
  }

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div>
          <div className="font-medium">Patient profile (optional)</div>
          <div className="text-xs text-muted-foreground">
            Adding age, pregnancy, kidney/liver disease, allergies and alcohol use improves screening accuracy.
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="grid gap-3 border-t p-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Age</span>
            <Input
              type="number"
              min={0}
              max={120}
              value={value.age ?? ""}
              onChange={(e) => patch({ age: e.target.value ? Number(e.target.value) : undefined })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Sex</span>
            <select
              value={value.sex ?? ""}
              onChange={(e) => patch({ sex: (e.target.value || undefined) as PatientProfile["sex"] })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Not specified</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </label>

          <fieldset className="sm:col-span-2 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!value.pregnant} onChange={(e) => patch({ pregnant: e.target.checked })} />
              Pregnant
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!value.breastfeeding} onChange={(e) => patch({ breastfeeding: e.target.checked })} />
              Breastfeeding
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!value.kidneyDisease} onChange={(e) => patch({ kidneyDisease: e.target.checked })} />
              Kidney disease
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!value.liverDisease} onChange={(e) => patch({ liverDisease: e.target.checked })} />
              Liver disease
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!value.ulcerHistory} onChange={(e) => patch({ ulcerHistory: e.target.checked })} />
              Stomach ulcer history
            </label>
          </fieldset>

          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-muted-foreground">Alcohol use</span>
            <select
              value={value.alcoholUse ?? ""}
              onChange={(e) => patch({ alcoholUse: (e.target.value || undefined) as PatientProfile["alcoholUse"] })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Not specified</option>
              <option value="none">None</option>
              <option value="occasional">Occasional</option>
              <option value="regular">Regular</option>
              <option value="heavy">Heavy</option>
            </select>
          </label>

          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-muted-foreground">Known allergies (comma-separated)</span>
            <Input
              value={(value.allergies ?? []).join(", ")}
              onChange={(e) =>
                patch({
                  allergies: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. penicillin, amoxicillin"
            />
          </label>

          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-muted-foreground">Chronic conditions (comma-separated)</span>
            <Input
              value={(value.chronicConditions ?? []).join(", ")}
              onChange={(e) =>
                patch({
                  chronicConditions: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. diabetes, hypertension"
            />
          </label>
        </div>
      )}
    </div>
  );
}
