-- IMPORTANT: 
-- Since Supabase handles password hashing securely, you cannot simply INSERT a plaintext password into auth.users.
-- 
-- OPTION 1 (RECOMMENDED):
-- 1. Go to your Supabase Project Dashboard -> Authentication -> Users.
-- 2. Click "Add User".
-- 3. Enter Email: kurikulum@sman1pati.sch.id
-- 4. Enter Password: kurikulum123
-- 5. Click "Create User".
-- 6. Click on the three dots (...) next to the new user and choose "Copy Request to SQL" or just copy the UUID.
--
-- OPTION 2 (Verify Admin Status):
-- After you create the user, run this SQL to ensure they have the admin profile rights.

-- Assuming you have signed up the user manually, this script ensures they are in the profiles table.
-- Note: Replace 'THE_UUID_FROM_DASHBOARD' with the actual User ID if it didn't auto-create the profile.

-- If you have the trigger setup from `supabase_schema.sql`, the profile should exist.
-- You just need to make sure they are an admin suitable for the `is_admin()` policy.

-- Example: Promote the user to admin (if you have an 'role' column, or logic).
-- In our schema, we didn't explicitly add a 'role' column yet, but we have `is_admin()` function.
-- Let's update `is_admin` function logic or add an admin table.

-- Let's check the schema again:
-- We have `profiles` table. We should add a `role` column to it.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'student';

-- Update the specific user to be admin
-- REPLACE 'kurikulum@sman1pati.sch.id' with the actual email you signed up with if different
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'kurikulum@sman1pati.sch.id');

-- Update the is_admin function to check for this role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
