import type { Metadata } from "next";
import Link from "next/link";
import { KioskCheckIn } from "@/components/kiosk/kiosk-check-in";

export const metadata: Metadata = {
  title: "How are you feeling? | Shelter check-in",
  description: "Anonymous check-in for guests.",
};

export default function KioskHomePage() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-10 px-6 py-12">
      <header className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-800/80">
          Shelter check-in
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          How are you feeling today?
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Tap an option below. You can add a short note if you want.
        </p>
      </header>
      <KioskCheckIn />
      <footer className="mt-auto border-t border-amber-200/80 pt-8 text-center text-sm text-slate-500">
        <p>Responses are anonymous and help the team support the community.</p>
        <p className="mt-2">
          Staff?{" "}
          <Link
            href="/staff/login"
            className="font-medium text-amber-900 underline decoration-amber-400 underline-offset-2 hover:text-amber-950"
          >
            Sign in to the dashboard
          </Link>
        </p>
      </footer>
    </main>
  );
}
