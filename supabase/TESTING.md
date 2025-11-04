# Testing Guide for get_top_performers Fix

This document provides test queries to verify that the `get_top_performers()` fix correctly resolves the cartesian product issue.

## Problem Overview

**Before the fix:**
- A user with 96 records in `user_progress` was showing 4,662 words_mastered
- The multiplication was caused by a cartesian product between `user_progress` and `learning_sessions`
- Each user_progress record was counted once for each learning_session record

**After the fix:**
- The function uses a subquery to calculate words_mastered independently
- Each user_progress record is counted exactly once
- The count should match the actual records in the user_progress table

## Verification Queries

### 1. Check Actual user_progress Records for a User

```sql
-- Replace [USER_ID] with an actual user ID from your database
SELECT COUNT(*) as actual_words_mastered
FROM user_progress 
WHERE user_id = [USER_ID]
AND difficulty_level = 'easy' 
AND times_seen >= 3;
```

### 2. Check what get_top_performers Returns

```sql
-- This should match the count from query #1
SELECT user_id, username, words_mastered 
FROM get_top_performers() 
WHERE user_id = [USER_ID];
```

### 3. Detailed Comparison for All Top Performers

```sql
-- This query compares the function output with actual counts
WITH actual_counts AS (
    SELECT 
        user_id,
        COUNT(*) as actual_words_mastered
    FROM user_progress
    WHERE difficulty_level = 'easy' 
    AND times_seen >= 3
    GROUP BY user_id
),
function_results AS (
    SELECT 
        user_id,
        username,
        words_mastered as function_words_mastered
    FROM get_top_performers()
)
SELECT 
    fr.user_id,
    fr.username,
    COALESCE(ac.actual_words_mastered, 0) as actual_count,
    fr.function_words_mastered as function_count,
    CASE 
        WHEN COALESCE(ac.actual_words_mastered, 0) = fr.function_words_mastered 
        THEN '✓ MATCH' 
        ELSE '✗ MISMATCH' 
    END as status
FROM function_results fr
LEFT JOIN actual_counts ac ON ac.user_id = fr.user_id
ORDER BY fr.function_words_mastered DESC;
```

### 4. Verify No Cartesian Product

This query ensures that the function is not creating duplicate rows:

```sql
-- Count learning sessions for each user
WITH session_counts AS (
    SELECT 
        user_id,
        COUNT(*) as session_count
    FROM learning_sessions
    GROUP BY user_id
),
progress_counts AS (
    SELECT 
        user_id,
        COUNT(*) as progress_count
    FROM user_progress
    WHERE difficulty_level = 'easy' 
    AND times_seen >= 3
    GROUP BY user_id
)
SELECT 
    pc.user_id,
    pc.progress_count as actual_progress,
    sc.session_count as sessions,
    (pc.progress_count * sc.session_count) as would_be_if_cartesian,
    tp.words_mastered as function_result,
    CASE 
        WHEN tp.words_mastered = pc.progress_count THEN '✓ Correct (no cartesian product)'
        WHEN tp.words_mastered = (pc.progress_count * sc.session_count) THEN '✗ Still has cartesian product!'
        ELSE '? Unexpected result'
    END as status
FROM progress_counts pc
JOIN session_counts sc ON sc.user_id = pc.user_id
LEFT JOIN get_top_performers() tp ON tp.user_id = pc.user_id
ORDER BY pc.progress_count DESC
LIMIT 10;
```

## Expected Results

After applying the fix:

1. **Query 1 and Query 2 should return the same count** - No inflation
2. **Query 3 should show all "✓ MATCH"** - All users have accurate counts
3. **Query 4 should show "✓ Correct (no cartesian product)"** - Verification that the fix works

## Test Cases

### Test Case 1: User with Multiple Sessions
- **Setup**: User has 10 user_progress records and 50 learning_sessions
- **Expected Before Fix**: words_mastered = 500 (10 × 50)
- **Expected After Fix**: words_mastered = 10

### Test Case 2: User with No Mastered Words
- **Setup**: User has no records matching the criteria (difficulty='easy', times_seen>=3)
- **Expected**: words_mastered = 0

### Test Case 3: User with Only Learning Sessions (No Progress)
- **Setup**: User has learning_sessions but no user_progress records
- **Expected**: words_mastered = 0

### Test Case 4: Top Performer Ordering
- **Setup**: Multiple users with different counts
- **Expected**: Results ordered by words_mastered DESC, then response_rate DESC
- **Expected**: Limited to 10 results

## Manual Testing Steps

1. **Before applying migration:**
   ```sql
   -- Note the current values
   SELECT user_id, username, words_mastered 
   FROM get_top_performers() 
   LIMIT 5;
   ```

2. **Apply the migration:**
   ```sql
   -- Run the migration file
   \i supabase/migrations/20241104000000_fix_get_top_performers_words_mastered.sql
   ```

3. **After applying migration:**
   ```sql
   -- Compare with previous values
   SELECT user_id, username, words_mastered 
   FROM get_top_performers() 
   LIMIT 5;
   ```

4. **Run verification queries** (queries 1-4 above)

## Success Criteria

- ✓ All words_mastered counts match actual user_progress records
- ✓ No inflation due to multiple learning_sessions
- ✓ Function returns exactly 10 results (or fewer if less than 10 users have activity)
- ✓ Results are ordered correctly (by words_mastered DESC, response_rate DESC)
- ✓ response_rate and streak_days continue to work correctly
- ✓ Function signature and return structure unchanged (maintains API compatibility)

## Rollback (If Needed)

If you need to rollback the changes, you'll need to restore the original function definition. Please ensure you have a backup of the original function before applying the migration.

```sql
-- To view the current function definition
\df+ get_top_performers
```
