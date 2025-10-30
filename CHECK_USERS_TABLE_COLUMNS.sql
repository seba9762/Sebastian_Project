-- ============================================================================
-- CHECK USERS TABLE COLUMNS
-- ============================================================================
-- This will show us what columns actually exist in your users table
-- ============================================================================

-- Check all columns in users table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Sample data from users table
SELECT * FROM users LIMIT 3;

-- ============================================================================
-- INSTRUCTIONS:
-- Run this and share the results so I can fix the functions to match your schema
-- ============================================================================
