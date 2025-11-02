-- ============================================================================
-- Fix: Update get_difficult_words to Handle VARCHAR in Vocabulary Table
-- ============================================================================
-- This script fixes the get_difficult_words function to handle VARCHAR columns
-- in the vocabulary table (word, translation).
--
-- Error Fixed:
-- "Returned type character varying(200) does not match expected type text"
--
-- Run this AFTER the main migration and UUID fix if vocabulary columns are VARCHAR.
-- ============================================================================

-- Drop existing function
DROP FUNCTION IF EXISTS get_difficult_words(integer) CASCADE;

-- ============================================================================
-- Function: get_difficult_words (FIXED with VARCHAR casts)
-- Returns the most challenging words based on mistake frequency
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
        ws.word::text,              -- Cast VARCHAR to TEXT
        ws.translation::text,        -- Cast VARCHAR to TEXT
        ws.times_taught,
        ws.mistake_count,
        ROUND((ws.mistake_count::numeric / NULLIF(ws.times_taught, 0)) * 100, 1) AS difficulty_pct
    FROM word_stats ws
    WHERE ws.mistake_count > 0
    ORDER BY difficulty_pct DESC, ws.mistake_count DESC
    LIMIT limit_count;
END;
$$;

-- Add comment
COMMENT ON FUNCTION get_difficult_words IS 
    'Updated to use word_id and handle VARCHAR columns with ::text casts. Returns word, translation, times_taught, marked_hard, difficulty_pct.';

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Test the function
SELECT 'Testing get_difficult_words...' as status;
SELECT * FROM get_difficult_words(5);
SELECT '✅ get_difficult_words fixed!' as status;
