-- ============================================================================
-- FIX FOR GERMAN VOCABULARY DASHBOARD - Based on Diagnostic Output
-- ============================================================================
-- Issue: Functions returning zeros because of wrong table names and timezone
-- Solution: Use 'conversationmemory' table and time intervals instead of dates
-- 
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Copy this ENTIRE file
-- 3. Paste into SQL Editor
-- 4. Click "Run" button (or press Ctrl+Enter)
-- 5. Refresh your dashboard
-- ============================================================================

-- Fix 1: get_dashboard_stats
-- Returns: total users, words today, response rate, avg engagement
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_users INTEGER,
  words_today INTEGER,
  response_rate NUMERIC,
  avg_engagement NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Total users (works correctly)
    (SELECT COUNT(DISTINCT id) FROM users)::INTEGER as total_users,
    
    -- Words taught in last 24 hours from conversationmemory table
    (SELECT COUNT(*) 
     FROM conversationmemory 
     WHERE created_at > NOW() - INTERVAL '24 hours'
     AND sender = 'assistant')::INTEGER as words_today,
    
    -- Response rate: User messages / Assistant messages in last 7 days
    (SELECT COALESCE(ROUND(
       (COUNT(CASE WHEN sender = 'user' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(CASE WHEN sender = 'assistant' THEN 1 END), 0) * 100), 1
     ), 0)
     FROM conversationmemory 
     WHERE created_at > NOW() - INTERVAL '7 days'))::NUMERIC as response_rate,
    
    -- Average engagement: Messages per user in last 7 days
    (SELECT COALESCE(ROUND(
       COUNT(*)::DECIMAL / NULLIF(COUNT(DISTINCT user_id), 0), 1
     ), 0)
     FROM conversationmemory 
     WHERE created_at > NOW() - INTERVAL '7 days'))::NUMERIC as avg_engagement;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 2: get_daily_activity
-- Returns: Messages and responses per day for last 7 days
CREATE OR REPLACE FUNCTION get_daily_activity()
RETURNS TABLE (
  date DATE,
  messages_sent INTEGER,
  responses_received INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    COUNT(CASE WHEN sender = 'assistant' THEN 1 END)::INTEGER as messages_sent,
    COUNT(CASE WHEN sender = 'user' THEN 1 END)::INTEGER as responses_received
  FROM conversationmemory
  WHERE created_at > NOW() - INTERVAL '7 days'
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 3: get_exercise_accuracy
-- Returns: Exercise completion rate per day
CREATE OR REPLACE FUNCTION get_exercise_accuracy()
RETURNS TABLE (
  date DATE,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    COALESCE(ROUND(
      (COUNT(CASE WHEN content LIKE '%correct%' THEN 1 END)::DECIMAL / 
       NULLIF(COUNT(*), 0) * 100), 1
    ), 0)::NUMERIC as completion_rate
  FROM conversationmemory
  WHERE created_at > NOW() - INTERVAL '7 days'
  AND content LIKE '%exercise%'
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 4: get_all_sessions_summary
-- Returns: Overall session statistics
CREATE OR REPLACE FUNCTION get_all_sessions_summary()
RETURNS TABLE (
  total_sessions INTEGER,
  dates_with_data INTEGER,
  earliest_date TIMESTAMP WITH TIME ZONE,
  latest_date TIMESTAMP WITH TIME ZONE,
  session_types JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Count distinct dates as sessions
    (SELECT COUNT(DISTINCT DATE(created_at)) 
     FROM conversationmemory)::INTEGER as total_sessions,
    
    -- Count distinct dates with data
    (SELECT COUNT(DISTINCT DATE(created_at)) 
     FROM conversationmemory)::INTEGER as dates_with_data,
    
    -- Earliest message
    (SELECT MIN(created_at) 
     FROM conversationmemory) as earliest_date,
    
    -- Latest message
    (SELECT MAX(created_at) 
     FROM conversationmemory) as latest_date,
    
    -- Session types (simplified - just count by sender)
    (SELECT json_build_object(
       'learn', COUNT(CASE WHEN sender = 'assistant' THEN 1 END)::INTEGER,
       'exercise', 0,
       'review', COUNT(CASE WHEN sender = 'user' THEN 1 END)::INTEGER
     )
     FROM conversationmemory)::JSON as session_types;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the fixes worked:

-- Test 1: Check get_dashboard_stats
SELECT 'get_dashboard_stats test:' as test;
SELECT * FROM get_dashboard_stats();

-- Test 2: Check get_daily_activity
SELECT 'get_daily_activity test:' as test;
SELECT * FROM get_daily_activity();

-- Test 3: Check get_all_sessions_summary
SELECT 'get_all_sessions_summary test:' as test;
SELECT * FROM get_all_sessions_summary();

-- ============================================================================
-- If you see real numbers (not zeros), the fix worked! 
-- Now refresh your dashboard and click "Refresh Data"
-- ============================================================================

-- Diagnostic: Check what data you have
SELECT 
  'Total messages in conversationmemory' as metric,
  COUNT(*)::TEXT as value
FROM conversationmemory
UNION ALL
SELECT 
  'Messages last 24 hours',
  COUNT(*)::TEXT
FROM conversationmemory
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'Messages last 7 days',
  COUNT(*)::TEXT
FROM conversationmemory
WHERE created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
  'Assistant messages (24h)',
  COUNT(*)::TEXT
FROM conversationmemory
WHERE created_at > NOW() - INTERVAL '24 hours'
AND sender = 'assistant'
UNION ALL
SELECT 
  'User messages (7d)',
  COUNT(*)::TEXT
FROM conversationmemory
WHERE created_at > NOW() - INTERVAL '7 days'
AND sender = 'user';

-- ============================================================================
-- DONE! If all tests pass, your dashboard should now show real data!
-- ============================================================================
