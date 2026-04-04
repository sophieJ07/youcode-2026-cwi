import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/staff/sign-out-button";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Insights | Staff",
};

type MoodRow = {
  id: string;
  created_at: string;
  mood_label: string;
  note: string | null;
};

export default async function StaffDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("mood_entries")
    .select("id, created_at, mood_label, note")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = data as MoodRow[] | null;
  const loadError = error?.message ?? null;

  return (
    <div className="min-h-full">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Staff
            </p>
            <h1 className="text-xl font-semibold text-slate-900">
              Guest check-ins
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-amber-900 underline decoration-amber-400 underline-offset-2 hover:text-amber-950"
            >
              Open kiosk view
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-dashed border-slate-200 bg-amber-50/50 p-6 text-slate-700">
          <h2 className="font-semibold text-slate-900">Suggestions</h2>
          <p className="mt-2 text-sm leading-relaxed">
            This area is ready for charts, trends, and AI-assisted suggestions
            built on top of the same <code className="text-slate-800">mood_entries</code>{" "}
            data. Connect your Supabase project and apply the SQL migration in{" "}
            <code className="text-slate-800">supabase/migrations</code> to start
            collecting rows from the tablet.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent check-ins
          </h2>
          {loadError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
              {loadError.includes("relation") || loadError.includes("does not exist")
                ? "The mood_entries table is missing. Run the migration in supabase/migrations on your Supabase database."
                : loadError}
            </p>
          )}
          {!loadError && (!rows || rows.length === 0) && (
            <p className="mt-4 text-slate-600">
              No entries yet. Entries from the kiosk will appear here for signed-in
              staff.
            </p>
          )}
          {!loadError && rows && rows.length > 0 && (
            <ul className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">{row.mood_label}</p>
                    {row.note && (
                      <p className="mt-0.5 text-sm text-slate-600">{row.note}</p>
                    )}
                  </div>
                  <time
                    dateTime={row.created_at}
                    className="shrink-0 text-sm text-slate-500"
                  >
                    {new Date(row.created_at).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
