-- Kasa Vaas moodboard backend setup
-- Run this in Supabase SQL Editor after creating your project.

create table if not exists public.inspirations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  space text not null check (space in ('Residential','Hospitality','Commercial','Speciality')),
  style text,
  location text,
  description text,
  image_url text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.inspirations enable row level security;

drop policy if exists "Public can view inspirations" on public.inspirations;
create policy "Public can view inspirations"
on public.inspirations for select
using (true);

drop policy if exists "Owner can add inspirations" on public.inspirations;
create policy "Owner can add inspirations"
on public.inspirations for insert
to authenticated
with check (
  auth.jwt() ->> 'email' = 'kashvi.saxenaks@gmail.com'
  and created_by = auth.uid()
);

drop policy if exists "Owner can update inspirations" on public.inspirations;
create policy "Owner can update inspirations"
on public.inspirations for update
to authenticated
using (auth.jwt() ->> 'email' = 'kashvi.saxenaks@gmail.com')
with check (auth.jwt() ->> 'email' = 'kashvi.saxenaks@gmail.com');

drop policy if exists "Owner can delete inspirations" on public.inspirations;
create policy "Owner can delete inspirations"
on public.inspirations for delete
to authenticated
using (auth.jwt() ->> 'email' = 'kashvi.saxenaks@gmail.com');

insert into storage.buckets (id, name, public)
values ('inspiration', 'inspiration', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view inspiration images" on storage.objects;
create policy "Public can view inspiration images"
on storage.objects for select
using (bucket_id = 'inspiration');

drop policy if exists "Owner can upload inspiration images" on storage.objects;
create policy "Owner can upload inspiration images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'inspiration'
  and auth.jwt() ->> 'email' = 'kashvi.saxenaks@gmail.com'
);

drop policy if exists "Owner can update inspiration images" on storage.objects;
create policy "Owner can update inspiration images"
on storage.objects for update
to authenticated
using (bucket_id = 'inspiration' and auth.jwt() ->> 'email' = 'kashvi.saxenaks@gmail.com')
with check (bucket_id = 'inspiration' and auth.jwt() ->> 'email' = 'kashvi.saxenaks@gmail.com');

drop policy if exists "Owner can delete inspiration images" on storage.objects;
create policy "Owner can delete inspiration images"
on storage.objects for delete
to authenticated
using (bucket_id = 'inspiration' and auth.jwt() ->> 'email' = 'kashvi.saxenaks@gmail.com');