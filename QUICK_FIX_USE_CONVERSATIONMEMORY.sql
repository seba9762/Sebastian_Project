-- ============================================================================
-- QUICK FIX: Switch get_dashboard_stats to use conversationmemory table
-- ============================================================================
-- Your current function queries learning_sessions which appears to be empty
-- Your diagnostic showed data exists in conversationmemory table
-- This fix switches the function to use conversationmemory instead
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE(total_users bigint, words_today bigint, response_rate numeric, avg_engagement numeric)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        -- Count users active in last 7 days
        (SELECT COUNT(DISTINCT id) FROM users WHERE last_active >= NOW() - INTERVAL '7 days')::BIGINT as total_users,
        
        -- Count assistant messages (words taught) in last 24 hours from conversationmemory
        (SELECT COUNT(*) 
         FROM conversationmemory 
         WHERE created_at >= NOW() - INTERVAL '24 hours'
         AND sender = 'assistant')::BIGINT as words_today,
        
        -- Calculate response rate: user messages / assistant messages in last 7 days
        COALESCE(
            (SELECT ROUND(
                100.0 * COUNT(CASE WHEN sender = 'user' THEN 1 END) / 
                NULLIF(COUNT(CASE WHEN sender = 'assistant' THEN 1 END), 0), 1
            )
            FROM conversationmemory
            WHERE created_at >= NOW() - INTERVAL '7 days'),
            0
        ) as response_rate,
        
        -- Calculate average daily messages per user
        COALESCE(
            (SELECT ROUND(AVG(daily_messages)::numeric, 1)
             FROM (
                 SELECT user_id, COUNT(*) as daily_messages
                 FROM conversationmemory
                 WHERE created_at >= NOW() - INTERVAL '24 hours'
                 AND sender = 'assistant'
                 GROUP BY user_id
             ) sub),
            0
        ) as avg_engagement;
END;
$function$;

-- ============================================================================
-- TEST THE FIX
-- ============================================================================
-- Run this to verify the fix worked:

SELECT * FROM get_dashboard_stats();

-- You should now see real numbers instead of zeros!

-- ============================================================================
-- ALTERNATIVE: If you want to keep using learning_sessions
-- ============================================================================
-- If learning_sessions should have data but doesn't for today,
-- use 24-hour interval instead of DATE comparison:

/*
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE(total_users bigint, words_today bigint, response_rate numeric, avg_engagement numeric)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM users WHERE last_active >= NOW() - INTERVAL '7 days')::BIGINT as total_users,
        
        -- Changed: Use 24-hour interval instead of DATE comparison
        (SELECT COUNT(*) FROM learning_sessions 
         WHERE created_at >= NOW() - INTERVAL '24 hours'
         AND message_sent = true)::BIGINT as words_today,
        
        COALESCE(
            (SELECT ROUND(
                100.0 * COUNT(CASE WHEN user_response IS NOT NULL THEN 1 END) / 
                NULLIF(COUNT(*), 0), 1
            )
            FROM learning_sessions
            WHERE created_at >= NOW() - INTERVAL '7 days'),
            0
        ) as response_rate,
        
        COALESCE(
            (SELECT ROUND(AVG(daily_words)::numeric, 1)
             FROM (
                 SELECT user_id, COUNT(*) as daily_words
                 FROM learning_sessions
                 WHERE created_at >= NOW() - INTERVAL '24 hours'
                 AND message_sent = true
                 GROUP BY user_id
             ) sub),
            0
        ) as avg_engagement;
END;
$function$;
*/

-- ============================================================================
-- INSTRUCTIONS:
-- 1. Copy the main function above (lines 8-42)
-- 2. Paste into Supabase SQL Editor
-- 3. Click "Run"
-- 4. Then run: SELECT * FROM get_dashboard_stats();
-- 5. You should see real numbers!
-- 6. Refresh your dashboard and click "Refresh Data"
-- ============================================================================
