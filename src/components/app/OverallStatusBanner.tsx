import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Status } from "@/lib/types";
import { statusLabel } from "@/lib/utils/formatters";

export function OverallStatusBanner({
  status,
  summary,
}: {
  status: Status;
  summary: string;
}) {
  const cfg =
    status === "go"
      ? {
          Icon: CheckCircle2,
          tone: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
          iconTone: "text-emerald-600 dark:text-emerald-400",
          heading: "Go",
          subheading: "No major concerns found in the current rules.",
        }
      : status === "caution"
        ? {
            Icon: AlertTriangle,
            tone: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
            iconTone: "text-amber-600 dark:text-amber-400",
            heading: "Caution",
            subheading: "Professional confirmation is recommended.",
          }
        : {
            Icon: XCircle,
            tone: "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
            iconTone: "text-rose-600 dark:text-rose-400",
            heading: "No Go",
            subheading: "Do not combine without professional review.",
          };
  const { Icon } = cfg;

  return (
    <div
      role="status"
      aria-label={`Overall status: ${statusLabel(status)}`}
      className={cn("flex items-start gap-4 rounded-xl border-2 p-5", cfg.tone)}
    >
      <Icon className={cn("mt-0.5 h-8 w-8 flex-shrink-0", cfg.iconTone)} aria-hidden />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide opacity-75">Overall status</span>
          <span className="text-xs font-semibold uppercase tracking-wide opacity-60">·</span>
          <span className="text-xs font-bold uppercase tracking-wide">{statusLabel(status)}</span>
        </div>
        <h2 className="mt-1 text-2xl font-bold">{cfg.heading}</h2>
        <p className="mt-0.5 text-sm opacity-90">{cfg.subheading}</p>
        <p className="mt-3 text-sm">{summary}</p>
      </div>
    </div>
  );
}
