-- Migration: user_roles table for admin + beta tester system
-- Run this in Supabase SQL Editor or via supabase migrations

-- 1. Create the user_roles table
create table if not exists public.user_roles (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  role     text not null default 'user' check (role in ('user', 'beta_tester', 'admin')),
  updated_at timestamptz not null default now()
);

-- 2. Enable RLS
alter table public.user_roles enable row level security;

-- 3. Users can read their own role
create policy "users_read_own_role"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- 4. Only admins can read all roles (used by admin panel)
create policy "admins_read_all_roles"
  on public.user_roles for select
  using (
    exists (
      select 1 from public.user_roles r
      where r.user_id = auth.uid() and r.role = 'admin'
    )
  );

-- 5. Only admins can insert/update roles
create policy "admins_manage_roles"
  on public.user_roles for all
  using (
    exists (
      select 1 from public.user_roles r
      where r.user_id = auth.uid() and r.role = 'admin'
    )
  );

-- 6. Seed yourself as the first admin (replace with your actual user UUID from Supabase Auth)
-- insert into public.user_roles (user_id, role)
-- values ('YOUR-USER-UUID-HERE', 'admin')
-- on conflict (user_id) do update set role = 'admin';
