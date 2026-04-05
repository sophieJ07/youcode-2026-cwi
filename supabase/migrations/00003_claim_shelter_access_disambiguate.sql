-- RETURNS TABLE (shelter_id, …) defines PL/pgSQL variables that shadow real columns,
-- so INSERT … (user_id, shelter_id) ON CONFLICT (user_id, shelter_id) errors with
-- "column reference shelter_id is ambiguous". Run the insert via EXECUTE so names
-- are parsed as SQL only.

create or replace function public.claim_shelter_access(p_access_code text)
returns table (shelter_id uuid, shelter_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  sid uuid;
  sname text;
  uid uuid;
begin
  uid := auth.uid();
  if uid is null then
    raise exception 'not authenticated';
  end if;
  select s.id, s.name into sid, sname
  from public.shelters s
  where s.access_code = p_access_code;
  if sid is null then
    raise exception 'invalid access code';
  end if;
  execute $sql$
    insert into public.user_shelter_access (user_id, shelter_id)
    values ($1, $2)
    on conflict (user_id, shelter_id) do nothing
  $sql$
  using uid, sid;
  return query select sid, sname;
end;
$$;
