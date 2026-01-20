-- PDSS Grades Schema (Clean Slate)
-- WARNING: This script will delete existing PDSS grades data if the table exists.
-- We do this to ensure the columns match the new requirements.

-- 1. Drop existing objects to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage all PDSS grades" ON public.pdss_grades;
DROP POLICY IF EXISTS "Students can view own PDSS grades" ON public.pdss_grades;
DROP TRIGGER IF EXISTS update_pdss_grades_updated_at ON public.pdss_grades;
DROP TABLE IF EXISTS public.pdss_grades CASCADE;

-- 2. Create PDSS grades table with NEW columns
create table public.pdss_grades (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  
  -- Scores
  total_semua_mapel numeric(7,2),           -- 3. Jumlah Nilai Semua Mapel (SMT 1 - 5)
  total_3_mapel_utama numeric(6,2),         -- 4. Jumlah 3 Mapel Utama (B.Indo, Mat Umum, B.Ing)
  total_mapel_pilihan numeric(6,2),         -- 5. Jumlah Mapel Pilihan (SMT 3-5)
  
  -- Ranking
  peringkat integer,                        -- 6. Peringkat di PDSS
  
  -- Additional information
  tahun_ajaran text,                        -- Academic year (e.g., "2024/2025")
  semester text,                            -- Semester/Period info
  keterangan text,                          -- Notes
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);

-- 3. Create indexes
create index idx_pdss_student on public.pdss_grades(student_id);
create index idx_pdss_tahun on public.pdss_grades(tahun_ajaran);

-- 4. Enable RLS
alter table public.pdss_grades enable row level security;

-- 5. Create Policies
create policy "Admins can manage all PDSS grades" on public.pdss_grades
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Students can view own PDSS grades" on public.pdss_grades
  for select using (
    student_id in (
      select id from public.students where user_id = auth.uid()
    )
  );

-- 6. Trigger for updated_at
create or replace function public.update_pdss_grades_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_pdss_grades_updated_at
  before update on public.pdss_grades
  for each row
  execute function public.update_pdss_grades_updated_at();

-- 7. Comments
comment on table public.pdss_grades is 'Stores PDSS grades with specific accumulated scores';
comment on column public.pdss_grades.total_semua_mapel is 'Jumlah Nilai Semua Mapel (SMT 1 - 5)';
comment on column public.pdss_grades.total_3_mapel_utama is 'Jumlah 3 Mapel Utama (B.Indo, Mat Umum, B.Ing)';
comment on column public.pdss_grades.total_mapel_pilihan is 'Jumlah Mapel Pilihan (SMT 3-5)';
comment on column public.pdss_grades.peringkat is 'Peringkat di PDSS';
