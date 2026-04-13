import type { Metadata } from "next";
import { HistoryClient } from "./HistoryClient";
import { DisclaimerBanner } from "@/components/app/DisclaimerBanner";

export const metadata: Metadata = {
  title: "Check history",
  description: "Your past medication screening checks, stored locally on this device.",
};

export default function HistoryPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your check history</h1>
          <p className="mt-1 text-muted-foreground">Stored locally on this device. No account, no server-side identity.</p>
        </div>
        <DisclaimerBanner compact />
        <HistoryClient />
      </div>
    </div>
  );
}
