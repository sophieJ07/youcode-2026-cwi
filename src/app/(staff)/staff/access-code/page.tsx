import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StaffAccessCodeView } from "./staff-access-code-view";

export const metadata: Metadata = {
  title: "Shelter access code",
};

export default async function StaffAccessCodePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/staff/login?next=/staff/access-code");
  }

  return <StaffAccessCodeView />;
}
