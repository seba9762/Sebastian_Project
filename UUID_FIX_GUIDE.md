# UUID Fix Guide: User ID Type Mismatch

## Error You Encountered

```
ERROR: 42804: structure of query does not match function result type
DETAIL: Returned type uuid does not match expected type bigint in column 1.
```

## Root Cause

Your database uses `uuid` for user IDs (in the `users` table), but the analytics functions were written expecting `bigint` user IDs.

## ✅ Solution: Apply UUID Fix

Run this additional SQL file AFTER the main migration:

```bash
# Step 1: Run cleanup (if you haven't already)
psql -h HOST -U USER -d DB -f sql/cleanup_existing_functions.sql

# Step 2: Run main migration
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql

# Step 3: Apply UUID fix (NEW - IMPORTANT!)
psql -h HOST -U USER -d DB -f sql/fix_uuid_user_ids.sql

# Step 4: Test
psql -h HOST -U USER -d DB -c "SELECT * FROM get_user_progress_summary() LIMIT 1;"
```

## What the UUID Fix Does

The `sql/fix_uuid_user_ids.sql` script updates 5 functions that deal with user IDs:

### Functions Updated

1. **get_user_progress_summary()**
   - Changed return type: `user_id bigint` → `user_id uuid`

2. **get_user_streak(user_id_param)**
   - Changed parameter: `bigint` → `uuid`
   - Changed return type: `user_id bigint` → `user_id uuid`

3. **get_user_response_rate(user_id_param, days)**
   - Changed parameter: `bigint` → `uuid`
   - Changed return type: `user_id bigint` → `user_id uuid`

4. **calculate_user_accuracy(user_id_param)**
   - Changed parameter: `bigint` → `uuid`
   - Changed return type: `user_id bigint` → `user_id uuid`

5. **get_user_weekly_performance(user_id_param)**
   - Changed parameter: `bigint` → `uuid`

### Functions NOT Affected

These functions don't need changes (they don't use user IDs in parameters/returns):
- get_dashboard_stats()
- get_daily_activity(days)
- get_difficulty_distribution()
- get_exercise_accuracy(days)
- get_difficult_words(limit)
- get_all_sessions_summary()
- get_active_users_count(days)
- get_words_taught_today()

## Complete Deployment Sequence

```bash
# Full deployment for UUID-based databases

# 1. Clean up old functions
psql -h HOST -U USER -d DB -f sql/cleanup_existing_functions.sql

# 2. Deploy main migration
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql

# 3. Apply UUID fix
psql -h HOST -U USER -d DB -f sql/fix_uuid_user_ids.sql

# 4. Test all functions
psql -h HOST -U USER -d DB << 'EOF'
-- Test functions that don't use user IDs
SELECT * FROM get_dashboard_stats();

-- Test functions that DO use user IDs (updated to uuid)
SELECT * FROM get_user_progress_summary() LIMIT 1;
SELECT * FROM get_daily_activity(7) LIMIT 1;

-- If you have a test user UUID, test user-specific functions:
-- Replace with your actual user UUID
SELECT * FROM get_user_streak('59d71456-8d30-4e01-a548-7724003e4e48');
EOF
```

## How to Check Your User ID Type

Run this query to see what type your users.id column is:

```sql
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'id';
```

Expected results:
- **If `uuid`**: You need the UUID fix (this guide)
- **If `bigint` or `integer`**: You don't need the UUID fix

## Verification After Fix

```sql
-- Should work now without errors
SELECT * FROM get_user_progress_summary() LIMIT 1;

-- Check function signatures
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'get_user_progress_summary',
    'get_user_streak',
    'get_user_response_rate'
)
ORDER BY p.proname;
```

Expected output should show `uuid` types:
```
function_name               | arguments
---------------------------|------------------
get_user_progress_summary  | 
get_user_streak            | user_id_param uuid
get_user_response_rate     | user_id_param uuid, days integer DEFAULT 7
```

## Common Questions

### Q: Do I always need the UUID fix?

A: Only if your `users.id` column is type `uuid`. Check with:
```sql
SELECT data_type FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';
```

### Q: What if I have bigint user IDs?

A: You don't need the UUID fix. Just run steps 1-2 of the deployment.

### Q: Can I run the UUID fix even if I don't need it?

A: No, it will cause errors if your user IDs are bigint. Only run it if needed.

### Q: What about other tables with user_id columns?

A: The fix handles all user_id references in the analytics functions. Your database tables don't need to change - only the function definitions.

## Testing with Your User UUID

Replace `YOUR_USER_UUID` with an actual UUID from your users table:

```bash
# Get a user UUID
psql -h HOST -U USER -d DB -c "SELECT id FROM users LIMIT 1;"

# Test with that UUID
psql -h HOST -U USER -d DB -c "SELECT * FROM get_user_streak('YOUR_USER_UUID');"
```

## Rollback

If you need to rollback the UUID changes:

```bash
# Restore from backup
psql -h HOST -U USER -d DB < backup.sql

# Or reapply the original migration (if user IDs should be bigint)
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql
```

## Summary

✅ **Problem**: User IDs are UUID but functions expect bigint  
✅ **Solution**: Apply `sql/fix_uuid_user_ids.sql` after main migration  
✅ **Affected**: 5 out of 13 functions  
✅ **Status**: Ready to deploy with UUID support  

## Quick Reference

```bash
# One-line deployment for UUID databases
psql -h HOST -U USER -d DB -f sql/cleanup_existing_functions.sql && \
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql && \
psql -h HOST -U USER -d DB -f sql/fix_uuid_user_ids.sql && \
echo "✅ Deployment complete!"
```

## Need Help?

- **TROUBLESHOOTING.md** - General error solutions
- **FIXED_DEPLOYMENT_STEPS.md** - Step-by-step deployment
- **START_HERE.md** - Quick start guide
