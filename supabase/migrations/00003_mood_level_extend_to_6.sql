-- Extend mood_level valid range from 1–5 to 1–6
-- to support the new mood option: Upset (6)

create or replace function public.mood_entries_mood_level_values_valid(vals int[])
returns boolean
language sql
immutable
as $$
  select coalesce(bool_and(x between 1 and 6), false)
  from unnest(vals) as u(x);
$$;
