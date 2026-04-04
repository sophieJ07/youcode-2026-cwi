-- Guest check-ins from the public kiosk (anon) readable only by signed-in staff (authenticated).

create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  mood_label text not null,
  note text
);

alter table public.mood_entries enable row level security;

create policy "Kiosk guests can submit check-ins"
  on public.mood_entries
  for insert
  to anon
  with check (true);

create policy "Staff can read check-ins"
  on public.mood_entries
  for select
  to authenticated
  using (true);
