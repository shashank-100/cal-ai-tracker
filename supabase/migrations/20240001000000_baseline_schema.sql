-- ============================================================
-- Cal AI — Baseline schema (consolidated, idempotent)
--
-- Single source of truth for cal-ai's own database objects, squashed
-- from the original 6 migrations (schema, RLS, storage, usage logs,
-- usage RPCs, profile backfill). Every statement is idempotent
-- (if-not-exists / or-replace / drop-if-exists), so this is safe to
-- run on a fresh database OR re-run against an existing one.
--
-- Note: this project's database is shared with unrelated apps; this
-- file intentionally defines ONLY cal-ai's tables/policies/functions.
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- ============================================================
-- Shared helper: auto-update updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- USERS
-- ============================================================
create table if not exists public.users (
  id                       uuid primary key references auth.users(id) on delete cascade,
  email                    text unique not null,
  full_name                text,
  avatar_url               text,
  gender                   text,
  birthday                 date,
  height_cm                numeric(5,1),
  weight_kg                numeric(5,1),
  goal                     text,
  desired_weight_kg        numeric(5,1),
  weight_speed_kg_week     numeric(3,2),
  workouts_per_week        int,
  diet_preference          text,
  blocker                  text,
  accomplish               text,
  rollover_calories        boolean default false,
  add_calories_burned      boolean default true,
  referral_source          text,
  referral_code_used       text,
  metric                   boolean default true,
  notification_preferences jsonb default '{}'::jsonb,
  preferences              jsonb default '{}'::jsonb,
  onboarding_complete      boolean default false,
  subscription_tier        text default 'free',
  subscription_expires_at  timestamptz,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- Auto-create public.users row when an auth.users row is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- PLANS
-- ============================================================
create table if not exists public.plans (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  calories_target  int not null,
  protein_g        int not null,
  carbs_g          int not null,
  fat_g            int not null,
  tdee             int,
  bmr              int,
  activity_factor  numeric(3,2),
  deficit_surplus  int,
  weeks_to_goal    int,
  is_active        boolean default true,
  generated_at     timestamptz default now(),
  created_at       timestamptz default now()
);

create index if not exists plans_user_id_idx on public.plans(user_id);
create index if not exists plans_active_idx  on public.plans(user_id, is_active) where is_active = true;

-- ============================================================
-- FOOD ITEMS  (shared catalogue)
-- ============================================================
create table if not exists public.food_items (
  id                    uuid primary key default gen_random_uuid(),
  external_id           text,
  source                text,   -- 'usda' | 'openfoodfacts' | 'user'
  name                  text not null,
  brand                 text,
  barcode               text,
  calories_per_100g     numeric(7,2),
  protein_per_100g      numeric(7,2),
  carbs_per_100g        numeric(7,2),
  fat_per_100g          numeric(7,2),
  fiber_per_100g        numeric(7,2),
  sugar_per_100g        numeric(7,2),
  sodium_per_100g       numeric(7,2),
  saturated_fat_per_100g numeric(7,2),
  created_by            uuid references public.users(id),
  is_verified           boolean default false,
  created_at            timestamptz default now()
);

create index if not exists food_items_name_trgm_idx on public.food_items using gin(name gin_trgm_ops);
create index if not exists food_items_barcode_idx    on public.food_items(barcode) where barcode is not null;
create index if not exists food_items_external_idx   on public.food_items(external_id, source);

-- ============================================================
-- FOOD LOGS
-- ============================================================
create table if not exists public.food_logs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  food_item_id     uuid references public.food_items(id),
  log_date         date not null,
  meal_type        text not null,   -- 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_name        text not null,
  calories         numeric(7,1) not null,
  protein_g        numeric(6,2),
  carbs_g          numeric(6,2),
  fat_g            numeric(6,2),
  fiber_g          numeric(6,2),
  sugar_g          numeric(6,2),
  serving_qty      numeric(6,2) default 1,
  serving_unit     text default 'g',
  photo_url        text,
  ai_confidence    numeric(3,2),
  ai_raw_response  jsonb,
  notes            text,
  logged_at        timestamptz default now(),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists food_logs_user_date_idx on public.food_logs(user_id, log_date);
create index if not exists food_logs_date_idx      on public.food_logs(log_date);

drop trigger if exists food_logs_updated_at on public.food_logs;
create trigger food_logs_updated_at
  before update on public.food_logs
  for each row execute function public.set_updated_at();

-- ============================================================
-- WEIGHT ENTRIES
-- ============================================================
create table if not exists public.weight_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  weight_kg  numeric(5,2) not null,
  log_date   date not null,
  notes      text,
  created_at timestamptz default now(),
  unique(user_id, log_date)
);

create index if not exists weight_entries_user_date_idx on public.weight_entries(user_id, log_date);

-- ============================================================
-- WATER LOGS
-- ============================================================
create table if not exists public.water_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  log_date   date not null,
  amount_ml  int not null,
  logged_at  timestamptz default now()
);

create index if not exists water_logs_user_date_idx on public.water_logs(user_id, log_date);

-- ============================================================
-- EXERCISE LOGS
-- ============================================================
create table if not exists public.exercise_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  log_date        date not null,
  activity_name   text not null,
  duration_min    int,
  calories_burned int not null,
  source          text default 'manual',
  created_at      timestamptz default now()
);

create index if not exists exercise_logs_user_date_idx on public.exercise_logs(user_id, log_date);

-- ============================================================
-- STREAKS
-- ============================================================
create table if not exists public.streaks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade unique,
  current_streak  int default 0,
  longest_streak  int default 0,
  last_log_date   date,
  updated_at      timestamptz default now()
);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
create table if not exists public.achievements (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  name        text not null,
  description text,
  icon_url    text
);

insert into public.achievements (key, name, description) values
  ('first_log',  'First Bite',     'Log your first meal'),
  ('streak_3',   'Hat Trick',      'Log 3 days in a row'),
  ('streak_7',   'Week Warrior',   'Log 7 days in a row'),
  ('streak_30',  'Monthly Master', 'Log 30 days in a row'),
  ('photos_10',  'Snap Happy',     'Log 10 meals with a photo'),
  ('goal_hit',   'Goal Crusher',   'Reach your target weight'),
  ('logs_100',   'Century Club',   'Log 100 meals total')
on conflict (key) do nothing;

-- ============================================================
-- USER ACHIEVEMENTS
-- ============================================================
create table if not exists public.user_achievements (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id),
  unlocked_at    timestamptz default now(),
  unique(user_id, achievement_id)
);

create index if not exists user_achievements_user_idx on public.user_achievements(user_id);

-- ============================================================
-- REFERRALS
-- ============================================================
create table if not exists public.referrals (
  id              uuid primary key default gen_random_uuid(),
  referrer_id     uuid not null references public.users(id) on delete cascade,
  referred_id     uuid references public.users(id),
  referral_code   text unique not null,
  status          text default 'pending',   -- 'pending' | 'completed' | 'rewarded'
  reward_granted  boolean default false,
  created_at      timestamptz default now(),
  completed_at    timestamptz
);

create index if not exists referrals_code_idx     on public.referrals(referral_code);
create index if not exists referrals_referrer_idx on public.referrals(referrer_id);

-- ============================================================
-- USAGE LOGS  (AI token accounting)
-- ============================================================
create table if not exists public.usage_logs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  model         text not null,
  purpose       text not null,
  input_tokens  int not null,
  output_tokens int not null,
  total_tokens  int not null
);

-- ============================================================
-- USAGE AGGREGATION RPCs
-- ============================================================
create or replace function public.usage_summary()
returns table (total_input bigint, total_output bigint, total_tokens bigint, total_calls bigint)
language sql security definer as $$
  select
    coalesce(sum(input_tokens), 0)::bigint,
    coalesce(sum(output_tokens), 0)::bigint,
    coalesce(sum(total_tokens), 0)::bigint,
    count(*)::bigint
  from public.usage_logs;
$$;

create or replace function public.usage_by_model()
returns table (model text, total_input bigint, total_output bigint, calls bigint)
language sql security definer as $$
  select
    model,
    coalesce(sum(input_tokens), 0)::bigint,
    coalesce(sum(output_tokens), 0)::bigint,
    count(*)::bigint
  from public.usage_logs
  group by model;
$$;

create or replace function public.usage_by_purpose()
returns table (purpose text, total_input bigint, total_output bigint, calls bigint)
language sql security definer as $$
  select
    purpose,
    coalesce(sum(input_tokens), 0)::bigint,
    coalesce(sum(output_tokens), 0)::bigint,
    count(*)::bigint
  from public.usage_logs
  group by purpose;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users             enable row level security;
alter table public.plans             enable row level security;
alter table public.food_items        enable row level security;
alter table public.food_logs         enable row level security;
alter table public.weight_entries    enable row level security;
alter table public.water_logs        enable row level security;
alter table public.exercise_logs     enable row level security;
alter table public.streaks           enable row level security;
alter table public.achievements      enable row level security;
alter table public.user_achievements enable row level security;
alter table public.referrals         enable row level security;
alter table public.usage_logs        enable row level security;

-- USERS — insert handled by handle_new_user() trigger (security definer)
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users for select using (auth.uid() = id);
drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- PLANS
drop policy if exists "plans_select_own" on public.plans;
create policy "plans_select_own" on public.plans for select using (auth.uid() = user_id);
drop policy if exists "plans_insert_own" on public.plans;
create policy "plans_insert_own" on public.plans for insert with check (auth.uid() = user_id);
drop policy if exists "plans_update_own" on public.plans;
create policy "plans_update_own" on public.plans for update using (auth.uid() = user_id);
drop policy if exists "plans_delete_own" on public.plans;
create policy "plans_delete_own" on public.plans for delete using (auth.uid() = user_id);

-- FOOD ITEMS (anyone reads; only creator edits their custom items)
drop policy if exists "food_items_select_all" on public.food_items;
create policy "food_items_select_all" on public.food_items for select using (true);
drop policy if exists "food_items_insert_own" on public.food_items;
create policy "food_items_insert_own" on public.food_items for insert with check (auth.uid() = created_by);
drop policy if exists "food_items_update_own" on public.food_items;
create policy "food_items_update_own" on public.food_items for update using (auth.uid() = created_by and is_verified = false);

-- FOOD LOGS
drop policy if exists "food_logs_select_own" on public.food_logs;
create policy "food_logs_select_own" on public.food_logs for select using (auth.uid() = user_id);
drop policy if exists "food_logs_insert_own" on public.food_logs;
create policy "food_logs_insert_own" on public.food_logs for insert with check (auth.uid() = user_id);
drop policy if exists "food_logs_update_own" on public.food_logs;
create policy "food_logs_update_own" on public.food_logs for update using (auth.uid() = user_id);
drop policy if exists "food_logs_delete_own" on public.food_logs;
create policy "food_logs_delete_own" on public.food_logs for delete using (auth.uid() = user_id);

-- WEIGHT ENTRIES
drop policy if exists "weight_entries_select_own" on public.weight_entries;
create policy "weight_entries_select_own" on public.weight_entries for select using (auth.uid() = user_id);
drop policy if exists "weight_entries_insert_own" on public.weight_entries;
create policy "weight_entries_insert_own" on public.weight_entries for insert with check (auth.uid() = user_id);
drop policy if exists "weight_entries_update_own" on public.weight_entries;
create policy "weight_entries_update_own" on public.weight_entries for update using (auth.uid() = user_id);
drop policy if exists "weight_entries_delete_own" on public.weight_entries;
create policy "weight_entries_delete_own" on public.weight_entries for delete using (auth.uid() = user_id);

-- WATER LOGS
drop policy if exists "water_logs_select_own" on public.water_logs;
create policy "water_logs_select_own" on public.water_logs for select using (auth.uid() = user_id);
drop policy if exists "water_logs_insert_own" on public.water_logs;
create policy "water_logs_insert_own" on public.water_logs for insert with check (auth.uid() = user_id);
drop policy if exists "water_logs_delete_own" on public.water_logs;
create policy "water_logs_delete_own" on public.water_logs for delete using (auth.uid() = user_id);

-- EXERCISE LOGS
drop policy if exists "exercise_logs_select_own" on public.exercise_logs;
create policy "exercise_logs_select_own" on public.exercise_logs for select using (auth.uid() = user_id);
drop policy if exists "exercise_logs_insert_own" on public.exercise_logs;
create policy "exercise_logs_insert_own" on public.exercise_logs for insert with check (auth.uid() = user_id);
drop policy if exists "exercise_logs_delete_own" on public.exercise_logs;
create policy "exercise_logs_delete_own" on public.exercise_logs for delete using (auth.uid() = user_id);

-- STREAKS
drop policy if exists "streaks_select_own" on public.streaks;
create policy "streaks_select_own" on public.streaks for select using (auth.uid() = user_id);
drop policy if exists "streaks_insert_own" on public.streaks;
create policy "streaks_insert_own" on public.streaks for insert with check (auth.uid() = user_id);
drop policy if exists "streaks_update_own" on public.streaks;
create policy "streaks_update_own" on public.streaks for update using (auth.uid() = user_id);

-- ACHIEVEMENTS (public read-only)
drop policy if exists "achievements_select_all" on public.achievements;
create policy "achievements_select_all" on public.achievements for select using (true);

-- USER ACHIEVEMENTS (inserts done server-side via service role only)
drop policy if exists "user_achievements_select_own" on public.user_achievements;
create policy "user_achievements_select_own" on public.user_achievements for select using (auth.uid() = user_id);

-- REFERRALS
drop policy if exists "referrals_select_own" on public.referrals;
create policy "referrals_select_own" on public.referrals
  for select using (auth.uid() = referrer_id or auth.uid() = referred_id);
drop policy if exists "referrals_insert_own" on public.referrals;
create policy "referrals_insert_own" on public.referrals
  for insert with check (auth.uid() = referrer_id);

-- ============================================================
-- STORAGE BUCKETS + POLICIES
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('food-photos', 'food-photos', false, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "food_photos_select_own" on storage.objects;
create policy "food_photos_select_own" on storage.objects
  for select using (bucket_id = 'food-photos' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "food_photos_insert_own" on storage.objects;
create policy "food_photos_insert_own" on storage.objects
  for insert with check (bucket_id = 'food-photos' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "food_photos_delete_own" on storage.objects;
create policy "food_photos_delete_own" on storage.objects
  for delete using (bucket_id = 'food-photos' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "avatars_select_all" on storage.objects;
create policy "avatars_select_all" on storage.objects
  for select using (bucket_id = 'avatars');
drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- BACKFILL: ensure every existing auth user has a profile row
-- ============================================================
insert into public.users (id, email)
select au.id, au.email
from auth.users au
left join public.users pu on pu.id = au.id
where pu.id is null
on conflict (id) do nothing;
