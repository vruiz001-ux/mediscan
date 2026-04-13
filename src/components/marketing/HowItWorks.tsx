import { Pill, Search, FileCheck } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "1. Add your medicines",
    body: "Search by brand or generic name. Add up to 10 medicines, plus optional profile info (pregnancy, kidney/liver, allergies).",
  },
  {
    icon: Pill,
    title: "2. Run the check",
    body: "We resolve brand names to active ingredients, then screen for interactions, duplicates, and profile-specific contraindications.",
  },
  {
    icon: FileCheck,
    title: "3. Read the result",
    body: "Get a Go / Caution / No Go signal with per-finding explanations and recommended next steps to share with your doctor or pharmacist.",
  },
];

export function HowItWorks() {
  return (
    <section className="container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
        <p className="mt-3 text-muted-foreground">Three steps, clear output.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.title} className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
