-- ============================================================================
-- Schema Compliance Verification Script
-- ============================================================================
-- This script verifies that the functions comply with schema requirements
-- Run this AFTER deploying user_analytics_functions.sql
-- ============================================================================

-- Verification 1: Check that all 12 functions exist
SELECT 
    'Function Existence Check' AS check_name,
    COUNT(*) AS function_count,
    CASE 
        WHEN COUNT(*) = 12 THEN '✓ PASS'
        ELSE '✗ FAIL - Expected 12 functions'
    END AS status
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
    'calculate_user_accuracy'
);

-- Verification 2: Check that all functions use SECURITY DEFINER
SELECT 
    'SECURITY DEFINER Check' AS check_name,
    COUNT(*) AS secure_functions,
    CASE 
        WHEN COUNT(*) = 12 THEN '✓ PASS'
        ELSE '✗ FAIL - Not all functions use SECURITY DEFINER'
    END AS status
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
    'calculate_user_accuracy'
)
AND prosecdef = true;

-- Verification 3: List all functions with their settings
SELECT 
    'Function Inventory' AS check_name,
    p.proname AS function_name,
    CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security_mode,
    pg_get_function_arguments(p.oid) AS parameters,
    pg_get_function_result(p.oid) AS return_type
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
    'calculate_user_accuracy'
)
ORDER BY p.proname;

-- Verification 4: Test that vocabulary table doesn't have difficulty_level
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vocabulary' 
        AND column_name = 'difficulty_level'
    ) THEN
        RAISE EXCEPTION 'SCHEMA VIOLATION: vocabulary.difficulty_level exists but should not';
    ELSE
        RAISE NOTICE '✓ PASS: vocabulary.difficulty_level does not exist (as required)';
    END IF;
END $$;

-- Verification 5: Test that user_progress has difficulty_level
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_progress' 
        AND column_name = 'difficulty_level'
    ) THEN
        RAISE EXCEPTION 'SCHEMA VIOLATION: user_progress.difficulty_level does not exist but should';
    ELSE
        RAISE NOTICE '✓ PASS: user_progress.difficulty_level exists (as required)';
    END IF;
END $$;

-- Verification 6: Test that vocabulary has word and translation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vocabulary' 
        AND column_name IN ('word', 'translation')
        HAVING COUNT(*) = 2
    ) THEN
        RAISE EXCEPTION 'SCHEMA VIOLATION: vocabulary.word or vocabulary.translation missing';
    ELSE
        RAISE NOTICE '✓ PASS: vocabulary has word and translation columns';
    END IF;
END $$;

-- Verification 7: Test that learning_sessions has session_date
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'learning_sessions' 
        AND column_name = 'session_date'
        AND data_type = 'timestamp with time zone'
    ) THEN
        RAISE EXCEPTION 'SCHEMA VIOLATION: learning_sessions.session_date missing or wrong type';
    ELSE
        RAISE NOTICE '✓ PASS: learning_sessions.session_date exists with correct type';
    END IF;
END $$;

-- Verification 8: Test that user_mistakes table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'user_mistakes'
    ) THEN
        RAISE EXCEPTION 'SCHEMA VIOLATION: user_mistakes table does not exist';
    ELSE
        RAISE NOTICE '✓ PASS: user_mistakes table exists';
    END IF;
END $$;

-- ============================================================================
-- Summary
-- ============================================================================
SELECT 
    '=== SCHEMA COMPLIANCE SUMMARY ===' AS summary,
    COUNT(*) AS total_checks,
    '8 verification checks completed' AS note;
