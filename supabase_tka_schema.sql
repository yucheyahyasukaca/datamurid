-- TKA Grades Schema (Based on actual Excel format)
-- This schema supports one row per student with all subject scores

-- Create TKA grades table
create table if not exists public.tka_grades (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  
  -- Mata Pelajaran Wajib (Mandatory Subjects) - URUTAN BENAR
  -- Bahasa Indonesia (PERTAMA)
  bahasa_indonesia_nilai numeric(5,2),
  bahasa_indonesia_kategori text,
  
  -- Matematika (KEDUA)
  matematika_nilai numeric(5,2),
  matematika_kategori text, -- Istimewa, Memadai, Baik, Kurang
  
  -- Bahasa Inggris (KETIGA)
  bahasa_inggris_nilai numeric(5,2),
  bahasa_inggris_kategori text,
  
  -- Total Wajib (sum of 3 mandatory subjects)
  total_wajib numeric(6,2),
  
  -- Mata Pelajaran Pilihan (Elective Subjects)
  -- Pilihan 1
  mapel_pilihan_1 text, -- Nama mata pelajaran pilihan 1
  mapel_pilihan_1_nilai numeric(5,2),
  mapel_pilihan_1_kategori text,
  
  -- Pilihan 2
  mapel_pilihan_2 text, -- Nama mata pelajaran pilihan 2
  mapel_pilihan_2_nilai numeric(5,2),
  mapel_pilihan_2_kategori text,
  
  -- Total score (all 5 subjects)
  total_nilai numeric(6,2),
  
  -- Additional information
  keterangan text, -- Notes/remarks
  tahun_ajaran text, -- Academic year (e.g., "2024/2025")
  semester text, -- Semester (e.g., "Ganjil", "Genap")
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);

-- Create indexes for better query performance
create index if not exists idx_tka_student on public.tka_grades(student_id);
create index if not exists idx_tka_tahun on public.tka_grades(tahun_ajaran);
create index if not exists idx_tka_semester on public.tka_grades(semester);

-- Enable Row Level Security
alter table public.tka_grades enable row level security;

-- RLS Policy: Admins can manage all TKA grades
create policy "Admins can manage all TKA grades" on public.tka_grades
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- RLS Policy: Students can view their own TKA grades
create policy "Students can view own TKA grades" on public.tka_grades
  for select using (
    student_id in (
      select id from public.students where user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
create or replace function public.update_tka_grades_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
drop trigger if exists update_tka_grades_updated_at on public.tka_grades;
create trigger update_tka_grades_updated_at
  before update on public.tka_grades
  for each row
  execute function public.update_tka_grades_updated_at();

-- Comments for documentation
comment on table public.tka_grades is 'Stores TKA (Tes Kemampuan Akademik) test grades with all subjects per student';
comment on column public.tka_grades.matematika_nilai is 'Mathematics score (0-100)';
comment on column public.tka_grades.matematika_kategori is 'Mathematics category (Istimewa, Memadai, Baik, Kurang)';
comment on column public.tka_grades.bahasa_indonesia_nilai is 'Indonesian Language score (0-100)';
comment on column public.tka_grades.bahasa_indonesia_kategori is 'Indonesian Language category';
comment on column public.tka_grades.bahasa_inggris_nilai is 'English Language score (0-100)';
comment on column public.tka_grades.bahasa_inggris_kategori is 'English Language category';
comment on column public.tka_grades.mapel_pilihan_1 is 'First elective subject name';
comment on column public.tka_grades.mapel_pilihan_1_nilai is 'First elective subject score';
comment on column public.tka_grades.mapel_pilihan_1_kategori is 'First elective subject category';
comment on column public.tka_grades.mapel_pilihan_2 is 'Second elective subject name';
comment on column public.tka_grades.mapel_pilihan_2_nilai is 'Second elective subject score';
comment on column public.tka_grades.mapel_pilihan_2_kategori is 'Second elective subject category';
comment on column public.tka_grades.total_nilai is 'Total score across all subjects';
