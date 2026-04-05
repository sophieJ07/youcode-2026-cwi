import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StaffDashboardView } from "./staff-dashboard-view";

export const metadata: Metadata = {
  title: "Insights",
};

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

  return (
    <StaffDashboardView
      shelterNames={shelterNames}
    />
  );
}
