import type { Metadata } from "next";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";
import { DisclaimerBanner } from "@/components/app/DisclaimerBanner";

export const metadata: Metadata = { title: "FAQ" };

export default function FAQPage() {
  return (
    <div className="container py-14">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Frequently asked questions</h1>
        <DisclaimerBanner compact />
      </div>
      <FAQAccordion />
    </div>
  );
}
