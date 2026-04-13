"use client";
import { useEffect, useRef, useState } from "react";
import type { DrugRecord } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export function MedicineComboBox({
  value,
  onChange,
  onPick,
  placeholder = "Type a medicine name (e.g. Advil, paracetamol)",
}: {
  value: string;
  onChange: (v: string) => void;
  onPick?: (rec: DrugRecord) => void;
  placeholder?: string;
}) {
  const [suggestions, setSuggestions] = useState<DrugRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/suggest?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((j) => {
          if (cancelled) return;
          setSuggestions(j.suggestions ?? []);
          setOpen(true);
          setHighlighted(0);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [value]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pick(rec: DrugRecord) {
    onChange(rec.displayName);
    onPick?.(rec);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length && setOpen(true)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            if (suggestions[highlighted]) {
              e.preventDefault();
              pick(suggestions[highlighted]);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">…</span>
      )}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow-lg">
          {suggestions.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => pick(s)}
                className={cn(
                  "flex w-full items-start justify-between gap-3 rounded px-2 py-1.5 text-left hover:bg-accent",
                  i === highlighted && "bg-accent",
                )}
              >
                <div>
                  <div className="font-medium">{s.displayName}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.kind === "brand" ? "brand" : s.kind === "combination" ? "combination" : "generic"}
                    {" · "}
                    {s.activeMolecules.join(" + ")}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
