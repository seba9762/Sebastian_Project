-- Fix get_top_performers words_mastered calculation
-- 
-- Problem: The function was returning inflated words_mastered counts due to a cartesian
-- product between user_progress and learning_sessions tables. Both tables were joined
-- to users on user_id only, creating a cross join where each user_progress record was
-- duplicated once for each learning_session.
--
-- Solution: Use a subquery to calculate words_mastered independently from learning_sessions,
-- avoiding the cartesian product.

CREATE OR REPLACE FUNCTION get_top_performers()
RETURNS TABLE (
    user_id INT,
    username TEXT,
    words_mastered BIGINT,
    response_rate NUMERIC,
    streak_days INT,
    last_active TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.username,
        COALESCE(
            (
                SELECT COUNT(*)
                FROM user_progress up2
                WHERE up2.user_id = u.id
                AND up2.difficulty_level = 'easy'
                AND up2.times_seen >= 3
            ), 0
        ) as words_mastered,
        COALESCE(
            ROUND(
                (COUNT(DISTINCT CASE WHEN ls.type = 'exercise' THEN ls.id END)::NUMERIC / 
                 NULLIF(COUNT(DISTINCT ls.id), 0)) * 100, 
                1
            ), 
            0
        ) as response_rate,
        COALESCE(u.streak_days, 0) as streak_days,
        MAX(ls.created_at) as last_active
    FROM users u
    LEFT JOIN learning_sessions ls ON ls.user_id = u.id
    GROUP BY u.id, u.username, u.streak_days
    HAVING COUNT(DISTINCT ls.id) > 0
    ORDER BY words_mastered DESC, response_rate DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
