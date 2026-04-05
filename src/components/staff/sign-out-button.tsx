"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        const supabase = createBrowserSupabaseClient();
        await supabase.auth.signOut();
        router.push("/staff/login");
        router.refresh();
      }}
      className="rounded-lg border border-[var(--staff-ink)]/20 bg-[var(--staff-card)] px-3 py-1.5 text-sm font-medium text-[var(--staff-ink)] shadow-sm transition hover:bg-[var(--staff-input-bg)] active:opacity-90"
    >
      Sign out
    </button>
  );
}
