-- Run this in your Supabase SQL Editor

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create profiles table (links to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text check (role in ('admin', 'student')) default 'student',
  created_at timestamptz default now()
);

-- 3. Create students table
create table if not exists public.students (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id), -- Nullable initially, linked when student registers/claims
  nama text not null,
  rombel text,
  nipd text,
  jk text,
  nisn text unique, -- NISN should be unique
  tempat_lahir text,
  tanggal_lahir date,
  nik text,
  agama text,
  alamat text,
  rt text,
  rw text,
  dusun text,
  kelurahan text,
  kecamatan text,
  kode_pos text,
  jenis_tinggal text,
  nama_ayah text,
  nik_ayah text,
  nama_ibu text,
  nik_ibu text,
  is_verified boolean default false,
  verified_at timestamptz,
  created_at timestamptz default now()
);

-- 4. Enable RLS
alter table public.profiles enable row level security;
alter table public.students enable row level security;

-- 5. Helper Function for Admin Check
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 6. Policies for Profiles
-- Users can view own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Admins can view all profiles
create policy "Admins can view all profiles" on public.profiles
  for select using (is_admin());

-- 7. Policies for Students
-- Admins can do everything
create policy "Admins can do everything on students" on public.students
  for all using (is_admin());

-- Students can view their own record (where user_id matches)
create policy "Students can view own record" on public.students
  for select using (auth.uid() = user_id);

-- Students can update their own record (mostly for verification)
create policy "Students can update own record" on public.students
  for update using (auth.uid() = user_id);

-- 8. Trigger to create profile on signup (Optional)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'student');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
