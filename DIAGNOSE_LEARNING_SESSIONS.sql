-- ============================================================================
-- DIAGNOSTIC QUERIES FOR learning_sessions TABLE
-- ============================================================================
-- Your function uses learning_sessions, not conversationmemory
-- Let's check what data exists in this table

-- Query 1: Check if learning_sessions table has any data at all
SELECT 
    'Total records in learning_sessions' as check_name,
    COUNT(*)::TEXT as result
FROM learning_sessions;

-- Query 2: Check data for TODAY (with timezone conversion)
SELECT 
    'Records for TODAY (Europe/Berlin)' as check_name,
    COUNT(*)::TEXT as result
FROM learning_sessions
WHERE DATE(created_at AT TIME ZONE 'Europe/Berlin') = DATE(NOW() AT TIME ZONE 'Europe/Berlin');

-- Query 3: Check data for last 7 days
SELECT 
    'Records for LAST 7 DAYS' as check_name,
    COUNT(*)::TEXT as result
FROM learning_sessions
WHERE created_at >= NOW() - INTERVAL '7 days';

-- Query 4: Check latest record in learning_sessions
SELECT 
    'Latest record date' as check_name,
    MAX(created_at AT TIME ZONE 'Europe/Berlin')::TEXT as result
FROM learning_sessions;

-- Query 5: Check if message_sent column has true values
SELECT 
    'Records with message_sent = true' as check_name,
    COUNT(*)::TEXT as result
FROM learning_sessions
WHERE message_sent = true;

-- Query 6: Check records by date (last 10 days)
SELECT 
    DATE(created_at AT TIME ZONE 'Europe/Berlin') as date,
    COUNT(*) as total_records,
    COUNT(CASE WHEN message_sent = true THEN 1 END) as messages_sent,
    COUNT(CASE WHEN user_response IS NOT NULL THEN 1 END) as with_response
FROM learning_sessions
WHERE created_at >= NOW() - INTERVAL '10 days'
GROUP BY DATE(created_at AT TIME ZONE 'Europe/Berlin')
ORDER BY date DESC;

-- Query 7: Check users table for active users
SELECT 
    'Active users (7 days)' as check_name,
    COUNT(*)::TEXT as result
FROM users 
WHERE last_active >= NOW() - INTERVAL '7 days';

-- Query 8: Sample of learning_sessions data
SELECT 
    id,
    user_id,
    created_at AT TIME ZONE 'Europe/Berlin' as created_at_berlin,
    message_sent,
    user_response IS NOT NULL as has_response,
    german_word
FROM learning_sessions
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Paste into Supabase SQL Editor
-- 3. Run it
-- 4. Share the results with me
-- 
-- This will help identify why your function returns zeros
-- ============================================================================
