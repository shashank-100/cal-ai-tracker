-- ============================================================
-- Ensure every auth user has a public.users profile row.
--
-- The handle_new_user() trigger (initial_schema) auto-creates a
-- profile on signup, but:
--   * users who signed up before the trigger existed (or on a
--     project where it was never applied) have no profile row, and
--   * GET /profile returns 404 "Profile not found" for them,
--     surfacing as "Could not load profile" in the app.
--
-- This migration backfills missing rows and re-asserts the trigger
-- so it is idempotent and safe to re-run.
-- ============================================================

-- 1) Backfill: create a profile for any auth user missing one.
insert into public.users (id, email)
select au.id, au.email
from auth.users au
left join public.users pu on pu.id = au.id
where pu.id is null
on conflict (id) do nothing;

-- 2) Re-assert the auto-create function + trigger for future signups.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
