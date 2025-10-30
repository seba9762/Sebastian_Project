-- ============================================================================
-- USER DETAIL PAGE - DATABASE FUNCTIONS (FIXED VERSION)
-- ============================================================================
-- Fixed issues:
-- 1. Removed all references to non-existent user_responses.is_correct column
-- 2. Implemented proper streak calculation from learning_sessions
-- 3. Added 5 mistake visualization functions
-- ============================================================================

-- Function 1: Get comprehensive user statistics
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
DECLARE
    v_current_streak INTEGER := 0;
    v_longest_streak INTEGER := 0;
    v_streak_count INTEGER := 0;
    v_prev_date DATE := NULL;
    v_current_date DATE;
    v_today DATE := CURRENT_DATE;
    v_has_today BOOLEAN := FALSE;
BEGIN
    -- Calculate streaks from learning_sessions
    FOR v_current_date IN 
        SELECT DISTINCT DATE(created_at) as session_date
        FROM learning_sessions
        WHERE user_id = p_user_id
        ORDER BY session_date DESC
    LOOP
        -- Check if this is the first iteration
        IF v_prev_date IS NULL THEN
            v_streak_count := 1;
            v_prev_date := v_current_date;
            v_has_today := (v_current_date = v_today);
        -- Check if dates are consecutive
        ELSIF v_prev_date - v_current_date = 1 THEN
            v_streak_count := v_streak_count + 1;
            v_prev_date := v_current_date;
        ELSE
            -- Streak broken, save current streak if it's the longest
            IF v_longest_streak < v_streak_count THEN
                v_longest_streak := v_streak_count;
            END IF;
            -- Reset for new streak
            v_streak_count := 1;
            v_prev_date := v_current_date;
        END IF;
    END LOOP;
    
    -- Check final streak
    IF v_longest_streak < v_streak_count THEN
        v_longest_streak := v_streak_count;
    END IF;
    
    -- Current streak only counts if it includes today or yesterday
    IF v_prev_date IS NOT NULL AND (v_prev_date = v_today OR v_prev_date = v_today - 1) THEN
        v_current_streak := v_streak_count;
    END IF;

    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.name,
        u.phone_number,
        COALESCE((SELECT COUNT(DISTINCT word_id) FROM user_progress WHERE user_id = u.id), 0)::BIGINT as total_words_learned,
        v_current_streak,
        v_longest_streak,
        COALESCE((SELECT COUNT(DISTINCT id) FROM learning_sessions WHERE user_id = u.id), 0)::BIGINT as total_sessions,
        u.last_active,
        u.created_at as member_since,
        COALESCE((SELECT ROUND(
            100.0 * COUNT(CASE WHEN user_response IS NOT NULL THEN 1 END) / 
            NULLIF(COUNT(*), 0), 1
        ) FROM learning_sessions WHERE user_id = u.id), 0)::NUMERIC as response_rate,
        -- Success rate: responses that don't have a mistake record
        COALESCE((SELECT ROUND(
            100.0 * COUNT(CASE WHEN NOT EXISTS(
                SELECT 1 FROM user_mistakes um WHERE um.response_id = ur.id
            ) THEN 1 END) / 
            NULLIF(COUNT(*), 0), 1
        ) FROM user_responses ur WHERE ur.user_id = u.id), 0)::NUMERIC as success_rate,
        COALESCE((SELECT ROUND(AVG(session_count)::NUMERIC, 1)
         FROM (
             SELECT DATE(created_at), COUNT(*) as session_count
             FROM learning_sessions
             WHERE user_id = u.id
             GROUP BY DATE(created_at)
         ) sub), 0)::NUMERIC as average_session_words,
        COALESCE((SELECT COUNT(*) FROM learning_sessions 
         WHERE user_id = u.id 
         AND created_at >= NOW() - INTERVAL '24 hours'), 0)::BIGINT as words_today,
        COALESCE((SELECT COUNT(*) FROM learning_sessions 
         WHERE user_id = u.id 
         AND created_at >= NOW() - INTERVAL '7 days'), 0)::BIGINT as words_this_week,
        COALESCE((SELECT COUNT(*) FROM learning_sessions 
         WHERE user_id = u.id 
         AND created_at >= NOW() - INTERVAL '30 days'), 0)::BIGINT as words_this_month,
        COALESCE((SELECT COUNT(DISTINCT DATE(created_at)) 
         FROM learning_sessions 
         WHERE user_id = u.id), 0)::INTEGER as days_active,
        COALESCE((SELECT COUNT(*) FROM user_mistakes WHERE user_id = u.id), 0)::BIGINT as total_mistakes
    FROM users u
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Get user's challenging words (from user_mistakes table)
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

-- Function 3: Get user's learning progress over time
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
        -- Correct responses = responses without mistakes
        COALESCE((SELECT COUNT(*) FROM user_responses ur 
                  WHERE ur.user_id = p_user_id 
                  AND DATE(ur.created_at AT TIME ZONE 'Europe/Berlin') = DATE(ls.created_at AT TIME ZONE 'Europe/Berlin')
                  AND NOT EXISTS(SELECT 1 FROM user_mistakes um WHERE um.response_id = ur.id)), 0)::INTEGER as correct_responses,
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
                  AND NOT EXISTS(SELECT 1 FROM user_mistakes um WHERE um.response_id = ur.id)) / 
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

-- Function 4: Get user's recent activity
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
        -- Was correct if there's a response but no mistake for that response
        EXISTS(SELECT 1 FROM user_responses ur 
               WHERE ur.session_id = ls.id 
               AND NOT EXISTS(SELECT 1 FROM user_mistakes um WHERE um.response_id = ur.id)) as was_correct,
        EXISTS(SELECT 1 FROM user_mistakes um WHERE um.session_id = ls.id) as had_mistake
    FROM learning_sessions ls
    LEFT JOIN vocabulary v ON ls.word_id = v.id
    WHERE ls.user_id = p_user_id
    ORDER BY ls.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 5: Get user's word mastery by difficulty
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

-- Function 6: Get user's learning patterns (time of day analysis)
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
        -- Success rate: responses without mistakes
        COALESCE(ROUND(100.0 * 
            (SELECT COUNT(*) FROM user_responses ur 
             WHERE ur.user_id = p_user_id 
             AND EXTRACT(HOUR FROM ur.created_at AT TIME ZONE 'Europe/Berlin') = EXTRACT(HOUR FROM ls.created_at AT TIME ZONE 'Europe/Berlin')
             AND NOT EXISTS(SELECT 1 FROM user_mistakes um WHERE um.response_id = ur.id)) / 
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

-- Function 7: Get user's progress summary (enhanced)
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
        (SELECT COUNT(DISTINCT word_id) FROM user_progress WHERE user_id = p_user_id)::INTEGER as learned_vocabulary,
        ROUND(100.0 * (SELECT COUNT(DISTINCT word_id) FROM user_progress WHERE user_id = p_user_id) / 
              NULLIF((SELECT COUNT(*) FROM vocabulary), 0), 1)::NUMERIC as learning_percentage,
        (SELECT v.difficulty_level 
         FROM user_progress up 
         JOIN vocabulary v ON up.word_id = v.id
         LEFT JOIN user_mistakes um ON um.word_id = up.word_id AND um.user_id = p_user_id
         WHERE up.user_id = p_user_id
         GROUP BY v.difficulty_level
         ORDER BY COUNT(DISTINCT up.word_id) DESC, COUNT(um.id) ASC
         LIMIT 1) as strongest_difficulty,
        (SELECT v.difficulty_level 
         FROM user_mistakes um
         JOIN vocabulary v ON um.word_id = v.id
         WHERE um.user_id = p_user_id
         GROUP BY v.difficulty_level
         ORDER BY COUNT(um.id) DESC
         LIMIT 1) as weakest_difficulty,
        (SELECT v.german_word
         FROM user_mistakes um
         JOIN vocabulary v ON um.word_id = v.id
         WHERE um.user_id = p_user_id
         GROUP BY v.id, v.german_word
         ORDER BY COUNT(um.id) DESC
         LIMIT 1) as most_difficult_word,
        (SELECT EXTRACT(HOUR FROM created_at AT TIME ZONE 'Europe/Berlin')::INTEGER
         FROM learning_sessions
         WHERE user_id = p_user_id
         GROUP BY EXTRACT(HOUR FROM created_at AT TIME ZONE 'Europe/Berlin')
         ORDER BY COUNT(*) DESC
         LIMIT 1) as best_study_hour;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NEW MISTAKE VISUALIZATION FUNCTIONS
-- ============================================================================

-- Function 8: Get mistakes grouped by type
CREATE OR REPLACE FUNCTION get_user_mistakes_by_type(p_user_id UUID)
RETURNS TABLE(
    mistake_type TEXT,
    count BIGINT,
    percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH mistake_counts AS (
        SELECT 
            COALESCE(um.mistake_type, 'Unknown') as type,
            COUNT(*) as type_count
        FROM user_mistakes um
        WHERE um.user_id = p_user_id
        GROUP BY um.mistake_type
    ),
    total_mistakes AS (
        SELECT COUNT(*)::NUMERIC as total
        FROM user_mistakes
        WHERE user_id = p_user_id
    )
    SELECT 
        mc.type as mistake_type,
        mc.type_count as count,
        ROUND(100.0 * mc.type_count / NULLIF(tm.total, 0), 1) as percentage
    FROM mistake_counts mc
    CROSS JOIN total_mistakes tm
    ORDER BY mc.type_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 9: Get mistakes grouped by category
CREATE OR REPLACE FUNCTION get_user_mistakes_by_category(p_user_id UUID)
RETURNS TABLE(
    mistake_category TEXT,
    count BIGINT,
    percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH mistake_counts AS (
        SELECT 
            COALESCE(um.mistake_category, 'Unknown') as category,
            COUNT(*) as category_count
        FROM user_mistakes um
        WHERE um.user_id = p_user_id
        GROUP BY um.mistake_category
    ),
    total_mistakes AS (
        SELECT COUNT(*)::NUMERIC as total
        FROM user_mistakes
        WHERE user_id = p_user_id
    )
    SELECT 
        mc.category as mistake_category,
        mc.category_count as count,
        ROUND(100.0 * mc.category_count / NULLIF(tm.total, 0), 1) as percentage
    FROM mistake_counts mc
    CROSS JOIN total_mistakes tm
    ORDER BY mc.category_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 10: Get mistakes grouped by severity
CREATE OR REPLACE FUNCTION get_user_mistakes_by_severity(p_user_id UUID)
RETURNS TABLE(
    severity TEXT,
    count BIGINT,
    percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH mistake_counts AS (
        SELECT 
            COALESCE(um.severity, 'Unknown') as sev,
            COUNT(*) as sev_count
        FROM user_mistakes um
        WHERE um.user_id = p_user_id
        GROUP BY um.severity
    ),
    total_mistakes AS (
        SELECT COUNT(*)::NUMERIC as total
        FROM user_mistakes
        WHERE user_id = p_user_id
    )
    SELECT 
        mc.sev as severity,
        mc.sev_count as count,
        ROUND(100.0 * mc.sev_count / NULLIF(tm.total, 0), 1) as percentage
    FROM mistake_counts mc
    CROSS JOIN total_mistakes tm
    ORDER BY 
        CASE mc.sev
            WHEN 'critical' THEN 1
            WHEN 'major' THEN 2
            WHEN 'minor' THEN 3
            ELSE 4
        END,
        mc.sev_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 11: Get overall mistake analysis
CREATE OR REPLACE FUNCTION get_user_mistake_analysis(p_user_id UUID)
RETURNS TABLE(
    total_mistakes BIGINT,
    most_common_type TEXT,
    most_common_category TEXT,
    highest_severity TEXT,
    recent_mistakes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM user_mistakes WHERE user_id = p_user_id)::BIGINT as total_mistakes,
        (SELECT um.mistake_type 
         FROM user_mistakes um 
         WHERE um.user_id = p_user_id 
         GROUP BY um.mistake_type 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as most_common_type,
        (SELECT um.mistake_category 
         FROM user_mistakes um 
         WHERE um.user_id = p_user_id 
         GROUP BY um.mistake_category 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as most_common_category,
        (SELECT um.severity 
         FROM user_mistakes um 
         WHERE um.user_id = p_user_id 
         AND um.severity IS NOT NULL
         GROUP BY um.severity 
         ORDER BY 
            CASE um.severity
                WHEN 'critical' THEN 1
                WHEN 'major' THEN 2
                WHEN 'minor' THEN 3
                ELSE 4
            END,
            COUNT(*) DESC
         LIMIT 1) as highest_severity,
        (SELECT COUNT(*) 
         FROM user_mistakes 
         WHERE user_id = p_user_id 
         AND created_at >= NOW() - INTERVAL '7 days')::BIGINT as recent_mistakes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 12: Get mistake trends over time
CREATE OR REPLACE FUNCTION get_user_mistake_trends(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    date DATE,
    mistake_count INTEGER,
    most_common_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(um.created_at AT TIME ZONE 'Europe/Berlin') as date,
        COUNT(*)::INTEGER as mistake_count,
        (SELECT mistake_type 
         FROM user_mistakes um2 
         WHERE um2.user_id = p_user_id 
         AND DATE(um2.created_at AT TIME ZONE 'Europe/Berlin') = DATE(um.created_at AT TIME ZONE 'Europe/Berlin')
         GROUP BY mistake_type 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as most_common_type
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
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'All 12 functions created successfully!';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Testing with user ID: %', test_user_id;
        RAISE NOTICE '';
        RAISE NOTICE 'Test existing functions:';
        RAISE NOTICE '1. SELECT * FROM get_user_detailed_stats(''%'');', test_user_id;
        RAISE NOTICE '2. SELECT * FROM get_user_challenging_words(''%'');', test_user_id;
        RAISE NOTICE '3. SELECT * FROM get_user_progress_timeline(''%'');', test_user_id;
        RAISE NOTICE '4. SELECT * FROM get_user_recent_activity(''%'');', test_user_id;
        RAISE NOTICE '5. SELECT * FROM get_user_word_mastery(''%'');', test_user_id;
        RAISE NOTICE '6. SELECT * FROM get_user_learning_patterns(''%'');', test_user_id;
        RAISE NOTICE '7. SELECT * FROM get_user_progress_detailed(''%'');', test_user_id;
        RAISE NOTICE '';
        RAISE NOTICE 'Test new mistake visualization functions:';
        RAISE NOTICE '8. SELECT * FROM get_user_mistakes_by_type(''%'');', test_user_id;
        RAISE NOTICE '9. SELECT * FROM get_user_mistakes_by_category(''%'');', test_user_id;
        RAISE NOTICE '10. SELECT * FROM get_user_mistakes_by_severity(''%'');', test_user_id;
        RAISE NOTICE '11. SELECT * FROM get_user_mistake_analysis(''%'');', test_user_id;
        RAISE NOTICE '12. SELECT * FROM get_user_mistake_trends(''%'', 30);', test_user_id;
        RAISE NOTICE '========================================';
    ELSE
        RAISE NOTICE 'No users found in database. Functions created but cannot test.';
    END IF;
END $$;

-- ============================================================================
-- DONE! All functions are ready for the dashboard
-- ============================================================================
