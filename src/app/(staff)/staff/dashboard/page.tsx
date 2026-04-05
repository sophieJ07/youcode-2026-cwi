import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/staff/sign-out-button";
import { StaffShellHeader } from "@/components/staff/staff-shell-header";
import { InsightsWellnessSlot } from "@/components/staff/insights-wellness-slot";
import { InsightsActionsSlot } from "@/components/staff/insights-actions-slot";

export const metadata: Metadata = {
  title: "Insights | Staff",
};

function shelterLocationPhrase(names: string[]): string {
  if (names.length === 0) return "your shelter";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export default async function StaffDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/staff/login?next=/staff/dashboard");
  }

  const { count, error } = await supabase
    .from("user_shelter_access")
    .select("*", { count: "exact", head: true });

  if (!error && (count == null || count < 1)) {
    redirect("/staff/access-code");
  }

  const { data: shelters } = await supabase
    .from("shelters")
    .select("name")
    .order("name");

  const shelterNames = (shelters ?? [])
    .map((s) => s.name?.trim())
    .filter((n): n is string => Boolean(n && n.length > 0));

  const at = shelterLocationPhrase(shelterNames);

  const loadingDiv = (
    <div className="min-h-[200px] animate-pulse rounded-xl bg-[var(--staff-input-bg)]/50" />
  );

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--staff-bg)] text-[var(--staff-ink)]">
      <StaffShellHeader showProfileSlot profileSlot={<SignOutButton />} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <h1 className="text-center text-2xl font-bold leading-snug text-[var(--staff-ink)] sm:text-left sm:text-3xl">
          Live wellness data at {at}
        </h1>

        {/* Wellness Summary */}
        <section className="mt-8 rounded-2xl border border-[var(--staff-ink)]/10 bg-[var(--staff-card)] p-6 shadow-md sm:p-8">
          <h2 className="text-lg font-bold text-[var(--staff-ink)]">
            Wellness Summary
          </h2>
          <div className="mt-6">
            <Suspense fallback={loadingDiv}>
              <InsightsWellnessSlot />
            </Suspense>
          </div>
        </section>

        {/* Suggested Actions */}
        <section className="mt-6 rounded-2xl border border-[var(--staff-ink)]/10 bg-[var(--staff-card)] p-6 shadow-md sm:mt-8 sm:p-8">
          <h2 className="text-lg font-bold text-[var(--staff-ink)]">
            Suggested Actions
          </h2>
          <div className="mt-6">
            <Suspense fallback={loadingDiv}>
              <InsightsActionsSlot />
            </Suspense>
          </div>
        </section>
      </main>
    </div>
  );
}
