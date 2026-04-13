import Link from "next/link";
import { Pill } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/20 print:hidden">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Pill className="h-5 w-5 text-primary" />
            MediScan
          </Link>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Informational medication screening. Not a replacement for a licensed doctor or pharmacist.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/check" className="hover:text-foreground">Check</Link>
          <Link href="/history" className="hover:text-foreground">History</Link>
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/faq" className="hover:text-foreground">FAQ</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
        </nav>
      </div>
      <div className="container pb-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} MediScan. Educational demo — professional confirmation required for any medication decision.
      </div>
    </footer>
  );
}
