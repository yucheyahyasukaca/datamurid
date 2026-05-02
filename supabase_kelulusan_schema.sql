-- supabase_kelulusan_schema.sql
-- Jalankan di Supabase SQL Editor

-- 1. Tabel graduation_records
create table if not exists public.graduation_records (
  id            uuid default uuid_generate_v4() primary key,
  nisn          text not null,
  nama          text,
  tanggal_lahir text,
  no_ujian      text,
  kota          text,
  agama         text,
  kelas         text,
  status        text check (status in ('LULUS', 'TIDAK LULUS')),
  created_at    timestamptz default now()
);

-- 2. Tabel app_settings (key-value untuk konfigurasi sistem)
create table if not exists public.app_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);

-- 3. Enable RLS
alter table public.graduation_records enable row level security;
alter table public.app_settings enable row level security;

-- 4. Policies graduation_records
create policy "Admins full access graduation_records" on public.graduation_records
  for all using (is_admin());

create policy "Anyone can read graduation_records" on public.graduation_records
  for select using (true);

-- 5. Policies app_settings
create policy "Admins full access app_settings" on public.app_settings
  for all using (is_admin());

create policy "Anyone can read app_settings" on public.app_settings
  for select using (true);
