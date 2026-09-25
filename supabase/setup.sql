-- Seesaw 觀影筆記：Supabase 資料庫設定（和 CutiCuti、FooooooD 共用同一個專案，但資料表、照片空間都分開）
-- 用法：Supabase 專案 → SQL Editor → New query → 貼上全部 → Run
-- 可以重複執行，不會重複建立，也不會動到其他 App 的資料

-- 1. 心得資料表：每部片一列，內容整包存在 data（JSON）
create table if not exists public.seesaw_reviews (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- 2. 權限：每個人只能看到、修改自己的心得
alter table public.seesaw_reviews enable row level security;

drop policy if exists "seesaw 只能讀自己的心得" on public.seesaw_reviews;
create policy "seesaw 只能讀自己的心得" on public.seesaw_reviews
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "seesaw 只能新增自己的心得" on public.seesaw_reviews;
create policy "seesaw 只能新增自己的心得" on public.seesaw_reviews
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "seesaw 只能修改自己的心得" on public.seesaw_reviews;
create policy "seesaw 只能修改自己的心得" on public.seesaw_reviews
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "seesaw 只能刪除自己的心得" on public.seesaw_reviews;
create policy "seesaw 只能刪除自己的心得" on public.seesaw_reviews
  for delete to authenticated using (user_id = auth.uid());

-- 3. 海報／票根照片儲存空間（不公開），每個人的照片放在以自己 user id 命名的資料夾
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('seesaw-posters', 'seesaw-posters', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

drop policy if exists "seesaw 只能讀自己的照片" on storage.objects;
create policy "seesaw 只能讀自己的照片" on storage.objects
  for select to authenticated
  using (bucket_id = 'seesaw-posters' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "seesaw 只能上傳自己的照片" on storage.objects;
create policy "seesaw 只能上傳自己的照片" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'seesaw-posters' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "seesaw 只能覆蓋自己的照片" on storage.objects;
create policy "seesaw 只能覆蓋自己的照片" on storage.objects
  for update to authenticated
  using (bucket_id = 'seesaw-posters' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'seesaw-posters' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "seesaw 只能刪除自己的照片" on storage.objects;
create policy "seesaw 只能刪除自己的照片" on storage.objects
  for delete to authenticated
  using (bucket_id = 'seesaw-posters' and (storage.foldername(name))[1] = auth.uid()::text);
