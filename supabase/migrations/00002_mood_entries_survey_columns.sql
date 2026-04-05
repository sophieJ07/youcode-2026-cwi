-- Extend mood_entries for full kiosk flow: multiselect moods, survey completion flags,
-- short (SQ1–SQ3) and long (LQ1–LQ6) answers as nullable int arrays (e.g. selected option indices).

-- Drop scalar mood check before type change
alter table public.mood_entries
  drop constraint if exists mood_entries_mood_level_range;

-- One row per check-in session: mood_level becomes an array of levels (e.g. 1–5 per mood tile)
alter table public.mood_entries
  alter column mood_level type int[] using array[mood_level];

alter table public.mood_entries
  add constraint mood_entries_mood_level_non_empty check (cardinality(mood_level) >= 1);

-- CHECK cannot use subqueries in PostgreSQL; use an IMMUTABLE helper instead.
create or replace function public.mood_entries_mood_level_values_valid(vals int[])
returns boolean
language sql
immutable
as $$
  select coalesce(bool_and(x between 1 and 5), false)
  from unnest(vals) as u(x);
$$;

alter table public.mood_entries
  add constraint mood_entries_mood_level_values check (
    public.mood_entries_mood_level_values_valid(mood_level)
  );

alter table public.mood_entries
  add column short_survey_completed boolean not null default false,
  add column long_survey_completed boolean not null default false,
  add column sq1_answer int[],
  add column sq2_answer int[],
  add column sq3_answer int[],
  add column lq1_answer int[],
  add column lq2_answer int[],
  add column lq3_answer int[],
  add column lq4_answer int[],
  add column lq5_answer int[],
  add column lq6_answer int[];

comment on column public.mood_entries.mood_level is 'Multiselect mood levels (1–5) from the first check-in screen.';
comment on column public.mood_entries.short_survey_completed is 'True if the guest completed or submitted after the 3-question short flow.';
comment on column public.mood_entries.long_survey_completed is 'True if the guest completed or submitted after the 6-question long flow.';
comment on column public.mood_entries.sq1_answer is 'Nullable int[] for short Q1 multiselect (e.g. option indices).';
comment on column public.mood_entries.sq2_answer is 'Nullable int[] for short Q2 multiselect.';
comment on column public.mood_entries.sq3_answer is 'Nullable int[] for short Q3 multiselect.';
comment on column public.mood_entries.lq1_answer is 'Nullable int[] for long Q1 multiselect.';
comment on column public.mood_entries.lq2_answer is 'Nullable int[] for long Q2 multiselect.';
comment on column public.mood_entries.lq3_answer is 'Nullable int[] for long Q3 multiselect.';
comment on column public.mood_entries.lq4_answer is 'Nullable int[] for long Q4 multiselect.';
comment on column public.mood_entries.lq5_answer is 'Nullable int[] for long Q5 multiselect.';
comment on column public.mood_entries.lq6_answer is 'Nullable int[] for long Q6 multiselect.';

-- Keep kiosk RPC compatible: still accepts one int appends as single-element array
create or replace function public.submit_mood_checkin(p_access_code text, p_mood_level int)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  sid uuid;
  new_id uuid;
begin
  if p_mood_level is null or p_mood_level < 1 or p_mood_level > 5 then
    raise exception 'mood_level must be between 1 and 5';
  end if;
  select id into sid from public.shelters where access_code = p_access_code;
  if sid is null then
    raise exception 'invalid access code';
  end if;
  insert into public.mood_entries (shelter_id, mood_level)
  values (sid, array[p_mood_level])
  returning id into new_id;
  return new_id;
end;
$$;
