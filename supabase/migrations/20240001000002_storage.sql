-- ============================================================
-- Cal AI — Storage Buckets
-- ============================================================

-- Food photo uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'food-photos',
  'food-photos',
  false,
  10485760,  -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- Avatar uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,   -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ============================================================
-- Storage RLS Policies
-- ============================================================

-- food-photos: users can only access their own folder (user_id/filename)
create policy "food_photos_select_own" on storage.objects
  for select using (
    bucket_id = 'food-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "food_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'food-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "food_photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'food-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- avatars: public read, own write
create policy "avatars_select_all" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
