-- PDSS Grades Schema (Clean Slate)
-- Updated: Added is_published column and new Status options

-- 1. Drop existing objects
DROP POLICY IF EXISTS "Admins can manage all PDSS grades" ON public.pdss_grades;
DROP POLICY IF EXISTS "Students can view own PDSS grades" ON public.pdss_grades;
DROP TRIGGER IF EXISTS update_pdss_grades_updated_at ON public.pdss_grades;
DROP TABLE IF EXISTS public.pdss_grades CASCADE;

-- 2. Create PDSS grades table
create table public.pdss_grades (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  
  -- Scores
  total_semua_mapel numeric(7,2),
  total_3_mapel_utama numeric(6,2),
  total_mapel_pilihan numeric(6,2),
  
  -- Ranking and Status
  peringkat integer,
  -- Status: Eligible, Tidak Eligible, Mengundurkan Diri
  status text check (status in ('Eligible', 'Tidak Eligible', 'Mengundurkan Diri')), 
  
  -- Visibility Toggle
  is_published boolean default false,       -- NEW: Toggle visibility to students
  
  -- Additional information
  tahun_ajaran text,
  semester text,
  keterangan text,
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);

-- 3. Indexes
create index idx_pdss_student on public.pdss_grades(student_id);
create index idx_pdss_tahun on public.pdss_grades(tahun_ajaran);

-- 4. RLS
alter table public.pdss_grades enable row level security;

create policy "Admins can manage all PDSS grades" on public.pdss_grades
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Only allow students to view published grades
create policy "Students can view own PDSS grades" on public.pdss_grades
  for select using (
    student_id in (
      select id from public.students where user_id = auth.uid()
    )
    and is_published = true  -- Only see if published
  );

-- 5. Trigger
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

-- 6. Comments
comment on column public.pdss_grades.status is 'Status: Eligible, Tidak Eligible, Mengundurkan Diri';
comment on column public.pdss_grades.is_published is 'Visibility toggle for students';
