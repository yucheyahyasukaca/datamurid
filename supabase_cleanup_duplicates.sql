-- Function to cleanup duplicate students
-- Logic: Groups students by their "Numeric NISN" (ignoring leading zeros) to catch cases like '8389' vs '008389'
-- Keeps the BEST record based on:
-- 1. is_verified = true (Verified accounts are most important)
-- 2. updated_at = latest (Most recently active)
-- 3. id = highest (Latest created)

CREATE OR REPLACE FUNCTION cleanup_student_duplicates() RETURNS TABLE(deleted_count INT) AS $$
DECLARE
    r RECORD;
    total_deleted INT := 0;
    current_deleted INT;
BEGIN
    -- Iterate through all duplicate groups
    FOR r IN
        SELECT (REGEXP_REPLACE(nisn, '\D', '', 'g')::NUMERIC) as numeric_nisn
        FROM students
        WHERE nisn ~ '[0-9]' -- Ensure at least some digits exist
        GROUP BY 1
        HAVING COUNT(*) > 1
    LOOP
        -- Delete duplicates for this specific NISN, keeping the best one
        WITH duplicates AS (
            SELECT id
            FROM students
            WHERE (REGEXP_REPLACE(nisn, '\D', '', 'g')::NUMERIC) = r.numeric_nisn
            ORDER BY 
                is_verified DESC,           -- 1. Keep Verified
                updated_at DESC NULLS LAST, -- 2. Keep Latest Update
                created_at DESC NULLS LAST, -- 3. Keep Latest Created
                id DESC                     -- 4. Tiebreaker
            OFFSET 1 -- Skip the first one (The Keeper)
        )
        DELETE FROM students
        WHERE id IN (SELECT id FROM duplicates);
        
        GET DIAGNOSTICS current_deleted = ROW_COUNT;
        total_deleted := total_deleted + current_deleted;
    END LOOP;

    RETURN QUERY SELECT total_deleted;
END;
$$ LANGUAGE plpgsql;

-- Executing the cleanup
-- SELECT * FROM cleanup_student_duplicates();

-- Optional: Add Unique Constraint to prevent EXACT duplicates in future
-- Note: This only prevents exact string matches (e.g. '123' and '123'), not '00123' and '123'.
-- ALTER TABLE students ADD CONSTRAINT students_nisn_unique UNIQUE (nisn);
