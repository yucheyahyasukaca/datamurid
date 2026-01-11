-- 1. Replace 'YOUR_EMAIL@HERE.COM' with your actual login email
-- 2. Run this entire script in the Supabase SQL Editor

-- Ensure the profile exists (just in case)
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'student'
FROM auth.users
WHERE email = 'kurikulum@sman1pati.sch.id'
ON CONFLICT (id) DO NOTHING;

-- Update the role to admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'kurikulum@sman1pati.sch.id';

-- Verify the result
SELECT * FROM public.profiles WHERE email = 'kurikulum@sman1pati.sch.id';