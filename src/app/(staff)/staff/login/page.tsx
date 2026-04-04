import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StaffAuthPanel } from "@/components/staff/staff-auth-panel";
import { safeInternalPath } from "@/lib/safe-redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Staff sign in",
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
  const afterAuth = safeInternalPath(params.next, "/staff/dashboard");
  if (user) {
    redirect(afterAuth);
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-slate-900">
          Staff dashboard
        </h1>
        <p className="mt-2 text-center text-slate-600">
          Sign in with email and password, or create an account. Enable Email
          provider under Supabase → Authentication → Providers.
        </p>
        {params.error === "auth" && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-800">
            Something went wrong during sign-in. Try again.
          </p>
        )}
        <div className="mt-8">
          <StaffAuthPanel redirectAfterAuth={afterAuth} />
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">
          <Link
            href="/"
            className="font-medium text-amber-900 underline decoration-amber-400 underline-offset-2 hover:text-amber-950"
          >
            Back to guest check-in
          </Link>
        </p>
      </div>
    </div>
  );
}
