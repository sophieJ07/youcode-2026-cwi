"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignOutButton } from "@/components/staff/sign-out-button";
import { StaffShellHeader } from "@/components/staff/staff-shell-header";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Props = {
  hasExistingShelterAccess: boolean;
};

function isInvalidCodeMessage(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes("invalid access code") || lower.includes("not recognized")
  );
}

export function StaffAccessCodeView({
  hasExistingShelterAccess,
}: Props) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const { data, error: rpcError } = await supabase.rpc(
      "claim_shelter_access",
      { p_access_code: trimmed },
    );
    setBusy(false);
    if (rpcError) {
      setError(
        isInvalidCodeMessage(rpcError.message)
          ? "That code was not recognized."
          : rpcError.message,
      );
      return;
    }
    const row = Array.isArray(data) ? data[0] : null;
    if (!row?.shelter_id) {
      setError("That code was not recognized.");
      return;
    }
    router.push("/staff/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--staff-bg)] text-[var(--staff-ink)]">
      <StaffShellHeader
        showProfileSlot
        profileSlot={<SignOutButton />}
      />
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-2xl border border-[var(--staff-ink)]/10 bg-[var(--staff-card)] p-8 shadow-lg sm:p-10"
        >
          <h1 className="text-center text-2xl font-bold text-[var(--staff-ink)]">
            Enter shelter access code
          </h1>
          {error && (
            <p
              className="mt-6 rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-800"
              role="alert"
            >
              {error}
            </p>
          )}
          <label className="mt-8 block">
            <span className="sr-only">Access code</span>
            <input
              type="text"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="EX: W8139"
              className="min-h-14 w-full rounded-xl border-0 bg-[var(--staff-input-bg)] px-4 text-center text-lg tracking-wide text-[var(--staff-ink)] placeholder:text-[var(--staff-ink)]/45 focus:ring-2 focus:ring-[var(--staff-accent)]/40 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !code.trim()}
            className="mx-auto mt-8 flex min-h-14 w-full max-w-xs items-center justify-center rounded-xl bg-[var(--staff-accent)] text-lg font-semibold text-white shadow-md transition hover:opacity-95 enabled:active:scale-[0.99] disabled:opacity-50"
          >
            {busy ? "Checking…" : "Enter"}
          </button>
          {hasExistingShelterAccess && (
            <p className="mt-6 text-center text-sm text-[var(--staff-ink)]/70">
              <Link
                href="/staff/dashboard"
                className="font-medium text-[var(--staff-accent)] underline decoration-[var(--staff-accent)]/40 underline-offset-2 hover:opacity-90"
              >
                Continue to dashboard
              </Link>
              <span className="text-[var(--staff-ink)]/50">
                {" "}
                if you already unlocked a shelter.
              </span>
            </p>
          )}
          <p className="mt-6 text-center text-xs text-[var(--staff-ink)]/50">
            Your account remembers each shelter you unlock. Codes are
            case-sensitive.
          </p>
        </form>
      </div>
    </div>
  );
}
