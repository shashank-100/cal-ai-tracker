-- ============================================================
-- Cal AI — Initial Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

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

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- Auto-create public.users row when auth.users row is created
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

-- Seed achievement definitions
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
