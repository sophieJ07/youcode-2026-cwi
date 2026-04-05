"use client";

import { SignOutButton } from "@/components/staff/sign-out-button";
import { StaffShellHeader } from "@/components/staff/staff-shell-header";

type Props = {
  shelterNames: string[];
};

function shelterLocationPhrase(names: string[]): string {
  if (names.length === 0) return "your shelter";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function StaffDashboardView({ shelterNames }: Props) {
  const at = shelterLocationPhrase(shelterNames);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--staff-bg)] text-[var(--staff-ink)]">
      <StaffShellHeader
        showProfileSlot
        profileSlot={<SignOutButton />}
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <h1 className="text-center text-2xl font-bold leading-snug text-[var(--staff-ink)] sm:text-left sm:text-3xl">
          Live wellness data at {at}
        </h1>
        <section className="mt-8 rounded-2xl border border-[var(--staff-ink)]/10 bg-[var(--staff-card)] p-6 shadow-md sm:p-8">
          <h2 className="text-lg font-bold text-[var(--staff-ink)]">
            Wellness Summary
          </h2>
          <div className="mt-6 min-h-[200px] rounded-xl bg-[var(--staff-input-bg)]/50 sm:min-h-[240px]" />
        </section>
        <section className="mt-6 rounded-2xl border border-[var(--staff-ink)]/10 bg-[var(--staff-card)] p-6 shadow-md sm:mt-8 sm:p-8">
          <h2 className="text-lg font-bold text-[var(--staff-ink)]">
            Suggested Actions
          </h2>
          <div className="mt-6 min-h-[200px] rounded-xl bg-[var(--staff-input-bg)]/50 sm:min-h-[240px]" />
        </section>
        <p className="mt-8 text-center text-xs text-[var(--staff-ink)]/50">
          Wellness data and suggested actions coming soon.
        </p>
      </main>
    </div>
  );
}
