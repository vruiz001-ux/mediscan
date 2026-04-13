import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DISCLAIMER } from "@/lib/types";

export function DisclaimerBanner({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      role="note"
      aria-label="Safety disclaimer"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">Informational screening only — not medical advice</p>
        {!compact && <p className="mt-1 text-amber-900/80 dark:text-amber-200/80">{DISCLAIMER}</p>}
      </div>
    </div>
  );
}
