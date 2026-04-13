"use client";
import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const faqs = [
  {
    q: "Is MediScan a replacement for a doctor or pharmacist?",
    a: "No. MediScan is an informational screening tool. Always confirm with a licensed professional before taking, combining, stopping or changing any medicine.",
  },
  {
    q: "What does Go / Caution / No Go mean?",
    a: "Go = no major concerns found in our current rules. Caution = at least one issue a professional should review. No Go = at least one serious issue (e.g. dangerous interaction, duplicate ingredient, contraindication) — do not combine without professional review.",
  },
  {
    q: "Does No major interaction found mean safe?",
    a: "No. Our ruleset is limited. Absence of a flag does not mean a combination is safe — always confirm with a pharmacist or doctor.",
  },
  {
    q: "How many medicines can I check?",
    a: "Up to 10 at a time.",
  },
  {
    q: "Can I search by brand name?",
    a: "Yes — common brands like Advil, Doliprane, Nurofen, Tylenol, Zoloft, Prozac and others are recognised in the MVP database.",
  },
  {
    q: "What about combination products?",
    a: "MediScan recognises multi-ingredient products (e.g. Co-codamol = paracetamol + codeine) and screens each active ingredient.",
  },
  {
    q: "Do you store personal information?",
    a: "Checks are stored anonymously (no account, no identity). History is kept on your device in localStorage.",
  },
  {
    q: "Should I stop a medicine if I see a No Go?",
    a: "Never stop a prescribed medicine on your own. Bring the result to your doctor or pharmacist to decide the right next step.",
  },
];

export function FAQAccordion() {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <section className="container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
      </div>
      <div className="mx-auto mt-10 max-w-3xl divide-y overflow-hidden rounded-xl border bg-card">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full flex-col gap-2 p-5 text-left transition hover:bg-muted/30"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{f.q}</span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
              </div>
              {isOpen && <p className="text-sm text-muted-foreground">{f.a}</p>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
