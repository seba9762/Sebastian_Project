-- ============================================================================
-- Fix: Update Analytics Functions for All Type Mismatches
-- ============================================================================
-- This script updates functions to match your actual database schema types:
-- 
-- 1. UUID instead of BIGINT for user IDs
-- 2. TEXT casts for VARCHAR columns (name, phone_number)
-- 3. TIMESTAMPTZ casts for DATE columns (session_date)
--
-- Run this AFTER the main migration if your database has:
-- - users.id: uuid (not bigint)
-- - users.name: varchar (not text)
-- - users.phone_number: varchar (not text)
-- - learning_sessions.session_date: date (not timestamptz)
-- ============================================================================

-- Drop existing functions with bigint parameters
DROP FUNCTION IF EXISTS get_user_progress_summary() CASCADE;
DROP FUNCTION IF EXISTS get_user_streak(bigint) CASCADE;
DROP FUNCTION IF EXISTS get_user_response_rate(bigint, integer) CASCADE;
DROP FUNCTION IF EXISTS calculate_user_accuracy(bigint) CASCADE;
DROP FUNCTION IF EXISTS get_user_weekly_performance(bigint) CASCADE;

-- ============================================================================
-- Function 2: get_user_progress_summary (UPDATED: user_id is now uuid)
-- Returns detailed progress summary for all users
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_progress_summary()
RETURNS TABLE (
    user_id uuid,          -- Changed from bigint to uuid
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
        u.name::text,                -- Cast varchar to text
        u.phone_number::text,        -- Cast varchar to text
        COALESCE(uw.word_count, 0),
        COALESCE(us.streak_days, 0)::integer,
        COALESCE(ROUND((urr.successful_sessions::numeric / NULLIF(urr.total_sessions, 0)) * 100, 1), 0),
        la.last_session::timestamptz -- Cast date to timestamp with time zone
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
-- Function 8: get_user_streak (UPDATED: user_id_param is now uuid)
-- Calculates the current learning streak for a specific user (last 30 days)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_streak(user_id_param uuid)  -- Changed from bigint to uuid
RETURNS TABLE (
    user_id uuid,          -- Changed from bigint to uuid
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
-- Function 11: get_user_response_rate (UPDATED: user_id_param is now uuid)
-- Calculates response success rate for a specific user
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_response_rate(user_id_param uuid, days integer DEFAULT 7)  -- Changed from bigint to uuid
RETURNS TABLE (
    user_id uuid,          -- Changed from bigint to uuid
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
-- Function 12: calculate_user_accuracy (UPDATED: user_id_param is now uuid)
-- Calculates overall accuracy for a user based on mistakes
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_user_accuracy(user_id_param uuid)  -- Changed from bigint to uuid
RETURNS TABLE (
    user_id uuid,          -- Changed from bigint to uuid
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
-- Function 13: get_user_weekly_performance (UPDATED: user_id_param is now uuid)
-- Returns weekly performance metrics for a specific user
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_weekly_performance(user_id_param uuid)  -- Changed from bigint to uuid
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
-- Comments documenting the UUID change
-- ============================================================================
COMMENT ON FUNCTION get_user_progress_summary IS 'Returns progress for all users. Uses UUID for user_id (updated from bigint).';
COMMENT ON FUNCTION get_user_streak IS 'Calculates user streak. Parameter and return type use UUID (updated from bigint).';
COMMENT ON FUNCTION get_user_response_rate IS 'Calculates user response rate. Parameter and return type use UUID (updated from bigint).';
COMMENT ON FUNCTION calculate_user_accuracy IS 'Calculates user accuracy. Parameter and return type use UUID (updated from bigint).';
COMMENT ON FUNCTION get_user_weekly_performance IS 'Returns weekly performance. Parameter use UUID (updated from bigint).';

-- ============================================================================
-- Verification
-- ============================================================================
-- Check that functions now use uuid
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'get_user_progress_summary',
    'get_user_streak',
    'get_user_response_rate',
    'calculate_user_accuracy',
    'get_user_weekly_performance'
)
ORDER BY p.proname;
