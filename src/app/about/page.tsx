import type { Metadata } from "next";
import { DisclaimerBanner } from "@/components/app/DisclaimerBanner";

export const metadata: Metadata = { title: "About MediScan" };

export default function AboutPage() {
  return (
    <div className="container py-14">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">About MediScan</h1>
        <DisclaimerBanner />
        <p>
          MediScan is an informational medicine-compatibility screening tool. You enter up to 10 medicines and, optionally, a short
          patient profile. We map brand names to active ingredients, then run five checks:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Interactions</strong> between molecules (e.g. warfarin + ibuprofen).</li>
          <li><strong>Duplicate therapy</strong> (same ingredient twice, or two medicines from the same class).</li>
          <li><strong>Contraindications</strong> for pregnancy, kidney or liver disease, ulcer history, and heavy alcohol use.</li>
          <li><strong>Side-effect red flags</strong> you should know about.</li>
          <li><strong>Unresolved input</strong> — anything we don&apos;t recognise is flagged, not silently ignored.</li>
        </ul>
        <p>
          The output is a Go / Caution / No Go signal plus per-finding plain-language explanations and recommended actions.
        </p>
        <h2 className="text-xl font-semibold">Important limitations</h2>
        <p>
          This MVP uses a <strong>limited demo ruleset</strong> — not a full clinical database. Production use in healthcare requires
          validated datasets (RxNorm / DM+D / ATC), clinician review of rules, and professional oversight. Absence of a flag here does
          not prove a combination is safe.
        </p>
        <p>
          MediScan never recommends starting, stopping, or changing a medication on your own. Always confirm with a licensed doctor or
          pharmacist.
        </p>
      </div>
    </div>
  );
}
