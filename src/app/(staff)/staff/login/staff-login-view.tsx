"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { StaffShellHeader } from "@/components/staff/staff-shell-header";
import { safeInternalPath } from "@/lib/safe-redirect";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const DEFAULT_AFTER_AUTH = "/staff/access-code";

type Props = {
  callbackAuthError?: boolean;
};

export function StaffLoginView({ callbackAuthError = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const afterAuth = useMemo(
    () => safeInternalPath(searchParams.get("next"), DEFAULT_AFTER_AUTH),
    [searchParams],
  );
  const supabase = createBrowserSupabaseClient();

  const [flow, setFlow] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(() =>
    callbackAuthError
      ? "Could not complete sign-in. Try again or use a new confirmation link."
      : null,
  );

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push(afterAuth);
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(afterAuth)}`;
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo },
    });
    setBusy(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      router.push(afterAuth);
      router.refresh();
      return;
    }
    setMessage(
      "Check your email to confirm your account (if confirmation is on in Supabase), then sign in with Log In.",
    );
    setFlow("login");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--staff-bg)] text-[var(--staff-ink)]">
      <StaffShellHeader showProfileSlot={false} />
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-[var(--staff-ink)]/10 bg-[var(--staff-card)] p-8 shadow-lg sm:p-10">
          <h1 className="text-center text-2xl font-bold text-[var(--staff-ink)]">
            Log into staff account
          </h1>

          {message && (
            <p className="mt-6 rounded-xl bg-amber-50/90 px-3 py-2 text-center text-sm text-[var(--staff-ink)]">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-6 rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-800">
              {error}
            </p>
          )}

          {flow === "login" ? (
            <form onSubmit={handleSignIn} className="mt-8">
              <div className="flex flex-col gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[var(--staff-ink)]">
                    Organization email
                  </span>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-h-12 rounded-xl border-0 bg-[var(--staff-input-bg)] px-4 text-[var(--staff-ink)] placeholder:text-[var(--staff-ink)]/40 focus:ring-2 focus:ring-[var(--staff-accent)]/40 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[var(--staff-ink)]">
                    Password
                  </span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-12 rounded-xl border-0 bg-[var(--staff-input-bg)] px-4 text-[var(--staff-ink)] placeholder:text-[var(--staff-ink)]/40 focus:ring-2 focus:ring-[var(--staff-accent)]/40 focus:outline-none"
                  />
                </label>
              </div>
              <div className="mt-10 flex gap-4">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setFlow("signup");
                    setError(null);
                    setMessage(null);
                  }}
                  className="min-h-12 min-w-0 flex-1 rounded-xl bg-[var(--staff-accent)] text-base font-semibold text-white shadow-md transition hover:opacity-95 enabled:active:scale-[0.99] disabled:opacity-60"
                >
                  Sign Up
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="min-h-12 min-w-0 flex-1 rounded-xl bg-[var(--wellness-accent-2)] text-base font-semibold text-white shadow-md transition hover:opacity-95 enabled:active:scale-[0.99] disabled:opacity-60"
                >
                  {busy ? "Signing in…" : "Log In"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="mt-8">
              <div className="flex flex-col gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[var(--staff-ink)]">
                    Organization email
                  </span>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-h-12 rounded-xl border-0 bg-[var(--staff-input-bg)] px-4 text-[var(--staff-ink)] focus:ring-2 focus:ring-[var(--staff-accent)]/40 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[var(--staff-ink)]">
                    Password
                  </span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-12 rounded-xl border-0 bg-[var(--staff-input-bg)] px-4 text-[var(--staff-ink)] focus:ring-2 focus:ring-[var(--staff-accent)]/40 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[var(--staff-ink)]">
                    Confirm password
                  </span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="min-h-12 rounded-xl border-0 bg-[var(--staff-input-bg)] px-4 text-[var(--staff-ink)] focus:ring-2 focus:ring-[var(--staff-accent)]/40 focus:outline-none"
                  />
                </label>
              </div>
              <div className="mt-10 flex gap-4">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setFlow("login");
                    setError(null);
                    setConfirmPassword("");
                  }}
                  className="min-h-12 min-w-0 flex-1 rounded-xl bg-[var(--wellness-accent-2)] text-base font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="min-h-12 min-w-0 flex-1 rounded-xl bg-[var(--staff-accent)] text-base font-semibold text-white shadow-md transition hover:opacity-95 enabled:active:scale-[0.99] disabled:opacity-60"
                >
                  {busy ? "Creating account…" : "Create account"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
