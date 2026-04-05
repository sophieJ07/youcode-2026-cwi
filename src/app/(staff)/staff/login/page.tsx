import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeInternalPath } from "@/lib/safe-redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StaffLoginView } from "./staff-login-view";

export const metadata: Metadata = {
  title: "Login",
};

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function StaffLoginPage({ searchParams }: Props) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const params = await searchParams;
  if (user) {
    const dest = safeInternalPath(params.next, "/staff/access-code");
    redirect(dest);
  }

  return (
    <StaffLoginView
      callbackAuthError={params.error === "auth"}
    />
  );
}
