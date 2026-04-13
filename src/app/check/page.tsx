import type { Metadata } from "next";
import { CheckClient } from "./CheckClient";
import { DisclaimerBanner } from "@/components/app/DisclaimerBanner";

export const metadata: Metadata = {
  title: "Medicine check",
  description:
    "Add up to 10 medicines and an optional patient profile to screen for interactions, duplicates and contraindications.",
};

export default function CheckPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Medicine compatibility check</h1>
          <p className="text-muted-foreground">
            Add up to 10 medicines. Optional profile info (pregnancy, kidney/liver disease, allergies) improves accuracy.
          </p>
        </div>
        <div className="mt-6">
          <DisclaimerBanner />
        </div>
        <div className="mt-8">
          <CheckClient />
        </div>
      </div>
    </div>
  );
}
