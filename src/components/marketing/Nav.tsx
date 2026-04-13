import Link from "next/link";
import { Pill } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur print:hidden">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Pill className="h-5 w-5 text-primary" />
          <span>MediScan</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/check" className="hover:text-foreground">Check</Link>
          <Link href="/history" className="hover:text-foreground">History</Link>
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/faq" className="hover:text-foreground">FAQ</Link>
        </nav>
        <Button asChild size="sm">
          <Link href="/check">Start medicine check</Link>
        </Button>
      </div>
    </header>
  );
}
