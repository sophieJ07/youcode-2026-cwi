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

  return <StaffDashboardView />;
}
