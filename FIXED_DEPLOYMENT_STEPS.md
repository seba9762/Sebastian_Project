# 🔧 Fixed Deployment Steps

## Issue You Encountered

```
ERROR: 42725: function name "get_daily_activity" is not unique
HINT: Specify the argument list to select the function unambiguously.
```

## Root Cause

Multiple versions of the analytics functions exist in your database with different signatures. The DROP statements need to specify exact parameter types.

## ✅ SOLUTION: 2-Step Deployment

### Step 1: Clean Up Existing Functions (NEW!)

Run the cleanup script first to remove all existing versions:

```bash
psql -h HOST -U USER -d DB -f sql/cleanup_existing_functions.sql
```

This script will:
- Drop ALL versions of each function (with different signatures)
- Use CASCADE to handle any dependencies
- Verify cleanup was successful

**Expected Output:**
```
DROP FUNCTION (multiple lines)
...
Verification query should return 0 rows
```

### Step 2: Deploy New Functions

Now deploy the corrected functions:

```bash
# Option A: Migration file (recommended)
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql

# Option B: SQL file (also works)
psql -h HOST -U USER -d DB -f sql/user_analytics_functions.sql
```

**Expected Output:**
```
DROP FUNCTION (13 lines - should succeed now)
CREATE FUNCTION (13 lines)
COMMENT ON FUNCTION (9 lines)
```

## Complete Command Sequence

```bash
# 1. Clean up existing functions
psql -h HOST -U USER -d DB -f sql/cleanup_existing_functions.sql

# 2. Deploy corrected functions
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql

# 3. Test deployment
psql -h HOST -U USER -d DB -c "SELECT * FROM get_dashboard_stats();"
```

## Why This Happens

PostgreSQL allows function overloading - multiple functions with the same name but different parameters. Your database had:

- Old versions of functions (possibly from previous deployments)
- Different parameter signatures (e.g., `get_daily_activity()` vs `get_daily_activity(integer)`)

When the migration tried to `DROP FUNCTION IF EXISTS get_daily_activity(integer)`, it couldn't determine which version to drop because multiple versions existed.

## Verification

After cleanup, verify no old functions remain:

```sql
-- Should return 0 rows
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname LIKE 'get_%' OR proname LIKE 'calculate_%'
ORDER BY proname;
```

## Alternative: Manual Cleanup

If you prefer to see what functions exist first:

```sql
-- List all analytics functions
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

Copy the `drop_statement` column output and execute those statements.

## After Successful Deployment

Test all functions:

```bash
# Run full test suite
psql -h HOST -U USER -d DB -f sql/tests/test_analytics_functions.sql
```

## Troubleshooting

### Still getting "function is not unique" error?

1. Check if cleanup script ran successfully:
   ```sql
   SELECT count(*) FROM pg_proc WHERE proname = 'get_daily_activity';
   ```
   Should return 0 after cleanup.

2. If functions still exist, use the manual cleanup query above to generate exact DROP statements.

3. Verify you have permission to DROP functions:
   ```sql
   SELECT current_user, session_user;
   ```

### Cleanup script fails with permission errors?

You may need to run as a superuser or the function owner:

```bash
# Run as superuser
psql -h HOST -U postgres -d DB -f sql/cleanup_existing_functions.sql
```

## Summary

✅ **Two-step process**:
1. `sql/cleanup_existing_functions.sql` - Remove all old versions
2. `supabase/migrations/20251101095455_fix_analytics_functions.sql` - Deploy new versions

This ensures a clean deployment without function signature conflicts.

## Need Help?

- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more error solutions
- See [DEPLOYMENT_INSTRUCTIONS.md](DEPLOYMENT_INSTRUCTIONS.md) for general deployment guide
