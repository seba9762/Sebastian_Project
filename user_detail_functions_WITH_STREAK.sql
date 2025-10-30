-- ============================================================================
-- USER DETAIL FUNCTIONS - WITH STREAK CALCULATION & MISTAKE BREAKDOWN
-- ============================================================================
-- This version calculates streaks from learning_sessions data
-- Adds detailed mistake breakdown functions for visualizations
-- Run this to UPDATE existing functions
-- ============================================================================

-- Function 1: Get user stats WITH CALCULATED STREAK
CREATE OR REPLACE FUNCTION get_user_detailed_stats(p_user_id UUID)
RETURNS TABLE(
    user_id UUID,
    name TEXT,
    phone_number TEXT,
    total_words_learned BIGINT,
    current_streak INTEGER,
    longest_streak INTEGER,
    total_sessions BIGINT,
    last_active TIMESTAMP WITH TIME ZONE,
    member_since TIMESTAMP WITH TIME ZONE,
    response_rate NUMERIC,
    success_rate NUMERIC,
    average_session_words NUMERIC,
    words_today BIGINT,
    words_this_week BIGINT,
    words_this_month BIGINT,
    days_active INTEGER,
    total_mistakes BIGINT,
    average_mastery NUMERIC,
    timezone TEXT,
    daily_word_limit INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_activity AS (
        -- Get all dates user was active
        SELECT DISTINCT DATE(ls.created_at AT TIME ZONE 'Europe/Berlin') as activity_date
        FROM learning_sessions ls
        WHERE ls.user_id = p_user_id
        ORDER BY activity_date DESC
    ),
    streak_calc AS (
        -- Calculate current streak (consecutive days from today backwards)
        SELECT 
            COUNT(*) as current_streak
        FROM (
            SELECT 
                activity_date,
                activity_date - ROW_NUMBER() OVER (ORDER BY activity_date DESC)::INTEGER as streak_group
            FROM daily_activity
            WHERE activity_date <= CURRENT_DATE
        ) sub
        WHERE streak_group = (
            SELECT activity_date - ROW_NUMBER() OVER (ORDER BY activity_date DESC)::INTEGER
            FROM daily_activity
            WHERE activity_date = CURRENT_DATE
            LIMIT 1
        )
    ),
    longest_streak_calc AS (
        -- Calculate longest streak ever
        SELECT 
            MAX(streak_length) as longest_streak
        FROM (
            SELECT 
                COUNT(*) as streak_length
            FROM (
                SELECT 
                    activity_date,
                    activity_date - ROW_NUMBER() OVER (ORDER BY activity_date)::INTEGER as streak_group
                FROM daily_activity
            ) sub
            GROUP BY streak_group
        ) streaks
    )
    SELECT 
        u.id as user_id,
        u.name::TEXT,
        u.phone_number::TEXT,
        COALESCE((SELECT COUNT(DISTINCT up.word_id) FROM user_progress up WHERE up.user_id = u.id), 0)::BIGINT as total_words_learned,
        COALESCE((SELECT current_streak FROM streak_calc), 0)::INTEGER as current_streak,
        COALESCE((SELECT longest_streak FROM longest_streak_calc), 0)::INTEGER as longest_streak,
        COALESCE((SELECT COUNT(DISTINCT ls.id) FROM learning_sessions ls WHERE ls.user_id = u.id), 0)::BIGINT as total_sessions,
        u.last_active,
        u.created_at as member_since,
        COALESCE((SELECT ROUND(
            100.0 * COUNT(CASE WHEN ls.user_response IS NOT NULL THEN 1 END) / 
            NULLIF(COUNT(*), 0), 1
        ) FROM learning_sessions ls WHERE ls.user_id = u.id), 0)::NUMERIC as response_rate,
        COALESCE((SELECT ROUND(
            100.0 * SUM(up.times_correct) / 
            NULLIF(SUM(up.times_seen), 0), 1
        ) FROM user_progress up WHERE up.user_id = u.id), 0)::NUMERIC as success_rate,
        COALESCE((SELECT ROUND(AVG(session_count)::NUMERIC, 1)
         FROM (
             SELECT DATE(ls.created_at), COUNT(*) as session_count
             FROM learning_sessions ls
             WHERE ls.user_id = u.id
             GROUP BY DATE(ls.created_at)
         ) sub), 0)::NUMERIC as average_session_words,
        COALESCE((SELECT COUNT(*) FROM learning_sessions ls 
         WHERE ls.user_id = u.id 
         AND ls.created_at >= NOW() - INTERVAL '24 hours'), 0)::BIGINT as words_today,
        COALESCE((SELECT COUNT(*) FROM learning_sessions ls 
         WHERE ls.user_id = u.id 
         AND ls.created_at >= NOW() - INTERVAL '7 days'), 0)::BIGINT as words_this_week,
        COALESCE((SELECT COUNT(*) FROM learning_sessions ls 
         WHERE ls.user_id = u.id 
         AND ls.created_at >= NOW() - INTERVAL '30 days'), 0)::BIGINT as words_this_month,
        COALESCE((SELECT COUNT(DISTINCT DATE(ls.created_at)) 
         FROM learning_sessions ls 
         WHERE ls.user_id = u.id), 0)::INTEGER as days_active,
        COALESCE((SELECT COUNT(*) FROM user_mistakes um WHERE um.user_id = u.id), 0)::BIGINT as total_mistakes,
        COALESCE((SELECT ROUND(AVG(up.mastery_score)::NUMERIC, 1) 
         FROM user_progress up WHERE up.user_id = u.id), 0)::NUMERIC as average_mastery,
        u.timezone::TEXT,
        u.daily_word_limit
    FROM users u
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NEW Function: Get mistake breakdown by TYPE
CREATE OR REPLACE FUNCTION get_user_mistakes_by_type(p_user_id UUID)
RETURNS TABLE(
    mistake_type TEXT,
    count INTEGER,
    percentage NUMERIC,
    recent_example TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH type_counts AS (
        SELECT 
            um.mistake_type::TEXT,
            COUNT(*)::INTEGER as count,
            (SELECT um2.user_sentence::TEXT 
             FROM user_mistakes um2 
             WHERE um2.user_id = p_user_id 
             AND um2.mistake_type = um.mistake_type 
             ORDER BY um2.created_at DESC 
             LIMIT 1) as recent_example
        FROM user_mistakes um
        WHERE um.user_id = p_user_id
        GROUP BY um.mistake_type
    )
    SELECT 
        tc.mistake_type,
        tc.count,
        ROUND(100.0 * tc.count / SUM(tc.count) OVER (), 1) as percentage,
        tc.recent_example
    FROM type_counts tc
    ORDER BY tc.count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NEW Function: Get mistake breakdown by SEVERITY
CREATE OR REPLACE FUNCTION get_user_mistakes_by_severity(p_user_id UUID)
RETURNS TABLE(
    severity TEXT,
    count INTEGER,
    percentage NUMERIC,
    avg_per_day NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH severity_counts AS (
        SELECT 
            COALESCE(um.severity::TEXT, 'Unknown') as severity,
            COUNT(*)::INTEGER as count,
            COUNT(DISTINCT DATE(um.created_at))::INTEGER as days_with_mistakes
        FROM user_mistakes um
        WHERE um.user_id = p_user_id
        GROUP BY um.severity
    )
    SELECT 
        sc.severity,
        sc.count,
        ROUND(100.0 * sc.count / SUM(sc.count) OVER (), 1) as percentage,
        ROUND(sc.count::NUMERIC / NULLIF(sc.days_with_mistakes, 0), 1) as avg_per_day
    FROM severity_counts sc
    ORDER BY 
        CASE sc.severity
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
            ELSE 4
        END,
        sc.count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced Function: Get mistake analysis by category (with more details)
CREATE OR REPLACE FUNCTION get_user_mistake_analysis(p_user_id UUID)
RETURNS TABLE(
    mistake_category TEXT,
    mistake_count INTEGER,
    percentage NUMERIC,
    most_common_type TEXT,
    most_common_severity TEXT,
    recent_word TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH mistake_totals AS (
        SELECT 
            COALESCE(um.mistake_category::TEXT, 'Uncategorized') as category,
            COUNT(*)::INTEGER as count,
            MODE() WITHIN GROUP (ORDER BY um.mistake_type)::TEXT as common_type,
            MODE() WITHIN GROUP (ORDER BY um.severity)::TEXT as common_severity,
            (SELECT v.word::TEXT 
             FROM user_mistakes um2 
             JOIN vocabulary v ON um2.word_id = v.id
             WHERE um2.user_id = p_user_id 
             AND COALESCE(um2.mistake_category, 'Uncategorized') = COALESCE(um.mistake_category, 'Uncategorized')
             ORDER BY um2.created_at DESC 
             LIMIT 1) as recent_word
        FROM user_mistakes um
        WHERE um.user_id = p_user_id
        GROUP BY um.mistake_category
    )
    SELECT 
        mt.category::TEXT,
        mt.count::INTEGER,
        ROUND(100.0 * mt.count / SUM(mt.count) OVER (), 1) as percentage,
        mt.common_type::TEXT,
        mt.common_severity::TEXT,
        mt.recent_word::TEXT
    FROM mistake_totals mt
    ORDER BY mt.count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NEW Function: Get mistake trends over time
CREATE OR REPLACE FUNCTION get_user_mistake_trends(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    date DATE,
    total_mistakes INTEGER,
    grammar_mistakes INTEGER,
    spelling_mistakes INTEGER,
    usage_mistakes INTEGER,
    other_mistakes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(um.created_at AT TIME ZONE 'Europe/Berlin') as date,
        COUNT(*)::INTEGER as total_mistakes,
        COUNT(CASE WHEN um.mistake_category ILIKE '%grammar%' THEN 1 END)::INTEGER as grammar_mistakes,
        COUNT(CASE WHEN um.mistake_category ILIKE '%spell%' THEN 1 END)::INTEGER as spelling_mistakes,
        COUNT(CASE WHEN um.mistake_category ILIKE '%usage%' OR um.mistake_category ILIKE '%word%' THEN 1 END)::INTEGER as usage_mistakes,
        COUNT(CASE WHEN um.mistake_category NOT ILIKE '%grammar%' 
                    AND um.mistake_category NOT ILIKE '%spell%' 
                    AND um.mistake_category NOT ILIKE '%usage%'
                    AND um.mistake_category NOT ILIKE '%word%' THEN 1 END)::INTEGER as other_mistakes
    FROM user_mistakes um
    WHERE um.user_id = p_user_id
    AND um.created_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY DATE(um.created_at AT TIME ZONE 'Europe/Berlin')
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TEST THE FUNCTIONS
-- ============================================================================
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    RAISE NOTICE 'Updated functions with:';
    RAISE NOTICE '✓ Calculated current streak';
    RAISE NOTICE '✓ Calculated longest streak';
    RAISE NOTICE '✓ Mistake breakdown by type';
    RAISE NOTICE '✓ Mistake breakdown by severity';
    RAISE NOTICE '✓ Enhanced mistake analysis';
    RAISE NOTICE '✓ Mistake trends over time';
    RAISE NOTICE 'Test with user ID: %', test_user_id;
END $$;

-- ============================================================================
-- QUICK TEST - Uncomment to test
-- ============================================================================
-- SELECT * FROM get_user_detailed_stats('YOUR_USER_ID');
-- SELECT * FROM get_user_mistakes_by_type('YOUR_USER_ID');
-- SELECT * FROM get_user_mistakes_by_severity('YOUR_USER_ID');
-- SELECT * FROM get_user_mistake_analysis('YOUR_USER_ID');
-- SELECT * FROM get_user_mistake_trends('YOUR_USER_ID', 30);

-- ============================================================================
-- DONE! Streak calculated + Mistake visualizations ready
-- ============================================================================
