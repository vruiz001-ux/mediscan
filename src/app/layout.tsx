import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://mediscan.app"),
  title: {
    default: "MediScan — Informational medicine compatibility screening",
    template: "%s · MediScan",
  },
  description:
    "MediScan screens up to 10 medicines for interactions, duplicate ingredients and profile-specific contraindications. Informational only — always confirm with a licensed doctor or pharmacist.",
  keywords: [
    "drug interactions",
    "medication checker",
    "medicine compatibility",
    "duplicate therapy",
    "pharmacology",
  ],
  openGraph: {
    title: "MediScan — Informational medicine compatibility screening",
    description: "Screen up to 10 medicines for interactions, duplicate ingredients and profile-specific risks.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "MediScan", description: "Informational medicine compatibility screening." },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
