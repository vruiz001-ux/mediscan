import Link from "next/link";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";
import { DisclaimerBanner } from "@/components/app/DisclaimerBanner";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="container pb-8">
        <DisclaimerBanner />
      </section>

      <HowItWorks />

      {/* What this is / isn't */}
      <section className="container py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 p-6">
            <div className="mb-3 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="font-semibold">What MediScan does</h3>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Maps brand names to active ingredients</li>
              <li>Screens up to 10 medicines for known interactions</li>
              <li>Flags duplicate active ingredients (e.g. two paracetamol products)</li>
              <li>Checks against pregnancy, kidney, liver, ulcer, alcohol risks</li>
              <li>Explains each finding in plain language with next steps</li>
            </ul>
          </div>
          <div className="rounded-xl border bg-rose-50/50 dark:bg-rose-950/20 p-6">
            <div className="mb-3 flex items-center gap-2 text-rose-800 dark:text-rose-300">
              <XCircle className="h-5 w-5" />
              <h3 className="font-semibold">What MediScan does NOT do</h3>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Replace a doctor, pharmacist or urgent care</li>
              <li>Diagnose or treat any condition</li>
              <li>Guarantee a combination is safe — absence of a flag is not proof of safety</li>
              <li>Recommend starting or stopping any medication on your own</li>
              <li>Cover every medicine — this is a demo dataset</li>
            </ul>
          </div>
        </div>
      </section>

      <FAQAccordion />

      <section className="container pb-24">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center md:flex-row md:text-left">
          <div>
            <h3 className="text-2xl font-semibold">Ready to check a combination?</h3>
            <p className="mt-1 text-muted-foreground">Add up to 10 medicines and get a clear answer in seconds.</p>
          </div>
          <Button asChild size="lg">
            <Link href="/check">
              Start medicine check <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
