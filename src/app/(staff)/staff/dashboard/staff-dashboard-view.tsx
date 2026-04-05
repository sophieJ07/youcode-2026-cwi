"use client";

import { SignOutButton } from "@/components/staff/sign-out-button";
import { StaffShellHeader } from "@/components/staff/staff-shell-header";

export function StaffDashboardView() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--staff-bg)] text-[var(--staff-ink)]">
      <StaffShellHeader
        showProfileSlot
        profileSlot={<SignOutButton />}
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <section className="rounded-2xl border border-[var(--staff-ink)]/10 bg-[var(--staff-card)] p-6 shadow-md sm:p-8">
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
