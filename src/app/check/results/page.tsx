import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultsClient } from "./ResultsClient";

export const metadata: Metadata = {
  title: "Medicine check results",
  description: "Your medication screening results with overall status and per-finding explanations.",
};

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsClient />
    </Suspense>
  );
}
