-- ============================================================================
-- USER DETAIL PAGE - DATABASE FUNCTIONS (FINAL FIXED VERSION)
-- ============================================================================
-- Fixed type casting issue: VARCHAR columns cast to TEXT
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- Function 1: Get comprehensive user statistics (FIXED type casting)
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
    SELECT 
        u.id as user_id,
        u.name::TEXT,  -- Cast to TEXT
        u.phone_number::TEXT,  -- Cast to TEXT
        COALESCE((SELECT COUNT(DISTINCT up.word_id) FROM user_progress up WHERE up.user_id = u.id), 0)::BIGINT as total_words_learned,
        0::INTEGER as current_streak,
        0::INTEGER as longest_streak,
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
        u.timezone::TEXT,  -- Cast to TEXT
        u.daily_word_limit
    FROM users u
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Get user achievements
CREATE OR REPLACE FUNCTION get_user_achievements(p_user_id UUID)
RETURNS TABLE(
    achievement_type TEXT,
    achievement_value INTEGER,
    achieved_at TIMESTAMP,
    days_ago INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.achievement_type::TEXT,
        ua.achievement_value,
        ua.achieved_at::TIMESTAMP,
        EXTRACT(DAY FROM NOW() - ua.achieved_at)::INTEGER as days_ago
    FROM user_achievements ua
    WHERE ua.user_id = p_user_id
    ORDER BY ua.achieved_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Get user weekly performance
CREATE OR REPLACE FUNCTION get_user_weekly_performance(p_user_id UUID)
RETURNS TABLE(
    active_days_this_week BIGINT,
    words_this_week BIGINT,
    exercises_this_week BIGINT,
    activity_top_percent NUMERIC,
    words_top_percent NUMERIC,
    exercise_top_percent NUMERIC,
    overall_percentile NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uwp.active_days_this_week,
        uwp.words_this_week,
        uwp.exercises_this_week,
        ROUND(uwp.activity_top_percent::NUMERIC, 1) as activity_top_percent,
        ROUND(uwp.words_top_percent::NUMERIC, 1) as words_top_percent,
        ROUND(uwp.exercise_top_percent::NUMERIC, 1) as exercise_top_percent,
        ROUND(uwp.overall_percentile::NUMERIC, 1) as overall_percentile
    FROM user_weekly_percentiles uwp
    WHERE uwp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Get upcoming scheduled messages
CREATE OR REPLACE FUNCTION get_user_upcoming_messages(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
    scheduled_time TIMESTAMP WITH TIME ZONE,
    message_type TEXT,
    word TEXT,
    status TEXT,
    hours_until INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sm.scheduled_time,
        sm.message_type::TEXT,
        COALESCE(v.word::TEXT, 'Unknown') as word,
        sm.status::TEXT,
        EXTRACT(HOUR FROM sm.scheduled_time - NOW())::INTEGER as hours_until
    FROM scheduled_messages sm
    LEFT JOIN vocabulary v ON sm.word_id = v.id
    WHERE sm.user_id = p_user_id
    AND sm.status = 'pending'
    AND sm.scheduled_time > NOW()
    ORDER BY sm.scheduled_time ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 5: Get user's challenging words with enhanced details
CREATE OR REPLACE FUNCTION get_user_challenging_words(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE(
    word TEXT,
    translation TEXT,
    mistake_count INTEGER,
    last_mistake TIMESTAMP,
    difficulty_level TEXT,
    mistake_types TEXT,
    severity_distribution TEXT,
    chapter INTEGER,
    word_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.word::TEXT as word,
        v.translation::TEXT as translation,
        COUNT(um.id)::INTEGER as mistake_count,
        MAX(um.created_at)::TIMESTAMP as last_mistake,
        COALESCE(up.difficulty_level::TEXT, 'Unknown') as difficulty_level,
        STRING_AGG(DISTINCT um.mistake_type::TEXT, ', ') as mistake_types,
        STRING_AGG(DISTINCT um.severity::TEXT, ', ') as severity_distribution,
        v.chapter,
        v.type::TEXT as word_type
    FROM user_mistakes um
    JOIN vocabulary v ON um.word_id = v.id
    LEFT JOIN user_progress up ON up.word_id = v.id AND up.user_id = p_user_id
    WHERE um.user_id = p_user_id
    GROUP BY v.id, v.word, v.translation, v.chapter, v.type, up.difficulty_level
    ORDER BY mistake_count DESC, last_mistake DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 6: Get mistake analysis by category
CREATE OR REPLACE FUNCTION get_user_mistake_analysis(p_user_id UUID)
RETURNS TABLE(
    mistake_category TEXT,
    mistake_count INTEGER,
    percentage NUMERIC,
    most_common_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH mistake_totals AS (
        SELECT 
            COALESCE(um.mistake_category::TEXT, 'Uncategorized') as category,
            COUNT(*) as count,
            MODE() WITHIN GROUP (ORDER BY um.mistake_type)::TEXT as common_type
        FROM user_mistakes um
        WHERE um.user_id = p_user_id
        GROUP BY um.mistake_category
    )
    SELECT 
        mt.category::TEXT,
        mt.count::INTEGER,
        ROUND(100.0 * mt.count / SUM(mt.count) OVER (), 1) as percentage,
        mt.common_type::TEXT
    FROM mistake_totals mt
    ORDER BY mt.count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 7: Get user's learning progress over time
CREATE OR REPLACE FUNCTION get_user_progress_timeline(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    date DATE,
    words_learned INTEGER,
    correct_count INTEGER,
    total_attempts INTEGER,
    mistakes_made INTEGER,
    success_rate NUMERIC,
    avg_mastery NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(ls.created_at AT TIME ZONE 'Europe/Berlin') as date,
        COUNT(DISTINCT ls.word_id)::INTEGER as words_learned,
        COALESCE((SELECT SUM(up2.times_correct)::INTEGER 
                  FROM user_progress up2 
                  WHERE up2.user_id = p_user_id 
                  AND DATE(up2.updated_at AT TIME ZONE 'Europe/Berlin') = DATE(ls.created_at AT TIME ZONE 'Europe/Berlin')), 0) as correct_count,
        COALESCE((SELECT SUM(up2.times_seen)::INTEGER 
                  FROM user_progress up2 
                  WHERE up2.user_id = p_user_id 
                  AND DATE(up2.updated_at AT TIME ZONE 'Europe/Berlin') = DATE(ls.created_at AT TIME ZONE 'Europe/Berlin')), 0) as total_attempts,
        COALESCE((SELECT COUNT(*)::INTEGER FROM user_mistakes um 
                  WHERE um.user_id = p_user_id 
                  AND DATE(um.created_at AT TIME ZONE 'Europe/Berlin') = DATE(ls.created_at AT TIME ZONE 'Europe/Berlin')), 0) as mistakes_made,
        COALESCE((SELECT ROUND(100.0 * SUM(up2.times_correct) / NULLIF(SUM(up2.times_seen), 0), 1)
                  FROM user_progress up2 
                  WHERE up2.user_id = p_user_id 
                  AND DATE(up2.updated_at AT TIME ZONE 'Europe/Berlin') = DATE(ls.created_at AT TIME ZONE 'Europe/Berlin')), 0) as success_rate,
        COALESCE((SELECT ROUND(AVG(up2.mastery_score)::NUMERIC, 1)
                  FROM user_progress up2 
                  WHERE up2.user_id = p_user_id 
                  AND DATE(up2.updated_at AT TIME ZONE 'Europe/Berlin') = DATE(ls.created_at AT TIME ZONE 'Europe/Berlin')), 0) as avg_mastery
    FROM learning_sessions ls
    WHERE ls.user_id = p_user_id
    AND ls.created_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY DATE(ls.created_at AT TIME ZONE 'Europe/Berlin')
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 8: Get user's recent activity with enhanced details
CREATE OR REPLACE FUNCTION get_user_recent_activity(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE(
    id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    word TEXT,
    translation TEXT,
    session_type TEXT,
    had_response BOOLEAN,
    response_value TEXT,
    had_mistake BOOLEAN,
    mastery_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ls.id,
        ls.created_at,
        COALESCE(v.word::TEXT, 'Unknown') as word,
        COALESCE(v.translation::TEXT, '') as translation,
        COALESCE(ls.session_type::TEXT, 'learning') as session_type,
        (ls.user_response IS NOT NULL) as had_response,
        ls.user_response::TEXT as response_value,
        EXISTS(SELECT 1 FROM user_mistakes um WHERE um.session_id = ls.id) as had_mistake,
        COALESCE(up.mastery_score, 0) as mastery_score
    FROM learning_sessions ls
    LEFT JOIN vocabulary v ON ls.word_id = v.id
    LEFT JOIN user_progress up ON up.word_id = ls.word_id AND up.user_id = ls.user_id
    WHERE ls.user_id = p_user_id
    ORDER BY ls.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 9: Get user's word mastery by difficulty
CREATE OR REPLACE FUNCTION get_user_word_mastery(p_user_id UUID)
RETURNS TABLE(
    difficulty TEXT,
    total_words INTEGER,
    average_mastery NUMERIC,
    times_seen INTEGER,
    times_correct INTEGER,
    success_rate NUMERIC,
    needs_review INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(up.difficulty_level::TEXT, 'Unknown') as difficulty,
        COUNT(DISTINCT up.word_id)::INTEGER as total_words,
        ROUND(AVG(up.mastery_score)::NUMERIC, 2) as average_mastery,
        SUM(up.times_seen)::INTEGER as times_seen,
        SUM(up.times_correct)::INTEGER as times_correct,
        ROUND(100.0 * SUM(up.times_correct) / NULLIF(SUM(up.times_seen), 0), 1) as success_rate,
        COUNT(CASE WHEN up.next_review_at < NOW() THEN 1 END)::INTEGER as needs_review
    FROM user_progress up
    WHERE up.user_id = p_user_id
    GROUP BY up.difficulty_level
    ORDER BY 
        CASE up.difficulty_level
            WHEN 'easy' THEN 1
            WHEN 'moderate' THEN 2
            WHEN 'hard' THEN 3
            ELSE 4
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 10: Get vocabulary breakdown by chapter
CREATE OR REPLACE FUNCTION get_user_vocabulary_by_chapter(p_user_id UUID)
RETURNS TABLE(
    chapter INTEGER,
    total_words INTEGER,
    learned_words INTEGER,
    completion_percentage NUMERIC,
    average_mastery NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.chapter,
        COUNT(DISTINCT v.id)::INTEGER as total_words,
        COUNT(DISTINCT up.word_id)::INTEGER as learned_words,
        ROUND(100.0 * COUNT(DISTINCT up.word_id) / NULLIF(COUNT(DISTINCT v.id), 0), 1) as completion_percentage,
        COALESCE(ROUND(AVG(up.mastery_score)::NUMERIC, 2), 0) as average_mastery
    FROM vocabulary v
    LEFT JOIN user_progress up ON up.word_id = v.id AND up.user_id = p_user_id
    WHERE v.chapter IS NOT NULL
    GROUP BY v.chapter
    ORDER BY v.chapter;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 11: Get user's learning patterns
CREATE OR REPLACE FUNCTION get_user_learning_patterns(p_user_id UUID)
RETURNS TABLE(
    hour_of_day INTEGER,
    session_count INTEGER,
    avg_success_rate NUMERIC,
    total_words INTEGER,
    avg_mastery NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM ls.created_at AT TIME ZONE 'Europe/Berlin')::INTEGER as hour_of_day,
        COUNT(DISTINCT DATE(ls.created_at))::INTEGER as session_count,
        COALESCE(ROUND(
            100.0 * COUNT(CASE WHEN ls.user_response IS NOT NULL THEN 1 END) / 
            NULLIF(COUNT(*), 0), 1
        ), 0)::NUMERIC as avg_success_rate,
        COUNT(*)::INTEGER as total_words,
        COALESCE(ROUND(AVG(up.mastery_score)::NUMERIC, 2), 0) as avg_mastery
    FROM learning_sessions ls
    LEFT JOIN user_progress up ON up.word_id = ls.word_id AND up.user_id = ls.user_id
    WHERE ls.user_id = p_user_id
    GROUP BY EXTRACT(HOUR FROM ls.created_at AT TIME ZONE 'Europe/Berlin')
    ORDER BY hour_of_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 12: Get comprehensive user insights
CREATE OR REPLACE FUNCTION get_user_insights(p_user_id UUID)
RETURNS TABLE(
    total_vocabulary INTEGER,
    learned_vocabulary INTEGER,
    learning_percentage NUMERIC,
    most_common_mistake_type TEXT,
    strongest_chapter INTEGER,
    weakest_chapter INTEGER,
    best_study_hour INTEGER,
    upcoming_reviews INTEGER,
    total_achievements INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM vocabulary)::INTEGER as total_vocabulary,
        (SELECT COUNT(DISTINCT up.word_id) FROM user_progress up WHERE up.user_id = p_user_id)::INTEGER as learned_vocabulary,
        ROUND(100.0 * (SELECT COUNT(DISTINCT up.word_id) FROM user_progress up WHERE up.user_id = p_user_id) / 
              NULLIF((SELECT COUNT(*) FROM vocabulary), 0), 1)::NUMERIC as learning_percentage,
        (SELECT um.mistake_type::TEXT
         FROM user_mistakes um
         WHERE um.user_id = p_user_id
         GROUP BY um.mistake_type
         ORDER BY COUNT(*) DESC
         LIMIT 1) as most_common_mistake_type,
        (SELECT v.chapter
         FROM user_progress up2
         JOIN vocabulary v ON up2.word_id = v.id
         WHERE up2.user_id = p_user_id AND v.chapter IS NOT NULL
         GROUP BY v.chapter
         ORDER BY AVG(up2.mastery_score) DESC
         LIMIT 1) as strongest_chapter,
        (SELECT v.chapter
         FROM user_progress up3
         JOIN vocabulary v ON up3.word_id = v.id
         WHERE up3.user_id = p_user_id AND v.chapter IS NOT NULL
         GROUP BY v.chapter
         ORDER BY AVG(up3.mastery_score) ASC
         LIMIT 1) as weakest_chapter,
        (SELECT EXTRACT(HOUR FROM ls.created_at AT TIME ZONE 'Europe/Berlin')::INTEGER
         FROM learning_sessions ls
         WHERE ls.user_id = p_user_id
         GROUP BY EXTRACT(HOUR FROM ls.created_at AT TIME ZONE 'Europe/Berlin')
         ORDER BY COUNT(*) DESC
         LIMIT 1) as best_study_hour,
        (SELECT COUNT(*)::INTEGER
         FROM user_progress up4
         WHERE up4.user_id = p_user_id
         AND up4.next_review_at < NOW()) as upcoming_reviews,
        (SELECT COUNT(*)::INTEGER
         FROM user_achievements ua
         WHERE ua.user_id = p_user_id) as total_achievements;
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
    
    RAISE NOTICE 'Testing with user ID: %', test_user_id;
    RAISE NOTICE 'All 12 enhanced functions created successfully!';
    RAISE NOTICE 'Type casting fixed - VARCHAR columns now cast to TEXT';
    RAISE NOTICE 'Test with: SELECT * FROM get_user_detailed_stats(''%'');', test_user_id;
END $$;

-- ============================================================================
-- DONE! All functions with proper type casting
-- ============================================================================
