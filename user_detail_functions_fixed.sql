-- ============================================================================
-- USER DETAIL PAGE - DATABASE FUNCTIONS (FIXED - Resolves ambiguous column references)
-- ============================================================================
-- Fixed version that explicitly qualifies all column references
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- Function 1: Get comprehensive user statistics (FIXED)
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
    total_mistakes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.name,
        u.phone_number,
        COALESCE((SELECT COUNT(DISTINCT up.word_id) FROM user_progress up WHERE up.user_id = u.id), 0)::BIGINT as total_words_learned,
        COALESCE(u.current_streak, 0)::INTEGER as current_streak,
        COALESCE(u.longest_streak, 0)::INTEGER as longest_streak,
        COALESCE((SELECT COUNT(DISTINCT ls.id) FROM learning_sessions ls WHERE ls.user_id = u.id), 0)::BIGINT as total_sessions,
        u.last_active,
        u.created_at as member_since,
        COALESCE((SELECT ROUND(
            100.0 * COUNT(CASE WHEN ls.user_response IS NOT NULL THEN 1 END) / 
            NULLIF(COUNT(*), 0), 1
        ) FROM learning_sessions ls WHERE ls.user_id = u.id), 0)::NUMERIC as response_rate,
        COALESCE((SELECT ROUND(
            100.0 * COUNT(*) / 
            NULLIF((SELECT COUNT(*) FROM learning_sessions ls2 WHERE ls2.user_id = u.id), 0), 1
        ) FROM user_responses ur WHERE ur.user_id = u.id AND ur.is_correct = true), 0)::NUMERIC as success_rate,
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
        COALESCE((SELECT COUNT(*) FROM user_mistakes um WHERE um.user_id = u.id), 0)::BIGINT as total_mistakes
    FROM users u
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Get user's challenging words (from user_mistakes table) (FIXED)
CREATE OR REPLACE FUNCTION get_user_challenging_words(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE(
    word TEXT,
    translation TEXT,
    mistake_count INTEGER,
    last_mistake TIMESTAMP WITH TIME ZONE,
    difficulty_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.german_word as word,
        v.english_translation as translation,
        COUNT(um.id)::INTEGER as mistake_count,
        MAX(um.created_at) as last_mistake,
        COALESCE(v.difficulty_level, 'Unknown') as difficulty_level
    FROM user_mistakes um
    JOIN vocabulary v ON um.word_id = v.id
    WHERE um.user_id = p_user_id
    GROUP BY v.id, v.german_word, v.english_translation, v.difficulty_level
    ORDER BY mistake_count DESC, last_mistake DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Get user's learning progress over time (FIXED)
CREATE OR REPLACE FUNCTION get_user_progress_timeline(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    date DATE,
    words_learned INTEGER,
    correct_responses INTEGER,
    total_responses INTEGER,
    mistakes_made INTEGER,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(ls.created_at AT TIME ZONE 'Europe/Berlin') as date,
        COUNT(DISTINCT ls.word_id)::INTEGER as words_learned,
        COALESCE((SELECT COUNT(*) FROM user_responses ur 
                  WHERE ur.user_id = p_user_id 
                  AND DATE(ur.created_at AT TIME ZONE 'Europe/Berlin') = DATE(ls.created_at AT TIME ZONE 'Europe/Berlin')
                  AND ur.is_correct = true), 0)::INTEGER as correct_responses,
        COALESCE((SELECT COUNT(*) FROM user_responses ur 
                  WHERE ur.user_id = p_user_id 
                  AND DATE(ur.created_at AT TIME ZONE 'Europe/Berlin') = DATE(ls.created_at AT TIME ZONE 'Europe/Berlin')), 0)::INTEGER as total_responses,
        COALESCE((SELECT COUNT(*) FROM user_mistakes um 
                  WHERE um.user_id = p_user_id 
                  AND DATE(um.created_at AT TIME ZONE 'Europe/Berlin') = DATE(ls.created_at AT TIME ZONE 'Europe/Berlin')), 0)::INTEGER as mistakes_made,
        CASE 
            WHEN (SELECT COUNT(*) FROM user_responses ur 
                  WHERE ur.user_id = p_user_id 
                  AND DATE(ur.created_at AT TIME ZONE 'Europe/Berlin') = DATE(ls.created_at AT TIME ZONE 'Europe/Berlin')) > 0
            THEN ROUND(100.0 * (SELECT COUNT(*) FROM user_responses ur 
                  WHERE ur.user_id = p_user_id 
                  AND DATE(ur.created_at AT TIME ZONE 'Europe/Berlin') = DATE(ls.created_at AT TIME ZONE 'Europe/Berlin')
                  AND ur.is_correct = true) / 
                  NULLIF((SELECT COUNT(*) FROM user_responses ur 
                  WHERE ur.user_id = p_user_id 
                  AND DATE(ur.created_at AT TIME ZONE 'Europe/Berlin') = DATE(ls.created_at AT TIME ZONE 'Europe/Berlin')), 0), 1)
            ELSE 0
        END::NUMERIC as success_rate
    FROM learning_sessions ls
    WHERE ls.user_id = p_user_id
    AND ls.created_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY DATE(ls.created_at AT TIME ZONE 'Europe/Berlin')
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Get user's recent activity (FIXED)
CREATE OR REPLACE FUNCTION get_user_recent_activity(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE(
    id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    word TEXT,
    translation TEXT,
    had_response BOOLEAN,
    was_correct BOOLEAN,
    had_mistake BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ls.id,
        ls.created_at,
        COALESCE(v.german_word, 'Unknown') as word,
        COALESCE(v.english_translation, '') as translation,
        EXISTS(SELECT 1 FROM user_responses ur WHERE ur.session_id = ls.id) as had_response,
        EXISTS(SELECT 1 FROM user_responses ur WHERE ur.session_id = ls.id AND ur.is_correct = true) as was_correct,
        EXISTS(SELECT 1 FROM user_mistakes um WHERE um.session_id = ls.id) as had_mistake
    FROM learning_sessions ls
    LEFT JOIN vocabulary v ON ls.word_id = v.id
    WHERE ls.user_id = p_user_id
    ORDER BY ls.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 5: Get user's word mastery by difficulty (FIXED)
CREATE OR REPLACE FUNCTION get_user_word_mastery(p_user_id UUID)
RETURNS TABLE(
    difficulty TEXT,
    total_words INTEGER,
    words_in_progress INTEGER,
    mistake_count INTEGER,
    mastery_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(v.difficulty_level, 'Unknown') as difficulty,
        COUNT(DISTINCT up.word_id)::INTEGER as total_words,
        COUNT(DISTINCT up.word_id)::INTEGER as words_in_progress,
        COALESCE((SELECT COUNT(*) 
                  FROM user_mistakes um 
                  JOIN vocabulary v2 ON um.word_id = v2.id
                  WHERE um.user_id = p_user_id 
                  AND v2.difficulty_level = v.difficulty_level), 0)::INTEGER as mistake_count,
        CASE 
            WHEN COUNT(DISTINCT up.word_id) > 0 
            THEN ROUND(100.0 * (COUNT(DISTINCT up.word_id) - COALESCE((SELECT COUNT(DISTINCT um.word_id) 
                  FROM user_mistakes um 
                  JOIN vocabulary v2 ON um.word_id = v2.id
                  WHERE um.user_id = p_user_id 
                  AND v2.difficulty_level = v.difficulty_level), 0)) / 
                  NULLIF(COUNT(DISTINCT up.word_id), 0), 1)
            ELSE 0
        END::NUMERIC as mastery_percentage
    FROM user_progress up
    JOIN vocabulary v ON up.word_id = v.id
    WHERE up.user_id = p_user_id
    GROUP BY v.difficulty_level
    ORDER BY 
        CASE v.difficulty_level
            WHEN 'easy' THEN 1
            WHEN 'moderate' THEN 2
            WHEN 'hard' THEN 3
            ELSE 4
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 6: Get user's learning patterns (time of day analysis) (FIXED)
CREATE OR REPLACE FUNCTION get_user_learning_patterns(p_user_id UUID)
RETURNS TABLE(
    hour_of_day INTEGER,
    session_count INTEGER,
    avg_success_rate NUMERIC,
    total_words INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM ls.created_at AT TIME ZONE 'Europe/Berlin')::INTEGER as hour_of_day,
        COUNT(DISTINCT DATE(ls.created_at))::INTEGER as session_count,
        COALESCE(ROUND(100.0 * 
            (SELECT COUNT(*) FROM user_responses ur 
             WHERE ur.user_id = p_user_id 
             AND EXTRACT(HOUR FROM ur.created_at AT TIME ZONE 'Europe/Berlin') = EXTRACT(HOUR FROM ls.created_at AT TIME ZONE 'Europe/Berlin')
             AND ur.is_correct = true) / 
            NULLIF((SELECT COUNT(*) FROM user_responses ur 
             WHERE ur.user_id = p_user_id 
             AND EXTRACT(HOUR FROM ur.created_at AT TIME ZONE 'Europe/Berlin') = EXTRACT(HOUR FROM ls.created_at AT TIME ZONE 'Europe/Berlin')), 0), 1), 0)::NUMERIC as avg_success_rate,
        COUNT(*)::INTEGER as total_words
    FROM learning_sessions ls
    WHERE ls.user_id = p_user_id
    GROUP BY EXTRACT(HOUR FROM ls.created_at AT TIME ZONE 'Europe/Berlin')
    ORDER BY hour_of_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 7: Get user's progress summary (enhanced) (FIXED)
CREATE OR REPLACE FUNCTION get_user_progress_detailed(p_user_id UUID)
RETURNS TABLE(
    total_vocabulary INTEGER,
    learned_vocabulary INTEGER,
    learning_percentage NUMERIC,
    strongest_difficulty TEXT,
    weakest_difficulty TEXT,
    most_difficult_word TEXT,
    best_study_hour INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM vocabulary)::INTEGER as total_vocabulary,
        (SELECT COUNT(DISTINCT up.word_id) FROM user_progress up WHERE up.user_id = p_user_id)::INTEGER as learned_vocabulary,
        ROUND(100.0 * (SELECT COUNT(DISTINCT up.word_id) FROM user_progress up WHERE up.user_id = p_user_id) / 
              NULLIF((SELECT COUNT(*) FROM vocabulary), 0), 1)::NUMERIC as learning_percentage,
        (SELECT v.difficulty_level 
         FROM user_progress up2 
         JOIN vocabulary v ON up2.word_id = v.id
         LEFT JOIN user_mistakes um ON um.word_id = up2.word_id AND um.user_id = p_user_id
         WHERE up2.user_id = p_user_id
         GROUP BY v.difficulty_level
         ORDER BY COUNT(DISTINCT up2.word_id) DESC, COUNT(um.id) ASC
         LIMIT 1) as strongest_difficulty,
        (SELECT v.difficulty_level 
         FROM user_mistakes um2
         JOIN vocabulary v ON um2.word_id = v.id
         WHERE um2.user_id = p_user_id
         GROUP BY v.difficulty_level
         ORDER BY COUNT(um2.id) DESC
         LIMIT 1) as weakest_difficulty,
        (SELECT v.german_word
         FROM user_mistakes um3
         JOIN vocabulary v ON um3.word_id = v.id
         WHERE um3.user_id = p_user_id
         GROUP BY v.id, v.german_word
         ORDER BY COUNT(um3.id) DESC
         LIMIT 1) as most_difficult_word,
        (SELECT EXTRACT(HOUR FROM ls.created_at AT TIME ZONE 'Europe/Berlin')::INTEGER
         FROM learning_sessions ls
         WHERE ls.user_id = p_user_id
         GROUP BY EXTRACT(HOUR FROM ls.created_at AT TIME ZONE 'Europe/Berlin')
         ORDER BY COUNT(*) DESC
         LIMIT 1) as best_study_hour;
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
    RAISE NOTICE 'All functions created successfully!';
    RAISE NOTICE 'Test them with: SELECT * FROM get_user_detailed_stats(''%'');', test_user_id;
END $$;

-- ============================================================================
-- VERIFICATION - Run these to test each function
-- ============================================================================
-- Uncomment and replace USER_ID to test:

-- SELECT * FROM get_user_detailed_stats('YOUR_USER_ID_HERE');
-- SELECT * FROM get_user_challenging_words('YOUR_USER_ID_HERE', 10);
-- SELECT * FROM get_user_progress_timeline('YOUR_USER_ID_HERE', 30);
-- SELECT * FROM get_user_recent_activity('YOUR_USER_ID_HERE', 20);
-- SELECT * FROM get_user_word_mastery('YOUR_USER_ID_HERE');
-- SELECT * FROM get_user_learning_patterns('YOUR_USER_ID_HERE');
-- SELECT * FROM get_user_progress_detailed('YOUR_USER_ID_HERE');

-- ============================================================================
-- DONE! Functions are ready for the dashboard
-- ============================================================================
