# Troubleshooting Guide

## Common Errors and Solutions

### Error 1: "column ls.vocabulary_id does not exist"

**Error Message:**
```
ERROR: 42703: column ls.vocabulary_id does not exist
LINE XX: SELECT COUNT(DISTINCT ls.vocabulary_id) AS cnt
```

**Cause:**
- Database schema has been updated to use `word_id`
- But functions are still using old column name `vocabulary_id`

**Solution:**
Apply the corrected function definitions:
```bash
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql
```

**Verification:**
```sql
-- Should work now
SELECT * FROM get_dashboard_stats();
```

---

### Error 2: "column um.mistake_date does not exist"

**Error Message:**
```
ERROR: 42703: column um.mistake_date does not exist
```

**Cause:**
- Database schema renamed `mistake_date` to `created_at`
- Functions still reference old column name

**Solution:**
Same as Error 1 - apply the corrected functions:
```bash
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql
```

---

### Error 3: "column ls.word_id does not exist"

**Error Message:**
```
ERROR: 42703: column ls.word_id does not exist
```

**Cause:**
- Your database still has the OLD schema with `vocabulary_id`
- But you're using the NEW functions that reference `word_id`

**Solution:**
You need to run the schema migration FIRST:

```sql
-- Run this BEFORE applying the analytics functions
BEGIN;

-- Rename columns in learning_sessions
ALTER TABLE learning_sessions 
  RENAME COLUMN vocabulary_id TO word_id;

-- Rename columns in user_mistakes
ALTER TABLE user_mistakes 
  RENAME COLUMN vocabulary_id TO word_id;

ALTER TABLE user_mistakes 
  RENAME COLUMN mistake_date TO created_at;

-- Rename columns in user_progress (if exists)
ALTER TABLE user_progress 
  RENAME COLUMN vocabulary_id TO word_id;

COMMIT;
```

Then apply the analytics functions:
```bash
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql
```

---

### Error 4: "function get_dashboard_stats() does not exist"

**Error Message:**
```
ERROR: 42883: function get_dashboard_stats() does not exist
```

**Cause:**
Functions haven't been created yet.

**Solution:**
Deploy the analytics functions:
```bash
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql
```

---

### Error 5: "permission denied for function get_dashboard_stats"

**Error Message:**
```
ERROR: permission denied for function get_dashboard_stats
```

**Cause:**
User doesn't have execute permission on the function.

**Solution:**
Grant execute permission:
```sql
-- For a specific user
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO your_user;

-- Or for all functions at once
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_user;

-- Or for a role
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
```

---

### Error 6: Functions return empty results (all zeros)

**Symptoms:**
- Functions execute without errors
- But all return zero values or empty results

**Possible Causes:**
1. No data in tables
2. Timezone issues
3. Date range doesn't match your data

**Solution:**

1. **Check if data exists:**
```sql
SELECT COUNT(*) FROM learning_sessions;
SELECT COUNT(*) FROM user_mistakes;
SELECT COUNT(*) FROM vocabulary;
SELECT COUNT(*) FROM users;
```

2. **Check date ranges:**
```sql
-- Check session dates
SELECT 
    MIN(session_date) as earliest,
    MAX(session_date) as latest
FROM learning_sessions;

-- Check in Berlin timezone
SELECT 
    MIN(session_date AT TIME ZONE 'Europe/Berlin') as earliest_berlin,
    MAX(session_date AT TIME ZONE 'Europe/Berlin') as latest_berlin
FROM learning_sessions;
```

3. **Test with longer date range:**
```sql
-- Try 30 days instead of 7
SELECT * FROM get_daily_activity(30);
```

---

### Error 7: Dashboard shows "column does not exist" in browser

**Symptoms:**
- Functions work in SQL editor
- But dashboard shows errors in browser console

**Cause:**
Frontend is calling old function names or using old API endpoints.

**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check Supabase credentials in dashboard HTML
4. Verify RLS policies allow access

---

## Diagnostic Queries

### Check Current Schema

```sql
-- Check learning_sessions columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'learning_sessions'
ORDER BY ordinal_position;

-- Check user_mistakes columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_mistakes'
ORDER BY ordinal_position;

-- Check vocabulary columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vocabulary'
ORDER BY ordinal_position;
```

### Check Function Definitions

```sql
-- List all analytics functions
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND (p.proname LIKE 'get_%' OR p.proname LIKE 'calculate_%')
ORDER BY p.proname;

-- View specific function source
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'get_dashboard_stats';
```

### Check Data Availability

```sql
-- Check recent activity
SELECT 
    DATE(session_date AT TIME ZONE 'Europe/Berlin') as date,
    COUNT(*) as sessions
FROM learning_sessions
WHERE session_date >= NOW() - INTERVAL '7 days'
GROUP BY DATE(session_date AT TIME ZONE 'Europe/Berlin')
ORDER BY date DESC;

-- Check user activity
SELECT 
    u.name,
    COUNT(ls.id) as sessions
FROM users u
LEFT JOIN learning_sessions ls ON u.id = ls.user_id
WHERE ls.session_date >= NOW() - INTERVAL '7 days'
GROUP BY u.id, u.name
ORDER BY sessions DESC;
```

## Quick Diagnostic Script

Run this to check everything:

```sql
-- Diagnostic Script
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '=== Schema Check ===';
    
    -- Check for word_id vs vocabulary_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'learning_sessions' AND column_name = 'word_id') THEN
        RAISE NOTICE '✓ learning_sessions has word_id';
    ELSE
        RAISE NOTICE '✗ learning_sessions missing word_id';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_mistakes' AND column_name = 'created_at') THEN
        RAISE NOTICE '✓ user_mistakes has created_at';
    ELSE
        RAISE NOTICE '✗ user_mistakes missing created_at';
    END IF;
    
    RAISE NOTICE '=== Function Check ===';
    
    -- Check if functions exist
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_dashboard_stats') THEN
        RAISE NOTICE '✓ get_dashboard_stats exists';
    ELSE
        RAISE NOTICE '✗ get_dashboard_stats missing';
    END IF;
    
    RAISE NOTICE '=== Data Check ===';
    
    -- Count records
    FOR rec IN 
        SELECT 
            'learning_sessions' as table_name,
            COUNT(*) as row_count
        FROM learning_sessions
        UNION ALL
        SELECT 'user_mistakes', COUNT(*) FROM user_mistakes
        UNION ALL
        SELECT 'vocabulary', COUNT(*) FROM vocabulary
        UNION ALL
        SELECT 'users', COUNT(*) FROM users
    LOOP
        RAISE NOTICE '  %: % rows', rec.table_name, rec.row_count;
    END LOOP;
END $$;
```

## Getting Help

If you're still having issues:

1. **Check the error message carefully** - Note the exact column name mentioned
2. **Run the diagnostic queries** above to understand your current state
3. **Verify your schema** matches the expected structure
4. **Check the deployment order**:
   - First: Schema migration (if needed)
   - Second: Analytics functions
   - Third: Test queries

## Quick Fix Flowchart

```
Error mentions "vocabulary_id"?
├─ YES → Database has word_id, apply corrected functions
└─ NO → Error mentions "word_id"?
    ├─ YES → Database has vocabulary_id, run schema migration first
    └─ NO → Different error, see specific error solutions above
```

## Contact

For additional support, see:
- **DEPLOYMENT_INSTRUCTIONS.md** - Deployment guide
- **FIX_SUMMARY.md** - Recent fixes
- **MIGRATIONS.md** - Migration documentation
- **QUICKSTART.md** - Quick start guide
