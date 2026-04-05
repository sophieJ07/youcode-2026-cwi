"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StaffShellHeader } from "@/components/staff/staff-shell-header";

export function StaffLoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function goNext(e: React.FormEvent) {
    e.preventDefault();
    router.push("/staff/access-code");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--staff-bg)] text-[var(--staff-ink)]">
      <StaffShellHeader showProfileSlot={false} />
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <form
          onSubmit={goNext}
          className="w-full max-w-md rounded-2xl border border-[var(--staff-ink)]/10 bg-[var(--staff-card)] p-8 shadow-lg sm:p-10"
        >
          <h1 className="text-center text-2xl font-bold text-[var(--staff-ink)]">
            Log into staff account
          </h1>
          <div className="mt-8 flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[var(--staff-ink)]">
                Organization email
              </span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-12 rounded-xl border-0 bg-[var(--staff-input-bg)] px-4 text-[var(--staff-ink)] placeholder:text-[var(--staff-ink)]/40 focus:ring-2 focus:ring-[var(--staff-accent)]/40 focus:outline-none"
                placeholder=""
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[var(--staff-ink)]">
                Password
              </span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-12 rounded-xl border-0 bg-[var(--staff-input-bg)] px-4 text-[var(--staff-ink)] placeholder:text-[var(--staff-ink)]/40 focus:ring-2 focus:ring-[var(--staff-accent)]/40 focus:outline-none"
                placeholder=""
              />
            </label>
          </div>
          <div className="mt-10 flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/staff/access-code")}
              className="min-h-12 min-w-0 flex-1 rounded-xl bg-[var(--staff-accent)] text-base font-semibold text-white shadow-md transition hover:opacity-95 active:scale-[0.99]"
            >
              Sign Up
            </button>
            <button
              type="submit"
              className="min-h-12 min-w-0 flex-1 rounded-xl bg-[var(--wellness-accent-2)] text-base font-semibold text-white shadow-md transition hover:opacity-95 active:scale-[0.99]"
            >
              Log In
            </button>
          </div>
          <p className="mt-6 text-center text-xs text-[var(--staff-ink)]/50">
            UI only — authentication not connected yet.
          </p>
        </form>
      </div>
    </div>
  );
}
