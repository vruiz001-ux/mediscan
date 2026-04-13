import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute inset-0 -z-10 [background-image:radial-gradient(circle_at_20%_0%,hsl(var(--primary)/0.12),transparent_40%),radial-gradient(circle_at_80%_10%,hsl(var(--accent)/0.12),transparent_40%)]" />
      <div className="container flex flex-col items-center py-20 text-center sm:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Informational screening · Not medical advice
        </div>
        <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Screen your medicines <span className="text-primary">before you combine them.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          MediScan checks up to 10 medicines for known interactions, duplicate ingredients, pregnancy/kidney/liver risks
          and profile-specific concerns — then gives you a clear Go, Caution or No Go signal with plain-language next steps.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/check">
              Start medicine check <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/about">How it works</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Always confirm with a licensed doctor or pharmacist before any medication decision.
        </p>
      </div>
    </section>
  );
}
