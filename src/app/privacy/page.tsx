import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="container py-14">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
        <p>
          MediScan does not require an account. We do not collect your name, email, or any identifier. Your local check history is
          stored on your device in your browser (localStorage) and is not sent anywhere.
        </p>
        <p>
          When you run a check, we store an <strong>anonymous</strong> record of the inputs and result on our server (so a result can
          be re-opened by ID). This record contains no identifier linking it to you.
        </p>
        <p>
          You can clear your device history from the History page at any time.
        </p>
      </div>
    </div>
  );
}
