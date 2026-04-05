"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignOutButton } from "@/components/staff/sign-out-button";
import { StaffShellHeader } from "@/components/staff/staff-shell-header";

export function StaffAccessCodeView() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/staff/dashboard");
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
          <label className="mt-8 block">
            <span className="sr-only">Access code</span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="EX: W8139"
              className="min-h-14 w-full rounded-xl border-0 bg-[var(--staff-input-bg)] px-4 text-center text-lg tracking-wide text-[var(--staff-ink)] placeholder:text-[var(--staff-ink)]/45 focus:ring-2 focus:ring-[var(--staff-accent)]/40 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="mx-auto mt-8 flex min-h-14 w-full max-w-xs items-center justify-center rounded-xl bg-[var(--staff-accent)] text-lg font-semibold text-white shadow-md transition hover:opacity-95 active:scale-[0.99]"
          >
            Enter
          </button>
          <p className="mt-6 text-center text-xs text-[var(--staff-ink)]/50">
            Access code validation coming soon.
          </p>
        </form>
      </div>
    </div>
  );
}
