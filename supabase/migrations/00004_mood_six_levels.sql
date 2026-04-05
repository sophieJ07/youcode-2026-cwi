-- Six mood tiles → levels 1–6. The column is int[] either way; this updates the
-- CHECK constraint and submit_mood_checkin guard, which still enforce each element
-- is between 1 and 5 from migration 00002. Without this, a row containing 6 fails.

create or replace function public.mood_entries_mood_level_values_valid(vals int[])
returns boolean
language sql
immutable
as $$
  select coalesce(bool_and(x between 1 and 6), false)
  from unnest(vals) as u(x);
$$;

comment on column public.mood_entries.mood_level is
  'Multiselect mood levels (1–6) from the first check-in screen.';

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
  if p_mood_level is null or p_mood_level < 1 or p_mood_level > 6 then
    raise exception 'mood_level must be between 1 and 6';
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
