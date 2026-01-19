-- Academic Test Grades Schema
-- Run this in your Supabase SQL Editor

-- 1. Create grades table
create table if not exists public.academic_test_grades (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  
  -- Test information
  test_name text not null,                    -- Nama tes (e.g., "TKA 2025", "Tes Peminatan")
  subject text not null,                      -- Mata pelajaran/kategori
  score numeric(5,2),                         -- Nilai (e.g., 82.08, 49.93)
  grade text,                                 -- Grade/Status (e.g., "Baik", "Memadai")
  
  -- Metadata
  test_date date,                             -- Tanggal tes
  semester text,                              -- Semester (e.g., "1", "2", "Ganjil", "Genap")
  school_year text,                           -- Tahun ajaran (e.g., "2024/2025")
  notes text,                                 -- Catatan tambahan
  
  -- Tracking
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references public.profiles(id)  -- Admin yang menambahkan
);

-- 2. Create indexes for performance
create index if not exists idx_grades_student on public.academic_test_grades(student_id);
create index if not exists idx_grades_test on public.academic_test_grades(test_name);
create index if not exists idx_grades_subject on public.academic_test_grades(subject);
create index if not exists idx_grades_created on public.academic_test_grades(created_at desc);

-- 3. Enable RLS
alter table public.academic_test_grades enable row level security;

-- 4. RLS Policies

-- Admin can do everything
create policy "Admins can manage all grades" on public.academic_test_grades
  for all using (is_admin());

-- Students can view their own grades
create policy "Students can view own grades" on public.academic_test_grades
  for select using (
    student_id in (
      select id from public.students where user_id = auth.uid()
    )
  );

-- 5. Trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_grades_updated_at on public.academic_test_grades;
create trigger update_grades_updated_at
  before update on public.academic_test_grades
  for each row execute procedure update_updated_at_column();

-- 6. Optional: Add some sample data for testing
-- Uncomment the lines below if you want to add test data
/*
insert into public.academic_test_grades (student_id, test_name, subject, score, grade, test_date, semester, school_year)
select 
  id,
  'TKA 2025',
  'Matematika',
  round((random() * 40 + 60)::numeric, 2),
  case 
    when random() > 0.7 then 'Baik'
    when random() > 0.4 then 'Memadai'
    else 'Cukup'
  end,
  current_date - (random() * 30)::int,
  'Ganjil',
  '2024/2025'
from public.students
limit 10;
*/
