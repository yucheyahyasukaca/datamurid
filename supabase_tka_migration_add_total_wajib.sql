-- Migration to add total_wajib column to existing tka_grades table
-- Run this if table already exists

ALTER TABLE public.tka_grades 
ADD COLUMN IF NOT EXISTS total_wajib numeric(6,2);

-- Add comment
COMMENT ON COLUMN public.tka_grades.total_wajib IS 'Total score of 3 mandatory subjects (B.Indonesia + Matematika + B.Inggris)';
