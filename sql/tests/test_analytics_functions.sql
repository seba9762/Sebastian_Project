-- ============================================================================
-- Test Script for Analytics Functions
-- ============================================================================
-- This script tests all analytics functions to ensure they execute without
-- errors and return plausible results after the schema migration.
--
-- Test User ID: 59d71456-8d30-4e01-a548-7724003e4e48
-- 
-- To run this script:
--   psql -U your_username -d your_database -f sql/tests/test_analytics_functions.sql
-- Or in Supabase SQL Editor:
--   Copy and paste sections of this file
-- ============================================================================

-- Set display formatting for better readability
\pset border 2
\pset format wrapped
\x auto

-- ============================================================================
-- Test 1: get_dashboard_stats
-- Should return overall dashboard statistics
-- ============================================================================
\echo '============================================================================'
\echo 'Test 1: get_dashboard_stats()'
\echo '============================================================================'
SELECT * FROM get_dashboard_stats();
\echo ''

-- ============================================================================
-- Test 2: get_user_progress_summary
-- Should return progress for all users
-- ============================================================================
\echo '============================================================================'
\echo 'Test 2: get_user_progress_summary()'
\echo '============================================================================'
SELECT * FROM get_user_progress_summary() LIMIT 5;
\echo ''

-- ============================================================================
-- Test 3: get_daily_activity
-- Should return activity for the last 7 days
-- ============================================================================
\echo '============================================================================'
\echo 'Test 3: get_daily_activity(7)'
\echo '============================================================================'
SELECT * FROM get_daily_activity(7);
\echo ''

-- ============================================================================
-- Test 4: get_difficulty_distribution
-- Should return distribution of difficulty levels from user_progress
-- ============================================================================
\echo '============================================================================'
\echo 'Test 4: get_difficulty_distribution()'
\echo '============================================================================'
SELECT * FROM get_difficulty_distribution();
\echo ''

-- ============================================================================
-- Test 5: get_exercise_accuracy
-- Should return exercise accuracy for last 7 days
-- ============================================================================
\echo '============================================================================'
\echo 'Test 5: get_exercise_accuracy(7)'
\echo '============================================================================'
SELECT * FROM get_exercise_accuracy(7);
\echo ''

-- ============================================================================
-- Test 6: get_difficult_words
-- Should return top 10 most difficult words
-- ============================================================================
\echo '============================================================================'
\echo 'Test 6: get_difficult_words(10)'
\echo '============================================================================'
SELECT * FROM get_difficult_words(10);
\echo ''

-- ============================================================================
-- Test 7: get_all_sessions_summary
-- Should return system-wide session summary
-- ============================================================================
\echo '============================================================================'
\echo 'Test 7: get_all_sessions_summary()'
\echo '============================================================================'
SELECT * FROM get_all_sessions_summary();
\echo ''

-- ============================================================================
-- Test 8: get_user_streak
-- Should return streak information for test user
-- ============================================================================
\echo '============================================================================'
\echo 'Test 8: get_user_streak(test_user_id)'
\echo '============================================================================'
-- Replace with actual user ID from your database
DO $$
DECLARE
    test_user_id bigint;
BEGIN
    -- Try to get a real user ID, fallback to a test UUID converted to bigint
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with user_id: %', test_user_id;
        PERFORM * FROM get_user_streak(test_user_id);
    ELSE
        RAISE NOTICE 'No users found in database. Skipping test.';
    END IF;
END $$;

-- Direct test with UUID if your system uses UUIDs
-- SELECT * FROM get_user_streak('59d71456-8d30-4e01-a548-7724003e4e48'::uuid);
\echo ''

-- ============================================================================
-- Test 9: get_active_users_count
-- Should return active user counts for last 7 days
-- ============================================================================
\echo '============================================================================'
\echo 'Test 9: get_active_users_count(7)'
\echo '============================================================================'
SELECT * FROM get_active_users_count(7);
\echo ''

-- ============================================================================
-- Test 10: get_words_taught_today
-- Should return words taught today
-- ============================================================================
\echo '============================================================================'
\echo 'Test 10: get_words_taught_today()'
\echo '============================================================================'
SELECT * FROM get_words_taught_today();
\echo ''

-- ============================================================================
-- Test 11: get_user_response_rate
-- Should return response rate for test user
-- ============================================================================
\echo '============================================================================'
\echo 'Test 11: get_user_response_rate(test_user_id, 7)'
\echo '============================================================================'
DO $$
DECLARE
    test_user_id bigint;
BEGIN
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with user_id: %', test_user_id;
        PERFORM * FROM get_user_response_rate(test_user_id, 7);
    ELSE
        RAISE NOTICE 'No users found in database. Skipping test.';
    END IF;
END $$;
\echo ''

-- ============================================================================
-- Test 12: calculate_user_accuracy
-- Should return accuracy metrics for test user
-- ============================================================================
\echo '============================================================================'
\echo 'Test 12: calculate_user_accuracy(test_user_id)'
\echo '============================================================================'
DO $$
DECLARE
    test_user_id bigint;
BEGIN
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with user_id: %', test_user_id;
        PERFORM * FROM calculate_user_accuracy(test_user_id);
    ELSE
        RAISE NOTICE 'No users found in database. Skipping test.';
    END IF;
END $$;
\echo ''

-- ============================================================================
-- Test 13: get_user_weekly_performance
-- Should return weekly performance for test user
-- ============================================================================
\echo '============================================================================'
\echo 'Test 13: get_user_weekly_performance(test_user_id)'
\echo '============================================================================'
DO $$
DECLARE
    test_user_id bigint;
BEGIN
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with user_id: %', test_user_id;
        PERFORM * FROM get_user_weekly_performance(test_user_id);
    ELSE
        RAISE NOTICE 'No users found in database. Skipping test.';
    END IF;
END $$;
\echo ''

-- ============================================================================
-- Schema Compliance Checks
-- Verify that the functions are using correct column names
-- ============================================================================
\echo '============================================================================'
\echo 'Schema Compliance Checks'
\echo '============================================================================'

-- Check that learning_sessions has word_id column (not vocabulary_id)
\echo 'Checking learning_sessions columns:'
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'learning_sessions' 
AND column_name IN ('word_id', 'vocabulary_id', 'user_id', 'session_date')
ORDER BY column_name;
\echo ''

-- Check that user_mistakes has word_id and created_at columns
\echo 'Checking user_mistakes columns:'
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_mistakes' 
AND column_name IN ('word_id', 'vocabulary_id', 'created_at', 'mistake_date', 'user_id')
ORDER BY column_name;
\echo ''

-- Check that vocabulary has word and translation columns
\echo 'Checking vocabulary columns:'
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vocabulary' 
AND column_name IN ('id', 'word', 'translation', 'german_word', 'english_translation', 'difficulty_level')
ORDER BY column_name;
\echo ''

-- Check that user_progress has difficulty_level column
\echo 'Checking user_progress columns:'
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_progress' 
AND column_name IN ('id', 'user_id', 'word_id', 'vocabulary_id', 'difficulty_level')
ORDER BY column_name;
\echo ''

-- ============================================================================
-- Data Sample Checks
-- Verify that data exists for testing
-- ============================================================================
\echo '============================================================================'
\echo 'Data Sample Checks'
\echo '============================================================================'

\echo 'Total users:'
SELECT COUNT(*) as user_count FROM users;
\echo ''

\echo 'Total learning sessions:'
SELECT COUNT(*) as session_count FROM learning_sessions;
\echo ''

\echo 'Total vocabulary words:'
SELECT COUNT(*) as word_count FROM vocabulary;
\echo ''

\echo 'Total user mistakes:'
SELECT COUNT(*) as mistake_count FROM user_mistakes;
\echo ''

\echo 'Total user progress records:'
SELECT COUNT(*) as progress_count FROM user_progress;
\echo ''

-- ============================================================================
-- Performance Check
-- Ensure functions execute within reasonable time
-- ============================================================================
\echo '============================================================================'
\echo 'Performance Timing Tests'
\echo '============================================================================'

\timing on

\echo 'Timing: get_dashboard_stats()'
SELECT * FROM get_dashboard_stats();

\echo 'Timing: get_user_progress_summary()'
SELECT COUNT(*) FROM get_user_progress_summary();

\echo 'Timing: get_daily_activity(30)'
SELECT COUNT(*) FROM get_daily_activity(30);

\timing off

\echo ''
\echo '============================================================================'
\echo 'All tests completed!'
\echo '============================================================================'
\echo 'Review the output above to verify:'
\echo '  1. No "column does not exist" errors'
\echo '  2. All functions return results without runtime errors'
\echo '  3. Column names match the updated schema (word_id, created_at, etc.)'
\echo '  4. Data values appear plausible'
\echo '============================================================================'
