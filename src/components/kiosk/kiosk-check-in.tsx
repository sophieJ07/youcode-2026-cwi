"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const MOODS = [
  { label: "Great", emoji: "😊" },
  { label: "Okay", emoji: "🙂" },
  { label: "Tired", emoji: "😔" },
  { label: "Stressed", emoji: "😰" },
  { label: "Hopeful", emoji: "🌤️" },
  { label: "Need support", emoji: "🤝" },
] as const;

export function KioskCheckIn() {
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setStatus("saving");
    setErrorMessage(null);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("mood_entries").insert({
      mood_label: selected,
      note: note.trim() || null,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(
        error.message.includes("relation") || error.code === "42P01"
          ? "This kiosk is not fully set up yet. Ask staff to run the database migration in Supabase."
          : error.message,
      );
      return;
    }

    setStatus("done");
    setNote("");
    setSelected(null);
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-white p-10 text-center shadow-sm">
        <p className="text-2xl font-medium text-slate-800">Thank you</p>
        <p className="mt-2 text-slate-600">Your check-in was saved.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 min-h-14 w-full rounded-xl bg-amber-700 px-6 text-lg font-semibold text-white active:bg-amber-800 sm:min-h-12"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <fieldset className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <legend className="sr-only">Choose how you feel</legend>
        {MOODS.map((m) => {
          const isActive = selected === m.label;
          return (
            <button
              key={m.label}
              type="button"
              onClick={() => setSelected(m.label)}
              className={`flex min-h-[5.5rem] flex-col items-center justify-center gap-1 rounded-2xl border-2 text-lg font-semibold transition-colors active:scale-[0.99] sm:min-h-24 ${
                isActive
                  ? "border-amber-700 bg-amber-100 text-amber-950 shadow-inner"
                  : "border-amber-200/80 bg-white text-slate-800 shadow-sm hover:border-amber-400"
              }`}
            >
              <span className="text-3xl" aria-hidden>
                {m.emoji}
              </span>
              {m.label}
            </button>
          );
        })}
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="text-base font-medium text-slate-700">
          Anything you want to share? (optional)
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Optional note"
          className="min-h-28 rounded-xl border border-amber-200 bg-white px-4 py-3 text-lg text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
        />
      </label>

      {status === "error" && errorMessage && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-red-800" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={!selected || status === "saving"}
        className="min-h-14 w-full rounded-xl bg-amber-700 text-lg font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none active:bg-amber-800 sm:min-h-12"
      >
        {status === "saving" ? "Saving…" : "Submit check-in"}
      </button>
    </form>
  );
}
