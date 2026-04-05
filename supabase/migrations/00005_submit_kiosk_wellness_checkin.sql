-- Full kiosk check-in: mood array + optional short/long survey answers (1-based option indices).

create or replace function public.submit_kiosk_wellness_checkin(
  p_access_code text,
  p_mood_levels int[],
  p_short_survey_completed boolean,
  p_long_survey_completed boolean,
  p_sq1 int[],
  p_sq2 int[],
  p_sq3 int[],
  p_lq1 int[],
  p_lq2 int[],
  p_lq3 int[],
  p_lq4 int[],
  p_lq5 int[],
  p_lq6 int[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  sid uuid;
  new_id uuid;
begin
  if p_access_code is null or length(trim(p_access_code)) = 0 then
    raise exception 'access code required';
  end if;
  if p_mood_levels is null or cardinality(p_mood_levels) < 1 then
    raise exception 'mood_levels required';
  end if;
  if not public.mood_entries_mood_level_values_valid(p_mood_levels) then
    raise exception 'invalid mood level';
  end if;

  if p_sq1 is not null and exists (select 1 from unnest(p_sq1) x where x < 1 or x > 6) then
    raise exception 'invalid short survey answer';
  end if;
  if p_sq2 is not null and exists (select 1 from unnest(p_sq2) x where x < 1 or x > 6) then
    raise exception 'invalid short survey answer';
  end if;
  if p_sq3 is not null and exists (select 1 from unnest(p_sq3) x where x < 1 or x > 6) then
    raise exception 'invalid short survey answer';
  end if;

  if p_lq1 is not null and exists (select 1 from unnest(p_lq1) x where x < 1 or x > 5) then
    raise exception 'invalid long survey answer';
  end if;
  if p_lq2 is not null and exists (select 1 from unnest(p_lq2) x where x < 1 or x > 5) then
    raise exception 'invalid long survey answer';
  end if;
  if p_lq3 is not null and exists (select 1 from unnest(p_lq3) x where x < 1 or x > 5) then
    raise exception 'invalid long survey answer';
  end if;
  if p_lq4 is not null and exists (select 1 from unnest(p_lq4) x where x < 1 or x > 5) then
    raise exception 'invalid long survey answer';
  end if;
  if p_lq5 is not null and exists (select 1 from unnest(p_lq5) x where x < 1 or x > 5) then
    raise exception 'invalid long survey answer';
  end if;
  if p_lq6 is not null and exists (select 1 from unnest(p_lq6) x where x < 1 or x > 5) then
    raise exception 'invalid long survey answer';
  end if;

  select id into sid
  from public.shelters
  where access_code = trim(p_access_code);
  if sid is null then
    raise exception 'invalid access code';
  end if;

  insert into public.mood_entries (
    shelter_id,
    mood_level,
    short_survey_completed,
    long_survey_completed,
    sq1_answer,
    sq2_answer,
    sq3_answer,
    lq1_answer,
    lq2_answer,
    lq3_answer,
    lq4_answer,
    lq5_answer,
    lq6_answer
  )
  values (
    sid,
    p_mood_levels,
    coalesce(p_short_survey_completed, false),
    coalesce(p_long_survey_completed, false),
    case when p_short_survey_completed then p_sq1 else null end,
    case when p_short_survey_completed then p_sq2 else null end,
    case when p_short_survey_completed then p_sq3 else null end,
    case when p_long_survey_completed then p_lq1 else null end,
    case when p_long_survey_completed then p_lq2 else null end,
    case when p_long_survey_completed then p_lq3 else null end,
    case when p_long_survey_completed then p_lq4 else null end,
    case when p_long_survey_completed then p_lq5 else null end,
    case when p_long_survey_completed then p_lq6 else null end
  )
  returning id into new_id;
  return new_id;
end;
$$;

-- 10 int[] total: mood + sq1–sq3 + lq1–lq6 (signature must match pg_proc exactly).
revoke all on function public.submit_kiosk_wellness_checkin(
  text, int[], boolean, boolean,
  int[], int[], int[], int[], int[], int[], int[], int[], int[]
) from public;

grant execute on function public.submit_kiosk_wellness_checkin(
  text, int[], boolean, boolean,
  int[], int[], int[], int[], int[], int[], int[], int[], int[]
) to anon, authenticated;
