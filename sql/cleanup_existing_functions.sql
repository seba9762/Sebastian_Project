-- ============================================================================
-- Cleanup Script: Remove All Existing Analytics Functions
-- ============================================================================
-- This script removes all versions of the analytics functions, handling cases
-- where multiple function signatures exist.
--
-- Run this BEFORE applying the migration to ensure a clean slate.
-- ============================================================================

-- Drop all possible versions of each function
-- Using CASCADE to handle any dependencies

-- Function 1: get_dashboard_stats (no parameters)
DROP FUNCTION IF EXISTS get_dashboard_stats() CASCADE;

-- Function 2: get_user_progress_summary (no parameters)
DROP FUNCTION IF EXISTS get_user_progress_summary() CASCADE;

-- Function 3: get_daily_activity (multiple possible signatures)
DROP FUNCTION IF EXISTS get_daily_activity() CASCADE;
DROP FUNCTION IF EXISTS get_daily_activity(integer) CASCADE;
DROP FUNCTION IF EXISTS get_daily_activity(int) CASCADE;

-- Function 4: get_difficulty_distribution (no parameters)
DROP FUNCTION IF EXISTS get_difficulty_distribution() CASCADE;

-- Function 5: get_exercise_accuracy (multiple possible signatures)
DROP FUNCTION IF EXISTS get_exercise_accuracy() CASCADE;
DROP FUNCTION IF EXISTS get_exercise_accuracy(integer) CASCADE;
DROP FUNCTION IF EXISTS get_exercise_accuracy(int) CASCADE;

-- Function 6: get_difficult_words (multiple possible signatures)
DROP FUNCTION IF EXISTS get_difficult_words() CASCADE;
DROP FUNCTION IF EXISTS get_difficult_words(integer) CASCADE;
DROP FUNCTION IF EXISTS get_difficult_words(int) CASCADE;

-- Function 7: get_all_sessions_summary (no parameters)
DROP FUNCTION IF EXISTS get_all_sessions_summary() CASCADE;

-- Function 8: get_user_streak (multiple possible signatures)
DROP FUNCTION IF EXISTS get_user_streak(bigint) CASCADE;
DROP FUNCTION IF EXISTS get_user_streak(integer) CASCADE;
DROP FUNCTION IF EXISTS get_user_streak(int) CASCADE;
DROP FUNCTION IF EXISTS get_user_streak(uuid) CASCADE;

-- Function 9: get_active_users_count (multiple possible signatures)
DROP FUNCTION IF EXISTS get_active_users_count() CASCADE;
DROP FUNCTION IF EXISTS get_active_users_count(integer) CASCADE;
DROP FUNCTION IF EXISTS get_active_users_count(int) CASCADE;

-- Function 10: get_words_taught_today (no parameters)
DROP FUNCTION IF EXISTS get_words_taught_today() CASCADE;

-- Function 11: get_user_response_rate (multiple possible signatures)
DROP FUNCTION IF EXISTS get_user_response_rate(bigint) CASCADE;
DROP FUNCTION IF EXISTS get_user_response_rate(bigint, integer) CASCADE;
DROP FUNCTION IF EXISTS get_user_response_rate(bigint, int) CASCADE;
DROP FUNCTION IF EXISTS get_user_response_rate(integer) CASCADE;
DROP FUNCTION IF EXISTS get_user_response_rate(integer, integer) CASCADE;
DROP FUNCTION IF EXISTS get_user_response_rate(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_response_rate(uuid, integer) CASCADE;

-- Function 12: calculate_user_accuracy (multiple possible signatures)
DROP FUNCTION IF EXISTS calculate_user_accuracy(bigint) CASCADE;
DROP FUNCTION IF EXISTS calculate_user_accuracy(integer) CASCADE;
DROP FUNCTION IF EXISTS calculate_user_accuracy(int) CASCADE;
DROP FUNCTION IF EXISTS calculate_user_accuracy(uuid) CASCADE;

-- Function 13: get_user_weekly_performance (multiple possible signatures)
DROP FUNCTION IF EXISTS get_user_weekly_performance(bigint) CASCADE;
DROP FUNCTION IF EXISTS get_user_weekly_performance(integer) CASCADE;
DROP FUNCTION IF EXISTS get_user_weekly_performance(int) CASCADE;
DROP FUNCTION IF EXISTS get_user_weekly_performance(uuid) CASCADE;

-- ============================================================================
-- Verification Query
-- ============================================================================
-- After running this script, this query should return 0 rows

SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'get_dashboard_stats',
    'get_user_progress_summary',
    'get_daily_activity',
    'get_difficulty_distribution',
    'get_exercise_accuracy',
    'get_difficult_words',
    'get_all_sessions_summary',
    'get_user_streak',
    'get_active_users_count',
    'get_words_taught_today',
    'get_user_response_rate',
    'calculate_user_accuracy',
    'get_user_weekly_performance'
)
ORDER BY p.proname, arguments;

-- If the above query returns 0 rows, you can proceed with deploying the new functions
