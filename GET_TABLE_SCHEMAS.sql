-- ============================================================================
-- GET TABLE SCHEMAS FOR USER DETAIL PAGE DESIGN
-- ============================================================================
-- Run this in Supabase SQL Editor and share the results
-- This will help me design the perfect user detail page for you!
-- ============================================================================

-- Query 1: Get columns from user_mistakes table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_mistakes'
ORDER BY ordinal_position;

-- Query 2: Get columns from user_responses table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_responses'
ORDER BY ordinal_position;

-- Query 3: Get columns from user_progress table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_progress'
ORDER BY ordinal_position;

-- Query 4: Get columns from learning_sessions table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'learning_sessions'
ORDER BY ordinal_position;

-- Query 5: Sample data from user_mistakes (to understand the content)
SELECT *
FROM user_mistakes
LIMIT 5;

-- Query 6: Sample data from user_responses
SELECT *
FROM user_responses
LIMIT 5;

-- Query 7: Sample data from user_progress
SELECT *
FROM user_progress
LIMIT 5;

-- Query 8: Sample learning_sessions data (we already have this but let's see all columns)
SELECT *
FROM learning_sessions
LIMIT 3;

-- Query 9: Check if there's a relationship between tables
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('user_mistakes', 'user_responses', 'user_progress', 'learning_sessions');

-- ============================================================================
-- INSTRUCTIONS:
-- Copy this entire file, paste into Supabase SQL Editor, and run it.
-- Share all the results with me so I can design the perfect user detail page!
-- ============================================================================
