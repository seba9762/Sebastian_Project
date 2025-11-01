-- ============================================================================
-- Migration: Fix Analytics Functions - Schema Column Updates
-- Created: 2025-11-01
-- ============================================================================
-- 
-- DESCRIPTION:
-- This migration updates all 12 analytics functions to align with the updated
-- database schema. The changes address column renames and ensure consistency
-- across the German Vocabulary Learning System.
--
-- SCHEMA CHANGES APPLIED:
-- 1. learning_sessions.vocabulary_id → learning_sessions.word_id
-- 2. user_mistakes.vocabulary_id → user_mistakes.word_id  
-- 3. user_mistakes.mistake_date → user_mistakes.created_at
-- 4. Confirmed vocabulary.word and vocabulary.translation (already correct)
-- 5. Difficulty level sourced from user_progress.difficulty_level (not vocabulary)
-- 6. Success logic based on absence of user_mistakes records (no is_correct column)
-- 7. All timestamps use AT TIME ZONE 'Europe/Berlin' for consistent date handling
--
-- SECURITY:
-- All functions use SECURITY DEFINER to run with elevated privileges for
-- cross-user analytics while maintaining proper access control.
--
-- ROLLBACK:
-- To rollback, restore the previous function definitions with old column names:
-- - word_id → vocabulary_id in learning_sessions and user_mistakes
-- - created_at → mistake_date in user_mistakes
--
-- ============================================================================

-- Drop existing functions to ensure clean recreation
DROP FUNCTION IF EXISTS get_dashboard_stats();
DROP FUNCTION IF EXISTS get_user_progress_summary();
DROP FUNCTION IF EXISTS get_daily_activity(integer);
DROP FUNCTION IF EXISTS get_difficulty_distribution();
DROP FUNCTION IF EXISTS get_exercise_accuracy(integer);
DROP FUNCTION IF EXISTS get_difficult_words(integer);
DROP FUNCTION IF EXISTS get_all_sessions_summary();
DROP FUNCTION IF EXISTS get_user_streak(bigint);
DROP FUNCTION IF EXISTS get_active_users_count(integer);
DROP FUNCTION IF EXISTS get_words_taught_today();
DROP FUNCTION IF EXISTS get_user_response_rate(bigint, integer);
DROP FUNCTION IF EXISTS calculate_user_accuracy(bigint);
DROP FUNCTION IF EXISTS get_user_weekly_performance(bigint);

-- ============================================================================
-- Function 1: get_dashboard_stats
-- Returns key dashboard statistics for the last 7 days
-- Uses: word_id (not vocabulary_id), created_at (not mistake_date)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_users bigint,
    words_today bigint,
    response_rate numeric,
    avg_engagement numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH berlin_now AS (
        -- All date comparisons use Europe/Berlin timezone for consistency
        SELECT (NOW() AT TIME ZONE 'Europe/Berlin')::date AS today
    ),
    active_users AS (
        SELECT COUNT(DISTINCT ls.user_id) AS cnt
        FROM learning_sessions ls
        CROSS JOIN berlin_now bn
        WHERE (ls.session_date AT TIME ZONE 'Europe/Berlin')::date >= bn.today - INTERVAL '7 days'
    ),
    words_today_count AS (
        -- Changed from vocabulary_id to word_id
        SELECT COUNT(DISTINCT ls.word_id) AS cnt
        FROM learning_sessions ls
        CROSS JOIN berlin_now bn
        WHERE (ls.session_date AT TIME ZONE 'Europe/Berlin')::date = bn.today
    ),
    message_stats AS (
        SELECT 
            COUNT(*) AS total_messages,
            -- Success = no corresponding user_mistakes record
            -- Uses word_id and created_at
            COUNT(DISTINCT CASE 
                WHEN NOT EXISTS (
                    SELECT 1 FROM user_mistakes um 
                    WHERE um.user_id = ls.user_id 
                    AND um.word_id = ls.word_id
                    AND um.created_at >= ls.session_date
                ) 
                THEN ls.id 
            END) AS successful_responses
        FROM learning_sessions ls
        CROSS JOIN berlin_now bn
        WHERE (ls.session_date AT TIME ZONE 'Europe/Berlin')::date >= bn.today - INTERVAL '7 days'
    ),
    daily_engagement AS (
        SELECT 
            AVG(daily_words) AS avg_words
        FROM (
            SELECT 
                ls.user_id,
                (ls.session_date AT TIME ZONE 'Europe/Berlin')::date AS session_day,
                COUNT(DISTINCT ls.word_id) AS daily_words
            FROM learning_sessions ls
            CROSS JOIN berlin_now bn
            WHERE (ls.session_date AT TIME ZONE 'Europe/Berlin')::date >= bn.today - INTERVAL '7 days'
            GROUP BY ls.user_id, (ls.session_date AT TIME ZONE 'Europe/Berlin')::date
        ) daily_data
    )
    SELECT 
        au.cnt,
        wtc.cnt,
        COALESCE(ROUND((ms.successful_responses::numeric / NULLIF(ms.total_messages, 0)) * 100, 1), 0),
        COALESCE(ROUND(de.avg_words, 1), 0)
    FROM active_users au
    CROSS JOIN words_today_count wtc
    CROSS JOIN message_stats ms
    CROSS JOIN daily_engagement de;
END;
$$;

-- ============================================================================
-- Function 2: get_user_progress_summary
-- Returns detailed progress summary for all users
-- Uses: word_id (not vocabulary_id), created_at (not mistake_date)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_progress_summary()
RETURNS TABLE (
    user_id bigint,
    name text,
    phone_number text,
    words_learned bigint,
    current_streak integer,
    response_rate numeric,
    last_active timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH berlin_now AS (
        SELECT NOW() AT TIME ZONE 'Europe/Berlin' AS now_berlin
    ),
    user_words AS (
        SELECT 
            ls.user_id,
            COUNT(DISTINCT ls.word_id) AS word_count
        FROM learning_sessions ls
        GROUP BY ls.user_id
    ),
    user_streaks AS (
        SELECT 
            ls.user_id,
            COUNT(DISTINCT (ls.session_date AT TIME ZONE 'Europe/Berlin')::date) AS streak_days
        FROM learning_sessions ls
        CROSS JOIN berlin_now bn
        WHERE (ls.session_date AT TIME ZONE 'Europe/Berlin')::date >= (bn.now_berlin::date - INTERVAL '30 days')
        GROUP BY ls.user_id
    ),
    user_response_rates AS (
        SELECT 
            ls.user_id,
            COUNT(*) AS total_sessions,
            COUNT(*) FILTER (
                WHERE NOT EXISTS (
                    SELECT 1 FROM user_mistakes um 
                    WHERE um.user_id = ls.user_id 
                    AND um.word_id = ls.word_id
                    AND um.created_at >= ls.session_date
                )
            ) AS successful_sessions
        FROM learning_sessions ls
        CROSS JOIN berlin_now bn
        WHERE (ls.session_date AT TIME ZONE 'Europe/Berlin')::date >= (bn.now_berlin::date - INTERVAL '7 days')
        GROUP BY ls.user_id
    ),
    last_activity AS (
        SELECT 
            ls.user_id,
            MAX(ls.session_date) AS last_session
        FROM learning_sessions ls
        GROUP BY ls.user_id
    )
    SELECT 
        u.id,
        u.name,
        u.phone_number,
        COALESCE(uw.word_count, 0),
        COALESCE(us.streak_days, 0)::integer,
        COALESCE(ROUND((urr.successful_sessions::numeric / NULLIF(urr.total_sessions, 0)) * 100, 1), 0),
        la.last_session
    FROM users u
    LEFT JOIN user_words uw ON u.id = uw.user_id
    LEFT JOIN user_streaks us ON u.id = us.user_id
    LEFT JOIN user_response_rates urr ON u.id = urr.user_id
    LEFT JOIN last_activity la ON u.id = la.user_id
    WHERE la.last_session IS NOT NULL
    ORDER BY uw.word_count DESC NULLS LAST;
END;
$$;

-- ============================================================================
-- Function 3: get_daily_activity
-- Returns daily activity metrics for the specified number of days
-- Uses: word_id (not vocabulary_id), created_at (not mistake_date)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_daily_activity(days integer DEFAULT 7)
RETURNS TABLE (
    date date,
    messages_sent bigint,
    responses_received bigint,
    active_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH berlin_now AS (
        SELECT (NOW() AT TIME ZONE 'Europe/Berlin')::date AS today
    ),
    date_series AS (
        SELECT 
            generate_series(
                (SELECT today - (days - 1) FROM berlin_now),
                (SELECT today FROM berlin_now),
                '1 day'::interval
            )::date AS activity_date
    )
    SELECT 
        ds.activity_date,
        COALESCE(COUNT(ls.id), 0) AS messages_sent,
        COALESCE(COUNT(ls.id) FILTER (
            WHERE NOT EXISTS (
                SELECT 1 FROM user_mistakes um 
                WHERE um.user_id = ls.user_id 
                AND um.word_id = ls.word_id
                AND um.created_at >= ls.session_date
            )
        ), 0) AS responses_received,
        COALESCE(COUNT(DISTINCT ls.user_id), 0) AS active_users
    FROM date_series ds
    LEFT JOIN learning_sessions ls ON (ls.session_date AT TIME ZONE 'Europe/Berlin')::date = ds.activity_date
    GROUP BY ds.activity_date
    ORDER BY ds.activity_date;
END;
$$;

-- ============================================================================
-- Function 4: get_difficulty_distribution
-- Returns distribution of difficulty levels from user_progress
-- Note: Difficulty is in user_progress, NOT in vocabulary table
-- ============================================================================
CREATE OR REPLACE FUNCTION get_difficulty_distribution()
RETURNS TABLE (
    difficulty text,
    count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(up.difficulty_level, 'unknown') AS difficulty,
        COUNT(*) AS count
    FROM user_progress up
    WHERE up.difficulty_level IS NOT NULL
    GROUP BY up.difficulty_level
    ORDER BY 
        CASE up.difficulty_level
            WHEN 'easy' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'hard' THEN 3
            ELSE 4
        END;
END;
$$;

-- ============================================================================
-- Function 5: get_exercise_accuracy
-- Returns exercise completion/accuracy rates by date
-- Uses: word_id (not vocabulary_id), created_at (not mistake_date)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_exercise_accuracy(days integer DEFAULT 7)
RETURNS TABLE (
    date date,
    total_exercises bigint,
    successful_exercises bigint,
    completion_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH berlin_now AS (
        SELECT (NOW() AT TIME ZONE 'Europe/Berlin')::date AS today
    ),
    date_series AS (
        SELECT 
            generate_series(
                (SELECT today - (days - 1) FROM berlin_now),
                (SELECT today FROM berlin_now),
                '1 day'::interval
            )::date AS activity_date
    )
    SELECT 
        ds.activity_date,
        COALESCE(COUNT(ls.id), 0) AS total_exercises,
        COALESCE(COUNT(ls.id) FILTER (
            WHERE NOT EXISTS (
                SELECT 1 FROM user_mistakes um 
                WHERE um.user_id = ls.user_id 
                AND um.word_id = ls.word_id
                AND um.created_at >= ls.session_date
            )
        ), 0) AS successful_exercises,
        COALESCE(
            ROUND(
                (COUNT(ls.id) FILTER (
                    WHERE NOT EXISTS (
                        SELECT 1 FROM user_mistakes um 
                        WHERE um.user_id = ls.user_id 
                        AND um.word_id = ls.word_id
                        AND um.created_at >= ls.session_date
                    )
                )::numeric / NULLIF(COUNT(ls.id), 0)) * 100, 
                1
            ), 
            0
        ) AS completion_rate
    FROM date_series ds
    LEFT JOIN learning_sessions ls ON (ls.session_date AT TIME ZONE 'Europe/Berlin')::date = ds.activity_date
    GROUP BY ds.activity_date
    ORDER BY ds.activity_date;
END;
$$;

-- ============================================================================
-- Function 6: get_difficult_words
-- Returns the most challenging words based on mistake frequency
-- Uses: word_id (not vocabulary_id)
-- Note: vocabulary.word and vocabulary.translation (correct column names)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_difficult_words(limit_count integer DEFAULT 10)
RETURNS TABLE (
    word text,
    translation text,
    times_taught bigint,
    marked_hard bigint,
    difficulty_pct numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH word_stats AS (
        SELECT 
            v.id,
            v.word,
            v.translation,
            COUNT(DISTINCT ls.id) AS times_taught,
            COUNT(DISTINCT um.id) AS mistake_count
        FROM vocabulary v
        LEFT JOIN learning_sessions ls ON v.id = ls.word_id
        LEFT JOIN user_mistakes um ON v.id = um.word_id
        GROUP BY v.id, v.word, v.translation
        HAVING COUNT(DISTINCT ls.id) > 0
    )
    SELECT 
        ws.word,
        ws.translation,
        ws.times_taught,
        ws.mistake_count,
        ROUND((ws.mistake_count::numeric / NULLIF(ws.times_taught, 0)) * 100, 1) AS difficulty_pct
    FROM word_stats ws
    WHERE ws.mistake_count > 0
    ORDER BY difficulty_pct DESC, ws.mistake_count DESC
    LIMIT limit_count;
END;
$$;

-- ============================================================================
-- Function 7: get_all_sessions_summary
-- Returns system-wide session summary
-- ============================================================================
CREATE OR REPLACE FUNCTION get_all_sessions_summary()
RETURNS TABLE (
    total_sessions bigint,
    session_types json,
    dates_with_data bigint,
    earliest_date date,
    latest_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH session_summary AS (
        SELECT 
            COUNT(*) AS total_count,
            COUNT(DISTINCT (ls.session_date AT TIME ZONE 'Europe/Berlin')::date) AS unique_dates,
            MIN((ls.session_date AT TIME ZONE 'Europe/Berlin')::date) AS min_date,
            MAX((ls.session_date AT TIME ZONE 'Europe/Berlin')::date) AS max_date
        FROM learning_sessions ls
    ),
    session_type_counts AS (
        SELECT 
            COALESCE(ls.session_type, 'unknown') AS session_type,
            COUNT(*) AS type_count
        FROM learning_sessions ls
        GROUP BY ls.session_type
    )
    SELECT 
        ss.total_count,
        (
            SELECT json_object_agg(stc.session_type, stc.type_count)
            FROM session_type_counts stc
        ) AS session_types,
        ss.unique_dates,
        ss.min_date,
        ss.max_date
    FROM session_summary ss;
END;
$$;

-- ============================================================================
-- Function 8: get_user_streak
-- Calculates the current learning streak for a specific user (last 30 days)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_streak(user_id_param bigint)
RETURNS TABLE (
    user_id bigint,
    current_streak integer,
    longest_streak integer,
    total_active_days bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH berlin_now AS (
        SELECT (NOW() AT TIME ZONE 'Europe/Berlin')::date AS today
    ),
    active_dates AS (
        SELECT DISTINCT (ls.session_date AT TIME ZONE 'Europe/Berlin')::date AS active_date
        FROM learning_sessions ls
        CROSS JOIN berlin_now bn
        WHERE ls.user_id = user_id_param
        AND (ls.session_date AT TIME ZONE 'Europe/Berlin')::date >= bn.today - INTERVAL '30 days'
        ORDER BY active_date DESC
    ),
    streak_calc AS (
        SELECT 
            active_date,
            active_date - ROW_NUMBER() OVER (ORDER BY active_date)::integer AS streak_group
        FROM active_dates
    ),
    streaks AS (
        SELECT 
            COUNT(*) AS streak_length,
            MIN(active_date) AS streak_start
        FROM streak_calc
        GROUP BY streak_group
    )
    SELECT 
        user_id_param,
        COALESCE((
            SELECT s.streak_length::integer
            FROM streaks s
            CROSS JOIN berlin_now bn
            WHERE s.streak_start + (s.streak_length - 1)::integer >= bn.today - 1
            ORDER BY s.streak_length DESC
            LIMIT 1
        ), 0),
        COALESCE(MAX(s.streak_length)::integer, 0),
        (SELECT COUNT(*)::bigint FROM active_dates)
    FROM streaks s;
END;
$$;

-- ============================================================================
-- Function 9: get_active_users_count
-- Returns count of active users in the specified time period
-- ============================================================================
CREATE OR REPLACE FUNCTION get_active_users_count(days integer DEFAULT 7)
RETURNS TABLE (
    active_users bigint,
    total_users bigint,
    activity_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH berlin_now AS (
        SELECT (NOW() AT TIME ZONE 'Europe/Berlin')::date AS today
    ),
    active_count AS (
        SELECT COUNT(DISTINCT ls.user_id) AS active_cnt
        FROM learning_sessions ls
        CROSS JOIN berlin_now bn
        WHERE (ls.session_date AT TIME ZONE 'Europe/Berlin')::date >= bn.today - days
    ),
    total_count AS (
        SELECT COUNT(*) AS total_cnt
        FROM users u
    )
    SELECT 
        ac.active_cnt,
        tc.total_cnt,
        ROUND((ac.active_cnt::numeric / NULLIF(tc.total_cnt, 0)) * 100, 1) AS activity_rate
    FROM active_count ac
    CROSS JOIN total_count tc;
END;
$$;

-- ============================================================================
-- Function 10: get_words_taught_today
-- Returns count of unique words taught today
-- Uses: word_id (not vocabulary_id)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_words_taught_today()
RETURNS TABLE (
    words_today bigint,
    unique_users bigint,
    total_sessions bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH berlin_now AS (
        SELECT (NOW() AT TIME ZONE 'Europe/Berlin')::date AS today
    )
    SELECT 
        COUNT(DISTINCT ls.word_id)::bigint AS words_today,
        COUNT(DISTINCT ls.user_id)::bigint AS unique_users,
        COUNT(*)::bigint AS total_sessions
    FROM learning_sessions ls
    CROSS JOIN berlin_now bn
    WHERE (ls.session_date AT TIME ZONE 'Europe/Berlin')::date = bn.today;
END;
$$;

-- ============================================================================
-- Function 11: get_user_response_rate
-- Calculates response success rate for a specific user
-- Uses: word_id (not vocabulary_id), created_at (not mistake_date)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_response_rate(user_id_param bigint, days integer DEFAULT 7)
RETURNS TABLE (
    user_id bigint,
    total_responses bigint,
    successful_responses bigint,
    response_rate numeric,
    mistake_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH berlin_now AS (
        SELECT (NOW() AT TIME ZONE 'Europe/Berlin')::date AS today
    ),
    response_stats AS (
        SELECT 
            COUNT(*) AS total_count,
            COUNT(*) FILTER (
                WHERE NOT EXISTS (
                    SELECT 1 FROM user_mistakes um 
                    WHERE um.user_id = ls.user_id 
                    AND um.word_id = ls.word_id
                    AND um.created_at >= ls.session_date
                )
            ) AS success_count,
            COUNT(DISTINCT um.id) AS mistake_total
        FROM learning_sessions ls
        CROSS JOIN berlin_now bn
        LEFT JOIN user_mistakes um ON ls.user_id = um.user_id 
            AND ls.word_id = um.word_id
            AND um.created_at >= ls.session_date
        WHERE ls.user_id = user_id_param
        AND (ls.session_date AT TIME ZONE 'Europe/Berlin')::date >= bn.today - days
    )
    SELECT 
        user_id_param,
        rs.total_count::bigint,
        rs.success_count::bigint,
        COALESCE(ROUND((rs.success_count::numeric / NULLIF(rs.total_count, 0)) * 100, 1), 0),
        rs.mistake_total::bigint
    FROM response_stats rs;
END;
$$;

-- ============================================================================
-- Function 12: calculate_user_accuracy
-- Calculates overall accuracy for a user based on mistakes
-- Uses: word_id (not vocabulary_id), created_at (not mistake_date)
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_user_accuracy(user_id_param bigint)
RETURNS TABLE (
    user_id bigint,
    total_attempts bigint,
    successful_attempts bigint,
    failed_attempts bigint,
    accuracy_rate numeric,
    most_difficult_word text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH user_attempts AS (
        SELECT 
            COUNT(*) AS total,
            COUNT(*) FILTER (
                WHERE NOT EXISTS (
                    SELECT 1 FROM user_mistakes um 
                    WHERE um.user_id = ls.user_id 
                    AND um.word_id = ls.word_id
                    AND um.created_at >= ls.session_date
                )
            ) AS successful,
            COUNT(DISTINCT um.id) AS failed
        FROM learning_sessions ls
        LEFT JOIN user_mistakes um ON ls.user_id = um.user_id 
            AND ls.word_id = um.word_id
            AND um.created_at >= ls.session_date
        WHERE ls.user_id = user_id_param
    ),
    most_difficult AS (
        SELECT v.word
        FROM user_mistakes um
        JOIN vocabulary v ON um.word_id = v.id
        WHERE um.user_id = user_id_param
        GROUP BY v.id, v.word
        ORDER BY COUNT(*) DESC
        LIMIT 1
    )
    SELECT 
        user_id_param,
        ua.total::bigint,
        ua.successful::bigint,
        ua.failed::bigint,
        COALESCE(ROUND((ua.successful::numeric / NULLIF(ua.total, 0)) * 100, 1), 0),
        md.word
    FROM user_attempts ua
    LEFT JOIN most_difficult md ON true;
END;
$$;

-- ============================================================================
-- Function 13: get_user_weekly_performance
-- Returns weekly performance metrics for a specific user
-- Uses: word_id (not vocabulary_id), created_at (not mistake_date)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_weekly_performance(user_id_param bigint)
RETURNS TABLE (
    week_start date,
    week_end date,
    words_practiced bigint,
    total_sessions bigint,
    successful_sessions bigint,
    accuracy_rate numeric,
    active_days bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH berlin_now AS (
        SELECT (NOW() AT TIME ZONE 'Europe/Berlin')::date AS today
    ),
    last_8_weeks AS (
        SELECT 
            generate_series(
                (SELECT today - INTERVAL '8 weeks' FROM berlin_now),
                (SELECT today FROM berlin_now),
                '1 week'::interval
            )::date AS week_start_date
    ),
    weekly_data AS (
        SELECT 
            lw.week_start_date,
            lw.week_start_date + INTERVAL '6 days' AS week_end_date,
            COUNT(DISTINCT ls.word_id) AS words_count,
            COUNT(*) AS sessions_count,
            COUNT(*) FILTER (
                WHERE NOT EXISTS (
                    SELECT 1 FROM user_mistakes um 
                    WHERE um.user_id = ls.user_id 
                    AND um.word_id = ls.word_id
                    AND um.created_at >= ls.session_date
                )
            ) AS successful_count,
            COUNT(DISTINCT (ls.session_date AT TIME ZONE 'Europe/Berlin')::date) AS active_days_count
        FROM last_8_weeks lw
        LEFT JOIN learning_sessions ls ON ls.user_id = user_id_param
            AND (ls.session_date AT TIME ZONE 'Europe/Berlin')::date >= lw.week_start_date
            AND (ls.session_date AT TIME ZONE 'Europe/Berlin')::date < lw.week_start_date + INTERVAL '7 days'
        GROUP BY lw.week_start_date
    )
    SELECT 
        wd.week_start_date,
        wd.week_end_date::date,
        wd.words_count::bigint,
        wd.sessions_count::bigint,
        wd.successful_count::bigint,
        COALESCE(ROUND((wd.successful_count::numeric / NULLIF(wd.sessions_count, 0)) * 100, 1), 0),
        wd.active_days_count::bigint
    FROM weekly_data wd
    ORDER BY wd.week_start_date DESC;
END;
$$;

-- ============================================================================
-- End of Migration
-- ============================================================================

-- Add helpful comment about what was changed
COMMENT ON FUNCTION get_dashboard_stats IS 'Updated to use word_id instead of vocabulary_id and created_at instead of mistake_date. All dates use Europe/Berlin timezone.';
COMMENT ON FUNCTION get_user_progress_summary IS 'Updated to use word_id instead of vocabulary_id and created_at instead of mistake_date.';
COMMENT ON FUNCTION get_daily_activity IS 'Updated to use word_id instead of vocabulary_id and created_at instead of mistake_date.';
COMMENT ON FUNCTION get_difficulty_distribution IS 'Sources difficulty from user_progress table, not vocabulary table.';
COMMENT ON FUNCTION get_exercise_accuracy IS 'Updated to use word_id instead of vocabulary_id and created_at instead of mistake_date.';
COMMENT ON FUNCTION get_difficult_words IS 'Updated to use word_id instead of vocabulary_id. Uses vocabulary.word and vocabulary.translation.';
COMMENT ON FUNCTION get_user_response_rate IS 'Updated to use word_id instead of vocabulary_id and created_at instead of mistake_date.';
COMMENT ON FUNCTION calculate_user_accuracy IS 'Updated to use word_id instead of vocabulary_id and created_at instead of mistake_date.';
COMMENT ON FUNCTION get_user_weekly_performance IS 'New function for weekly performance tracking. Uses word_id and created_at.';
