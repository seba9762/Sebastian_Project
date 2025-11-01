# Deployment Error Fix: "function name is not unique"

## Error You Encountered

```
ERROR: 42725: function name "get_daily_activity" is not unique
HINT: Specify the argument list to select the function unambiguously.
```

## What This Means

Multiple versions of the analytics functions exist in your database with different parameter signatures. PostgreSQL doesn't know which one to drop.

## ✅ FIXED: Cleanup Script Added

A new cleanup script has been created that will remove ALL versions of the functions before deploying new ones.

## How to Deploy Now

### 3-Step Process

```bash
# Step 1: Clean up old function versions (NEW!)
psql -h HOST -U USER -d DB -f sql/cleanup_existing_functions.sql

# Step 2: Deploy corrected functions
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql

# Step 3: Test deployment
psql -h HOST -U USER -d DB -c "SELECT * FROM get_dashboard_stats();"
```

## What the Cleanup Script Does

The `sql/cleanup_existing_functions.sql` script:

1. **Drops ALL versions** of each analytics function
   - Handles functions with different parameter types (integer, int, bigint, uuid)
   - Uses CASCADE to handle dependencies
   - Uses IF EXISTS to avoid errors if function doesn't exist

2. **Covers all 13 analytics functions**
   - get_dashboard_stats
   - get_user_progress_summary
   - get_daily_activity
   - get_difficulty_distribution
   - get_exercise_accuracy
   - get_difficult_words
   - get_all_sessions_summary
   - get_user_streak
   - get_active_users_count
   - get_words_taught_today
   - get_user_response_rate
   - calculate_user_accuracy
   - get_user_weekly_performance

3. **Includes verification query**
   - Shows remaining analytics functions (should be 0 after cleanup)

## Files Added/Modified

### New Files
- ✅ `sql/cleanup_existing_functions.sql` - Removes all old function versions
- ✅ `FIXED_DEPLOYMENT_STEPS.md` - Detailed deployment guide with cleanup step

### Modified Files
- ✅ `START_HERE.md` - Updated to include cleanup step
- ✅ `TROUBLESHOOTING.md` - Added "function name is not unique" error solution

## Why This Happened

PostgreSQL allows **function overloading** - multiple functions with the same name but different parameters:

```sql
-- Example: These can coexist
get_daily_activity()           -- No parameters
get_daily_activity(integer)    -- With integer parameter
get_daily_activity(int)        -- With int parameter (different type!)
```

When the migration tried to drop `get_daily_activity(integer)`, PostgreSQL couldn't determine which version to drop if multiple existed.

## Example: Before Cleanup

```sql
-- Query to see all versions
SELECT 
    proname,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'get_daily_activity';

-- Might show:
--   proname            | arguments
-- ---------------------|-----------
--   get_daily_activity | 
--   get_daily_activity | integer
--   get_daily_activity | days integer
```

## Example: After Cleanup

```sql
-- Same query after cleanup
SELECT 
    proname,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'get_daily_activity';

-- Should show: (0 rows)
```

## Alternative: Manual Cleanup

If you prefer to see what you're deleting first:

```sql
-- List all analytics functions with their exact signatures
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    'DROP FUNCTION IF EXISTS ' || 
    n.nspname || '.' || p.proname || '(' || 
    pg_get_function_identity_arguments(p.oid) || ') CASCADE;' as drop_statement
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND (p.proname LIKE 'get_%' OR p.proname LIKE 'calculate_%')
ORDER BY p.proname;
```

Copy the `drop_statement` output and execute those statements manually.

## Verification After Deployment

```bash
# Test all functions work
psql -h HOST -U USER -d DB -f sql/tests/test_analytics_functions.sql
```

Expected result: All 13 functions execute without errors

## Quick Reference Commands

```bash
# Full deployment sequence
cd /path/to/project

# 1. Cleanup
psql -h HOST -U USER -d DB -f sql/cleanup_existing_functions.sql

# 2. Deploy
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql

# 3. Test
psql -h HOST -U USER -d DB -c "SELECT * FROM get_dashboard_stats();"

# 4. Full test suite
psql -h HOST -U USER -d DB -f sql/tests/test_analytics_functions.sql
```

## Still Having Issues?

See these documents:
- **FIXED_DEPLOYMENT_STEPS.md** - Complete deployment guide
- **TROUBLESHOOTING.md** - All error solutions
- **START_HERE.md** - Quick start guide

## Summary

✅ **Problem**: Function signature conflicts  
✅ **Solution**: Cleanup script added  
✅ **Status**: Ready to deploy with 3-step process  

Run the cleanup script first, then deploy normally!
