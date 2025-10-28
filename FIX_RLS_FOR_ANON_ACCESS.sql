-- ============================================================================
-- FIX RLS POLICIES FOR ANON ACCESS
-- ============================================================================
-- Your function works in Supabase (as owner) but returns zeros in dashboard (as anon)
-- This is because RLS policies are blocking anon role from seeing the data
-- ============================================================================

-- Option 1: Add RLS policy to allow anon to SELECT from learning_sessions
-- This is the recommended approach for dashboard access
CREATE POLICY "Allow anon to view learning_sessions"
ON learning_sessions
FOR SELECT
TO anon
USING (true);

-- Option 2: Add RLS policy to allow anon to SELECT from users table
-- (if not already present)
CREATE POLICY "Allow anon to view users"
ON users
FOR SELECT
TO anon
USING (true);

-- Option 3: Make the function SECURITY DEFINER (if policies don't work)
-- This makes the function run with owner privileges regardless of caller
-- Use this if you want the function to bypass RLS
ALTER FUNCTION get_dashboard_stats() SECURITY DEFINER;

-- ============================================================================
-- TEST THE FIX
-- ============================================================================
-- After running the above, test as anon role:
SET ROLE anon;
SELECT * FROM get_dashboard_stats();
RESET ROLE;

-- You should now see real numbers!

-- ============================================================================
-- WHICH OPTION TO USE?
-- ============================================================================
-- 
-- Option 1 + 2: Use if you want dashboard to have read access to all data
-- - Most transparent
-- - Dashboard can query tables directly if needed
-- 
-- Option 3: Use if you want to keep RLS strict but allow function access
-- - Function runs with owner privileges
-- - Dashboard can only access data through functions
-- - More secure
-- 
-- RECOMMENDED: Start with Option 3 (SECURITY DEFINER)
-- It's the quickest fix and maintains security
-- ============================================================================

-- ============================================================================
-- QUICK FIX (Just run this one line):
-- ============================================================================
ALTER FUNCTION get_dashboard_stats() SECURITY DEFINER;

-- Then refresh your dashboard!
-- ============================================================================
