"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { history, type HistoryItem as H } from "@/lib/history/localStore";
import { HistoryItem } from "@/components/app/HistoryItem";

export function HistoryClient() {
  const [items, setItems] = useState<H[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(history.list());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <p className="text-muted-foreground">No checks yet.</p>
        <Button asChild className="mt-4">
          <Link href="/check">Start your first check</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={() => {
            if (confirm("Delete all history?")) {
              history.clear();
              setItems([]);
            }
          }}
        >
          Clear all
        </Button>
      </div>
      {items.map((it) => (
        <HistoryItem
          key={it.id}
          item={it}
          onDelete={() => {
            history.delete(it.id);
            setItems(history.list());
          }}
        />
      ))}
    </div>
  );
}
