-- ============================================================================
-- CHECK RLS POLICIES - This is likely why dashboard shows zeros
-- ============================================================================
-- Your function works in Supabase but not in dashboard
-- This suggests RLS (Row Level Security) is blocking the anon key
-- ============================================================================

-- Query 1: Check if RLS is enabled on learning_sessions
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'learning_sessions';

-- Query 2: Check what RLS policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression
FROM pg_policies
WHERE tablename = 'learning_sessions';

-- Query 3: Test if anon role can see data
-- This simulates what your dashboard sees
SET ROLE anon;
SELECT COUNT(*) as records_visible_to_anon FROM learning_sessions;
RESET ROLE;

-- Query 4: Check users table RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command
FROM pg_policies
WHERE tablename = 'users';

-- Query 5: Test the function AS anon role (what dashboard does)
SET ROLE anon;
SELECT * FROM get_dashboard_stats();
RESET ROLE;

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================
-- If Query 3 returns 0 → RLS is blocking anon access
-- If Query 5 returns zeros → RLS is the issue
-- 
-- SOLUTION: Grant SELECT permission to anon role on learning_sessions
-- ============================================================================
