import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/staff/sign-out-button";
import { StaffShellHeader } from "@/components/staff/staff-shell-header";
import { StaffInsightsDashboard } from "@/components/staff/staff-insights-dashboard";
import { getShortTermInsightsData } from "@/lib/insights/short-term-insights";
import { parseShortTimeRange } from "@/lib/insights/time-range";

export const metadata: Metadata = {
  title: "Insights | Staff",
};

function shelterLocationPhrase(names: string[]): string {
  if (names.length === 0) return "your shelter";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

type SearchParams = Promise<{ term?: string; range?: string }>;

export default async function StaffDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const term = sp.term === "long" ? "long" : "short";
  const range = parseShortTimeRange(sp.range);

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

  const shortData =
    term === "short" ? await getShortTermInsightsData(range) : null;

  const aiConfigured =
    process.env.AI_PROVIDER === "claude" &&
    Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--staff-bg)] text-[var(--staff-ink)]">
      <StaffShellHeader showProfileSlot profileSlot={<SignOutButton />} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <h1 className="text-center text-3xl font-bold leading-snug text-[var(--staff-ink)] sm:text-left sm:text-4xl">
          Live wellness data at {at}
        </h1>

        <StaffInsightsDashboard
          key={`${term}-${range}`}
          term={term}
          range={range}
          snapshot={shortData?.snapshot ?? null}
          aiConfigured={aiConfigured}
        />
      </main>
    </div>
  );
}
