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

  const { count, error } = await supabase
    .from("user_shelter_access")
    .select("*", { count: "exact", head: true });

  const hasExistingShelterAccess =
    !error && count != null && count > 0;

  return (
    <StaffAccessCodeView
      hasExistingShelterAccess={hasExistingShelterAccess}
    />
  );
}
