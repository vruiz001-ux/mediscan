"use client";

import { z } from "zod";
import type { OverallResult, MedicineEntry, PatientProfile } from "@/lib/types";

const KEY = "medscan.history.v1";

const HistoryItemSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  medicines: z.array(z.any()),
  profile: z.any().optional(),
  result: z.any(),
});

const HistorySchema = z.array(HistoryItemSchema);

export type HistoryItem = {
  id: string;
  createdAt: string;
  medicines: MedicineEntry[];
  profile?: PatientProfile;
  result: OverallResult;
};

function read(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = HistorySchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return [];
    return parsed.data as HistoryItem[];
  } catch {
    return [];
  }
}

function write(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export const history = {
  list(): HistoryItem[] {
    return read().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },
  get(id: string): HistoryItem | undefined {
    return read().find((i) => i.id === id);
  },
  save(item: HistoryItem) {
    const all = read().filter((i) => i.id !== item.id);
    all.push(item);
    write(all.slice(-50));
  },
  delete(id: string) {
    write(read().filter((i) => i.id !== id));
  },
  clear() {
    write([]);
  },
};
