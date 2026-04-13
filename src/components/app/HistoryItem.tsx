"use client";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HistoryItem as HItem } from "@/lib/history/localStore";
import { statusLabel, formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

export function HistoryItem({ item, onDelete }: { item: HItem; onDelete: () => void }) {
  const tone =
    item.result.overallStatus === "go"
      ? "text-emerald-700 border-emerald-300 bg-emerald-50"
      : item.result.overallStatus === "caution"
        ? "text-amber-700 border-amber-300 bg-amber-50"
        : "text-rose-700 border-rose-300 bg-rose-50";
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", tone)}>
            {statusLabel(item.result.overallStatus)}
          </span>
          <span className="text-muted-foreground">{formatDate(item.createdAt)}</span>
          <span className="text-muted-foreground">· {item.medicines.length} medicine{item.medicines.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="mt-1 truncate text-sm">
          {item.medicines.map((m) => m.normalizedName).join(", ")}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/check/results?id=${item.id}`}>Open</Link>
        </Button>
        <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
