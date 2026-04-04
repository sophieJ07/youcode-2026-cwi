"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Props = {
  /** Server-validated path after OAuth / PKCE callback (e.g. /staff/dashboard). */
  redirectAfterAuth: string;
};

export function StaffAuthPanel({ redirectAfterAuth }: Props) {
  const supabase = createBrowserSupabaseClient();
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectAfterAuth)}`
      : undefined;

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      view="sign_in"
      showLinks={false}
      redirectTo={redirectTo}
    />
  );
}
