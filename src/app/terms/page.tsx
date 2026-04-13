import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="container py-14">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Terms of use</h1>
        <p>
          MediScan is provided for <strong>informational and educational purposes only</strong>. It is not medical advice, a diagnosis,
          or a treatment recommendation. By using MediScan you acknowledge that:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>You will always confirm medication decisions with a licensed doctor or pharmacist.</li>
          <li>You will never start, stop, or change any medication based solely on a MediScan result.</li>
          <li>MediScan uses a limited demo dataset; absence of a flag does not mean a combination is safe.</li>
          <li>MediScan&apos;s authors and operators accept no liability for outcomes arising from use of the tool.</li>
        </ul>
      </div>
    </div>
  );
}
