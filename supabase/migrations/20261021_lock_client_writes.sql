-- PairFit migration — lock down client writes (run ONCE on existing databases).
-- Supabase dashboard -> SQL Editor -> paste -> Run. Safe to re-run.
--
-- Why: the old "for all" policies let any signed-in user insert rows into
-- public.items and upload files to their storage folder directly with their
-- own JWT, skipping the API's free-plan item limit. The Supabase gateway is
-- publicly reachable, so these policies are the real protection. The API uses
-- the service_role key (bypasses RLS), so clients only ever need READ access.

begin;

-- ---------------------------------------------------------------- items
-- public.items belongs to PairFit alone: drop EVERY policy on it (including any
-- made by hand in the dashboard under another name), then recreate read-only.
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'items' loop
    execute format('drop policy %I on public.items', p.policyname);
  end loop;
end $$;

create policy "users read own items" on public.items
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------- storage
-- storage.objects is shared by every bucket, so only drop write policies that
-- mention the 'wardrobe' bucket (this covers the old "users manage own photos").
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'storage' and tablename = 'objects' and cmd <> 'SELECT'
             and (coalesce(qual, '') || ' ' || coalesce(with_check, '')) like '%wardrobe%' loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end $$;

drop policy if exists "users read own photos" on storage.objects;
create policy "users read own photos" on storage.objects
  for select using (
    bucket_id = 'wardrobe'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

commit;

-- ---------------------------------------------------------------- check
-- Expected: public.items has ONE policy (SELECT). On storage.objects, any
-- remaining INSERT / UPDATE / DELETE / ALL policy that applies to every bucket
-- still lets users upload to 'wardrobe' directly: review it and drop it.
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where (schemaname = 'public' and tablename = 'items')
   or (schemaname = 'storage' and tablename = 'objects')
order by tablename, cmd, policyname;
