import { cn } from "@/lib/utils/cn";
import type { Finding } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { severityLabel } from "@/lib/utils/formatters";

const SEVERITY_TONE: Record<Finding["severity"], string> = {
  critical: "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
  major: "border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200",
  moderate: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  minor: "border-slate-300 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200",
};

const TYPE_LABEL: Record<Finding["type"], string> = {
  interaction: "Interaction",
  duplicate_therapy: "Duplicate therapy",
  contraindication: "Contraindication",
  side_effect: "Side effect",
  profile_risk: "Profile note",
};

export function FindingCard({ finding }: { finding: Finding }) {
  return (
    <article className={cn("rounded-lg border p-4", SEVERITY_TONE[finding.severity])}>
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        <span>{TYPE_LABEL[finding.type]}</span>
        <span aria-hidden>·</span>
        <Badge variant="outline" className="border-current bg-background/50">
          Severity: {severityLabel(finding.severity)}
        </Badge>
      </div>
      <h3 className="mt-2 text-base font-semibold">{finding.title}</h3>
      <p className="mt-2 text-sm leading-relaxed">{finding.explanation}</p>
      {finding.affectedMedicines.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          <span className="opacity-75">Affected:</span>
          {finding.affectedMedicines.map((m) => (
            <Badge key={m} variant="outline" className="border-current bg-background/50">
              {m}
            </Badge>
          ))}
        </div>
      )}
      <div className="mt-3 rounded-md border border-current/30 bg-background/60 p-3 text-sm">
        <div className="text-xs font-semibold uppercase tracking-wide opacity-75">Recommended action</div>
        <p className="mt-1">{finding.recommendedAction}</p>
      </div>
    </article>
  );
}
