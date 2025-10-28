-- ============================================================================
-- USER DETAIL PAGE - DATABASE FUNCTIONS
-- ============================================================================
-- These functions provide comprehensive statistics for individual users
-- Run this entire file in Supabase SQL Editor
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
    days_active INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.name,
        u.phone_number,
        COALESCE((SELECT COUNT(*) FROM learning_sessions ls WHERE ls.user_id = u.id), 0)::BIGINT as total_words_learned,
        COALESCE(u.current_streak, 0)::INTEGER as current_streak,
        COALESCE(u.longest_streak, 0)::INTEGER as longest_streak,
        COALESCE((SELECT COUNT(DISTINCT DATE(created_at)) FROM learning_sessions WHERE user_id = u.id), 0)::BIGINT as total_sessions,
        u.last_active,
        u.created_at as member_since,
        COALESCE((SELECT ROUND(
            100.0 * COUNT(CASE WHEN user_response IS NOT NULL THEN 1 END) / 
            NULLIF(COUNT(*), 0), 1
        ) FROM learning_sessions WHERE user_id = u.id), 0)::NUMERIC as response_rate,
        COALESCE((SELECT ROUND(
            100.0 * COUNT(CASE WHEN user_response = 'correct' OR user_response LIKE '%correct%' THEN 1 END) / 
            NULLIF(COUNT(CASE WHEN user_response IS NOT NULL THEN 1 END), 0), 1
        ) FROM learning_sessions WHERE user_id = u.id), 0)::NUMERIC as success_rate,
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
         WHERE user_id = u.id), 0)::INTEGER as days_active
    FROM users u
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Get user's challenging words (mistakes)
CREATE OR REPLACE FUNCTION get_user_challenging_words(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE(
    word TEXT,
    translation TEXT,
    times_attempted INTEGER,
    times_failed INTEGER,
    failure_rate NUMERIC,
    last_attempted TIMESTAMP WITH TIME ZONE,
    marked_hard BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(w.german_word, ls.word_id::TEXT) as word,
        COALESCE(w.english_translation, '') as translation,
        COUNT(*)::INTEGER as times_attempted,
        COUNT(CASE WHEN ls.user_response LIKE '%incorrect%' OR ls.user_response = 'incorrect' THEN 1 END)::INTEGER as times_failed,
        ROUND(100.0 * COUNT(CASE WHEN ls.user_response LIKE '%incorrect%' OR ls.user_response = 'incorrect' THEN 1 END) / 
              NULLIF(COUNT(*), 0), 1)::NUMERIC as failure_rate,
        MAX(ls.created_at) as last_attempted,
        BOOL_OR(ls.difficulty_feedback = 'hard') as marked_hard
    FROM learning_sessions ls
    LEFT JOIN words w ON ls.word_id = w.id
    WHERE ls.user_id = p_user_id
    GROUP BY w.german_word, w.english_translation, ls.word_id
    HAVING COUNT(CASE WHEN ls.user_response LIKE '%incorrect%' OR ls.user_response = 'incorrect' THEN 1 END) > 0
    ORDER BY times_failed DESC, failure_rate DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Get user's learning progress over time
CREATE OR REPLACE FUNCTION get_user_progress_timeline(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    date DATE,
    words_learned INTEGER,
    words_reviewed INTEGER,
    correct_responses INTEGER,
    incorrect_responses INTEGER,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(ls.created_at AT TIME ZONE 'Europe/Berlin') as date,
        COUNT(DISTINCT ls.id)::INTEGER as words_learned,
        COUNT(CASE WHEN ls.is_review THEN 1 END)::INTEGER as words_reviewed,
        COUNT(CASE WHEN ls.user_response LIKE '%correct%' THEN 1 END)::INTEGER as correct_responses,
        COUNT(CASE WHEN ls.user_response LIKE '%incorrect%' THEN 1 END)::INTEGER as incorrect_responses,
        ROUND(100.0 * COUNT(CASE WHEN ls.user_response LIKE '%correct%' THEN 1 END) / 
              NULLIF(COUNT(CASE WHEN ls.user_response IS NOT NULL THEN 1 END), 0), 1)::NUMERIC as success_rate
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
    user_response TEXT,
    was_correct BOOLEAN,
    session_type TEXT,
    difficulty_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ls.id,
        ls.created_at,
        COALESCE(w.german_word, 'Unknown') as word,
        COALESCE(w.english_translation, '') as translation,
        COALESCE(ls.user_response, 'No response') as user_response,
        (ls.user_response LIKE '%correct%') as was_correct,
        CASE 
            WHEN ls.is_review THEN 'Review'
            WHEN ls.is_exercise THEN 'Exercise'
            ELSE 'Learning'
        END as session_type,
        COALESCE(w.difficulty_level, 'Unknown') as difficulty_level
    FROM learning_sessions ls
    LEFT JOIN words w ON ls.word_id = w.id
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
    mastered_words INTEGER,
    in_progress INTEGER,
    needs_review INTEGER,
    mastery_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(w.difficulty_level, 'Unknown') as difficulty,
        COUNT(DISTINCT ls.word_id)::INTEGER as total_words,
        COUNT(DISTINCT CASE 
            WHEN ls.user_response LIKE '%correct%' 
            AND ls.created_at >= NOW() - INTERVAL '7 days' 
            THEN ls.word_id 
        END)::INTEGER as mastered_words,
        COUNT(DISTINCT CASE 
            WHEN ls.created_at >= NOW() - INTERVAL '7 days' 
            THEN ls.word_id 
        END)::INTEGER as in_progress,
        COUNT(DISTINCT CASE 
            WHEN ls.user_response LIKE '%incorrect%' 
            THEN ls.word_id 
        END)::INTEGER as needs_review,
        ROUND(100.0 * COUNT(DISTINCT CASE 
            WHEN ls.user_response LIKE '%correct%' 
            THEN ls.word_id 
        END) / NULLIF(COUNT(DISTINCT ls.word_id), 0), 1)::NUMERIC as mastery_percentage
    FROM learning_sessions ls
    LEFT JOIN words w ON ls.word_id = w.id
    WHERE ls.user_id = p_user_id
    GROUP BY w.difficulty_level
    ORDER BY 
        CASE w.difficulty_level
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
        EXTRACT(HOUR FROM created_at AT TIME ZONE 'Europe/Berlin')::INTEGER as hour_of_day,
        COUNT(DISTINCT DATE(created_at))::INTEGER as session_count,
        ROUND(AVG(CASE 
            WHEN user_response LIKE '%correct%' THEN 100.0 
            WHEN user_response LIKE '%incorrect%' THEN 0.0 
            ELSE NULL 
        END), 1)::NUMERIC as avg_success_rate,
        COUNT(*)::INTEGER as total_words
    FROM learning_sessions
    WHERE user_id = p_user_id
    AND user_response IS NOT NULL
    GROUP BY EXTRACT(HOUR FROM created_at AT TIME ZONE 'Europe/Berlin')
    ORDER BY hour_of_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TEST THE FUNCTIONS
-- ============================================================================
-- Replace USER_ID with an actual user ID from your users table

-- Test with first user
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    RAISE NOTICE 'Testing with user ID: %', test_user_id;
    
    -- Test each function
    RAISE NOTICE 'Testing get_user_detailed_stats...';
    PERFORM * FROM get_user_detailed_stats(test_user_id);
    
    RAISE NOTICE 'Testing get_user_challenging_words...';
    PERFORM * FROM get_user_challenging_words(test_user_id);
    
    RAISE NOTICE 'Testing get_user_progress_timeline...';
    PERFORM * FROM get_user_progress_timeline(test_user_id);
    
    RAISE NOTICE 'Testing get_user_recent_activity...';
    PERFORM * FROM get_user_recent_activity(test_user_id);
    
    RAISE NOTICE 'Testing get_user_word_mastery...';
    PERFORM * FROM get_user_word_mastery(test_user_id);
    
    RAISE NOTICE 'Testing get_user_learning_patterns...';
    PERFORM * FROM get_user_learning_patterns(test_user_id);
    
    RAISE NOTICE 'All functions created successfully!';
END $$;

-- ============================================================================
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Paste into Supabase SQL Editor
-- 3. Run it
-- 4. Functions will be created and tested
-- 5. Then update your HTML dashboard to use these functions
-- ============================================================================
