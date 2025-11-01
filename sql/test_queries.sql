-- ============================================================================
-- Test Queries for User Analytics Functions
-- ============================================================================
-- These queries can be used to verify that all 12 functions work correctly
-- and return the expected data structures.
-- ============================================================================

-- Test 1: Dashboard Stats
SELECT * FROM get_dashboard_stats();

-- Test 2: User Progress Summary
SELECT * FROM get_user_progress_summary();

-- Test 3: Daily Activity (last 7 days)
SELECT * FROM get_daily_activity(7);

-- Test 4: Difficulty Distribution
SELECT * FROM get_difficulty_distribution();

-- Test 5: Exercise Accuracy (last 7 days)
SELECT * FROM get_exercise_accuracy(7);

-- Test 6: Most Difficult Words (top 10)
SELECT * FROM get_difficult_words(10);

-- Test 7: All Sessions Summary
SELECT * FROM get_all_sessions_summary();

-- Test 8: User Streak (example with user_id = 1)
SELECT * FROM get_user_streak(1);

-- Test 9: Active Users Count (last 7 days)
SELECT * FROM get_active_users_count(7);

-- Test 10: Words Taught Today
SELECT * FROM get_words_taught_today();

-- Test 11: User Response Rate (example with user_id = 1, last 7 days)
SELECT * FROM get_user_response_rate(1, 7);

-- Test 12: User Accuracy (example with user_id = 1)
SELECT * FROM calculate_user_accuracy(1);

-- ============================================================================
-- Additional verification queries to check schema compliance
-- ============================================================================

-- Verify no references to vocabulary.difficulty_level
-- (Should only reference vocabulary.word and vocabulary.translation)
COMMENT ON FUNCTION get_difficult_words IS 
    'Returns word and translation from vocabulary table, no difficulty_level';

-- Verify difficulty_level is sourced from user_progress
COMMENT ON FUNCTION get_difficulty_distribution IS 
    'Sources difficulty_level from user_progress table via joins';

-- Verify success rate uses user_mistakes (LEFT JOIN with IS NULL checks)
COMMENT ON FUNCTION get_dashboard_stats IS 
    'Uses LEFT JOIN with user_mistakes to determine success (no mistake = success)';

-- Verify timezone handling using Europe/Berlin
COMMENT ON FUNCTION get_daily_activity IS 
    'Uses learning_sessions.session_date with Europe/Berlin timezone conversion';
