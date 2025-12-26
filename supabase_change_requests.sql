-- Create enum for request status
create type request_status as enum ('REQUESTED', 'EDITING', 'REVIEW', 'APPROVED', 'REJECTED');

-- Create student_change_requests table
create table if not exists public.student_change_requests (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) not null,
  status request_status default 'REQUESTED',
  request_reason text,
  admin_notes text,
  original_data jsonb, -- Snapshot of student data before changes
  proposed_changes jsonb, -- The new data submitted by student
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.student_change_requests enable row level security;

-- Policies
-- Admin can view all
create policy "Admins can view all change requests" on public.student_change_requests
  for all using (is_admin());

-- Students can view their own
create policy "Students can view own change requests" on public.student_change_requests
  for select using (
    exists (
      select 1 from public.students
      where students.id = student_change_requests.student_id
      and students.user_id = auth.uid()
    )
  );

-- Students can insert (request change)
create policy "Students can create change requests" on public.student_change_requests
  for insert with check (
    exists (
      select 1 from public.students
      where students.id = student_change_requests.student_id
      and students.user_id = auth.uid()
    )
  );

-- Students can update their own (submit changes)
create policy "Students can update own change requests" on public.student_change_requests
  for update using (
    exists (
      select 1 from public.students
      where students.id = student_change_requests.student_id
      and students.user_id = auth.uid()
    )
  );
