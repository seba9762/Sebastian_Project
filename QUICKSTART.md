# Quick Start Guide - Analytics Functions Migration

This guide helps you quickly deploy the analytics functions migration for the German Vocabulary Learning System.

## Prerequisites

- PostgreSQL database (or Supabase project)
- Admin access to the database
- `psql` CLI tool (or Supabase Dashboard access)

## 5-Minute Deployment

### Step 1: Verify Your Schema (2 minutes)

Check if your database has the correct column names:

```sql
-- Run this query in your database
SELECT 
    (SELECT column_name FROM information_schema.columns 
     WHERE table_name = 'learning_sessions' AND column_name IN ('word_id', 'vocabulary_id')) as ls_column,
    (SELECT column_name FROM information_schema.columns 
     WHERE table_name = 'user_mistakes' AND column_name IN ('word_id', 'vocabulary_id')) as um_word_column,
    (SELECT column_name FROM information_schema.columns 
     WHERE table_name = 'user_mistakes' AND column_name IN ('created_at', 'mistake_date')) as um_date_column;
```

**Expected Result:**
- `ls_column`: `word_id`
- `um_word_column`: `word_id`
- `um_date_column`: `created_at`

**If you get different results**, you need to run a schema migration first (see [Schema Migration](#schema-migration) section below).

### Step 2: Apply the Migration (1 minute)

#### Option A: Using psql
```bash
cd /path/to/project
psql -h your_host -U your_user -d your_database -f supabase/migrations/20251101095455_fix_analytics_functions.sql
```

#### Option B: Using Supabase Dashboard
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20251101095455_fix_analytics_functions.sql`
3. Paste and click **Run**

### Step 3: Test the Functions (2 minutes)

```sql
-- Quick smoke test
SELECT * FROM get_dashboard_stats();
SELECT * FROM get_user_progress_summary() LIMIT 1;
```

If these return results without errors, you're done! 🎉

## Full Testing (Optional)

For comprehensive testing:

```bash
# Run the full test suite
psql -h your_host -U your_user -d your_database -f sql/tests/test_analytics_functions.sql
```

## Test with Dashboard

1. Open `german_vocab_dashboard (4) copy.html` in a browser
2. Update Supabase credentials (lines 414-415):
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_KEY = 'your-anon-key';
   ```
3. Click "Test Connection" → Should see "✅ Connection successful!"
4. Click "Refresh Data" → All cards and charts should populate

## Troubleshooting

### Error: "column vocabulary_id does not exist"

Your schema still has old column names. Run the schema migration first:

```sql
-- Schema migration (only if needed)
ALTER TABLE learning_sessions 
  RENAME COLUMN vocabulary_id TO word_id;

ALTER TABLE user_mistakes 
  RENAME COLUMN vocabulary_id TO word_id;

ALTER TABLE user_mistakes 
  RENAME COLUMN mistake_date TO created_at;
```

Then retry Step 2.

### Error: "function get_dashboard_stats does not exist"

The migration didn't apply. Verify the file path and database connection.

### Functions return empty results

Normal if you have no data. Check:
```sql
SELECT COUNT(*) FROM learning_sessions;
SELECT COUNT(*) FROM users;
```

If counts are 0, your database is empty (expected for new installations).

## Schema Migration

If your database still uses the old column names, apply this migration first:

```sql
-- ============================================================================
-- Schema Migration: Rename Columns
-- Run this BEFORE the analytics functions migration
-- ============================================================================

-- Backup first!
-- pg_dump -h HOST -U USER -d DB > backup_before_schema_change.sql

BEGIN;

-- 1. Update learning_sessions
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'learning_sessions' AND column_name = 'vocabulary_id'
    ) THEN
        ALTER TABLE learning_sessions RENAME COLUMN vocabulary_id TO word_id;
        RAISE NOTICE 'Renamed learning_sessions.vocabulary_id to word_id';
    END IF;
END $$;

-- 2. Update user_mistakes (word_id)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_mistakes' AND column_name = 'vocabulary_id'
    ) THEN
        ALTER TABLE user_mistakes RENAME COLUMN vocabulary_id TO word_id;
        RAISE NOTICE 'Renamed user_mistakes.vocabulary_id to word_id';
    END IF;
END $$;

-- 3. Update user_mistakes (created_at)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_mistakes' AND column_name = 'mistake_date'
    ) THEN
        ALTER TABLE user_mistakes RENAME COLUMN mistake_date TO created_at;
        RAISE NOTICE 'Renamed user_mistakes.mistake_date to created_at';
    END IF;
END $$;

-- 4. Update user_progress (if needed)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_progress' AND column_name = 'vocabulary_id'
    ) THEN
        ALTER TABLE user_progress RENAME COLUMN vocabulary_id TO word_id;
        RAISE NOTICE 'Renamed user_progress.vocabulary_id to word_id';
    END IF;
END $$;

COMMIT;
```

Save this as `supabase/migrations/20251101095400_rename_schema_columns.sql` and run it before the analytics functions migration.

## What Gets Installed

This migration creates/updates 13 PostgreSQL functions:

### Dashboard Functions (no parameters)
- `get_dashboard_stats()` - Key metrics for last 7 days
- `get_user_progress_summary()` - All users' progress
- `get_difficulty_distribution()` - Easy/medium/hard distribution
- `get_all_sessions_summary()` - System-wide summary
- `get_words_taught_today()` - Today's statistics

### Time-Based Functions
- `get_daily_activity(days)` - Daily metrics (default: 7 days)
- `get_exercise_accuracy(days)` - Accuracy by date (default: 7 days)
- `get_active_users_count(days)` - Active users (default: 7 days)
- `get_difficult_words(limit)` - Most challenging words (default: 10)

### User-Specific Functions
- `get_user_streak(user_id)` - Learning streak for user
- `get_user_response_rate(user_id, days)` - Success rate for user
- `calculate_user_accuracy(user_id)` - Overall accuracy for user
- `get_user_weekly_performance(user_id)` - Weekly performance metrics

All functions use:
- ✅ `word_id` (not `vocabulary_id`)
- ✅ `created_at` (not `mistake_date`)
- ✅ `Europe/Berlin` timezone for all dates
- ✅ `SECURITY DEFINER` for proper access control

## Next Steps

After successful deployment:

1. **Update Your Application Code**: Ensure your frontend/backend uses the correct column names
2. **Set Up Monitoring**: Track function performance with Supabase logs
3. **Create Indexes**: See [MIGRATIONS.md](MIGRATIONS.md#performance-considerations) for recommended indexes
4. **Schedule Regular Testing**: Run the test suite after any schema changes

## Need Help?

- 📖 Full documentation: [MIGRATIONS.md](MIGRATIONS.md)
- 🧪 Test scripts: `sql/tests/test_analytics_functions.sql`
- 🔍 Schema verification: `sql/tests/verify_schema_compliance.sql`
- 📚 Function reference: [sql/README.md](sql/README.md)

## Rollback

If something goes wrong:

```bash
# Restore from backup
psql -h HOST -U USER -d DB < backup_before_schema_change.sql
```

Or drop the functions and apply old definitions:

```sql
-- Drop all analytics functions
DROP FUNCTION IF EXISTS get_dashboard_stats();
DROP FUNCTION IF EXISTS get_user_progress_summary();
-- ... (drop all 13 functions)

-- Then apply old function definitions from sql/user_analytics_functions.sql
```

## Success Checklist

- [x] Schema verified (columns renamed)
- [x] Migration applied without errors
- [x] Test queries return results
- [x] Dashboard loads and displays data
- [x] No console errors in browser
- [x] All charts and tables populate

If all checked, deployment is complete! 🚀
