-- ============================================================
-- Cal AI — Row Level Security Policies
-- ============================================================

-- Enable RLS on all user-scoped tables
alter table public.users            enable row level security;
alter table public.plans            enable row level security;
alter table public.food_logs        enable row level security;
alter table public.weight_entries   enable row level security;
alter table public.water_logs       enable row level security;
alter table public.exercise_logs    enable row level security;
alter table public.streaks          enable row level security;
alter table public.user_achievements enable row level security;
alter table public.referrals        enable row level security;

-- food_items and achievements are shared/read-only catalogues
alter table public.food_items   enable row level security;
alter table public.achievements enable row level security;

-- ============================================================
-- USERS
-- ============================================================
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- insert handled by handle_new_user() trigger (security definer)

-- ============================================================
-- PLANS
-- ============================================================
create policy "plans_select_own" on public.plans
  for select using (auth.uid() = user_id);

create policy "plans_insert_own" on public.plans
  for insert with check (auth.uid() = user_id);

create policy "plans_update_own" on public.plans
  for update using (auth.uid() = user_id);

create policy "plans_delete_own" on public.plans
  for delete using (auth.uid() = user_id);

-- ============================================================
-- FOOD ITEMS  (anyone can read; only creator can update their custom items)
-- ============================================================
create policy "food_items_select_all" on public.food_items
  for select using (true);

create policy "food_items_insert_own" on public.food_items
  for insert with check (auth.uid() = created_by);

create policy "food_items_update_own" on public.food_items
  for update using (auth.uid() = created_by and is_verified = false);

-- ============================================================
-- FOOD LOGS
-- ============================================================
create policy "food_logs_select_own" on public.food_logs
  for select using (auth.uid() = user_id);

create policy "food_logs_insert_own" on public.food_logs
  for insert with check (auth.uid() = user_id);

create policy "food_logs_update_own" on public.food_logs
  for update using (auth.uid() = user_id);

create policy "food_logs_delete_own" on public.food_logs
  for delete using (auth.uid() = user_id);

-- ============================================================
-- WEIGHT ENTRIES
-- ============================================================
create policy "weight_entries_select_own" on public.weight_entries
  for select using (auth.uid() = user_id);

create policy "weight_entries_insert_own" on public.weight_entries
  for insert with check (auth.uid() = user_id);

create policy "weight_entries_update_own" on public.weight_entries
  for update using (auth.uid() = user_id);

create policy "weight_entries_delete_own" on public.weight_entries
  for delete using (auth.uid() = user_id);

-- ============================================================
-- WATER LOGS
-- ============================================================
create policy "water_logs_select_own" on public.water_logs
  for select using (auth.uid() = user_id);

create policy "water_logs_insert_own" on public.water_logs
  for insert with check (auth.uid() = user_id);

create policy "water_logs_delete_own" on public.water_logs
  for delete using (auth.uid() = user_id);

-- ============================================================
-- EXERCISE LOGS
-- ============================================================
create policy "exercise_logs_select_own" on public.exercise_logs
  for select using (auth.uid() = user_id);

create policy "exercise_logs_insert_own" on public.exercise_logs
  for insert with check (auth.uid() = user_id);

create policy "exercise_logs_delete_own" on public.exercise_logs
  for delete using (auth.uid() = user_id);

-- ============================================================
-- STREAKS
-- ============================================================
create policy "streaks_select_own" on public.streaks
  for select using (auth.uid() = user_id);

create policy "streaks_insert_own" on public.streaks
  for insert with check (auth.uid() = user_id);

create policy "streaks_update_own" on public.streaks
  for update using (auth.uid() = user_id);

-- ============================================================
-- ACHIEVEMENTS  (public read-only)
-- ============================================================
create policy "achievements_select_all" on public.achievements
  for select using (true);

-- ============================================================
-- USER ACHIEVEMENTS
-- ============================================================
create policy "user_achievements_select_own" on public.user_achievements
  for select using (auth.uid() = user_id);

-- inserts done server-side via service role key only

-- ============================================================
-- REFERRALS
-- ============================================================
create policy "referrals_select_own" on public.referrals
  for select using (auth.uid() = referrer_id or auth.uid() = referred_id);

create policy "referrals_insert_own" on public.referrals
  for insert with check (auth.uid() = referrer_id);
