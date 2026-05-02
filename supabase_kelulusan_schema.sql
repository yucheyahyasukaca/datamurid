-- supabase_kelulusan_schema.sql
-- Prasyarat: supabase_schema.sql harus dijalankan terlebih dahulu
-- (mendefinisikan is_admin(), uuid-ossp extension, dan tabel profiles/students)

-- 1. Tabel graduation_records
create table if not exists public.graduation_records (
  id            uuid default gen_random_uuid() primary key,
  nisn          text not null unique,
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

-- 3. Index untuk lookup cepat by NISN
create index if not exists idx_graduation_records_nisn on public.graduation_records(nisn);

-- 4. Enable RLS
alter table public.graduation_records enable row level security;
alter table public.app_settings enable row level security;

-- 5. Policies graduation_records
create policy "Admins full access graduation_records" on public.graduation_records
  for all using (is_admin());

create policy "Anyone can read graduation_records" on public.graduation_records
  for select using (true);

-- 6. Policies app_settings
create policy "Admins full access app_settings" on public.app_settings
  for all using (is_admin());

create policy "Anyone can read app_settings" on public.app_settings
  for select using (true);
