import type { Severity, Status } from "@/lib/types";

export function statusLabel(s: Status): string {
  return s === "go" ? "Go" : s === "caution" ? "Caution" : "No Go";
}

export function severityLabel(s: Severity): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
