-- PairFit Supabase schema — run ONCE in the Supabase SQL editor
-- (Coolify one-click Supabase dashboard -> SQL Editor -> paste -> Run).
--
-- Creates:
--   public.profiles  -> plan info per user (auto-created on signup)
--   public.items     -> the wardrobe
--   storage bucket "wardrobe" (private) for clothing photos

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  is_pro     boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- items
create table if not exists public.items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null default 'Untitled',
  category   text not null,
  color_hex  text not null,
  h          numeric not null,
  s          numeric not null,
  l          numeric not null,
  photo_path text not null,            -- path inside the "wardrobe" bucket
  created_at timestamptz not null default now()
);
create index if not exists items_user_id_idx on public.items(user_id);

-- ---------------------------------------------------------------- auto profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- RLS
-- (Defense in depth: the API uses the service_role key and enforces the
--  user itself; these policies also allow future direct client access.)
alter table public.profiles enable row level security;
alter table public.items enable row level security;

drop policy if exists "users manage own items" on public.items;
create policy "users manage own items" on public.items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id);

-- ---------------------------------------------------------------- storage
insert into storage.buckets (id, name, public)
values ('wardrobe', 'wardrobe', false)
on conflict (id) do nothing;

drop policy if exists "users manage own photos" on storage.objects;
create policy "users manage own photos" on storage.objects
  for all
  using (
    bucket_id = 'wardrobe'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'wardrobe'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
-- Photos are stored at: wardrobe/<user_id>/<uuid>.jpg
