# Database Migrations Documentation

## Overview

This document describes the database migrations for the German Vocabulary Learning System, with deployment instructions, rollback procedures, and testing guidelines.

## Migration Files

All migration files are located in the `supabase/migrations/` directory and follow the naming convention: `YYYYMMDDHHMMSS_description.sql`

---

## Migration: 20251101095455_fix_analytics_functions.sql

### Description

This migration updates all 12 analytics functions to align with the updated database schema. The changes address column renames across multiple tables to ensure consistency and resolve "column does not exist" errors.

### Schema Changes

#### 1. learning_sessions Table
- **Old**: `vocabulary_id` (bigint)
- **New**: `word_id` (bigint)
- **Impact**: All analytics functions that query learning sessions now use `word_id`

#### 2. user_mistakes Table
- **Old**: `vocabulary_id` (bigint) and `mistake_date` (timestamp)
- **New**: `word_id` (bigint) and `created_at` (timestamp)
- **Impact**: All mistake-related queries updated to use new column names

#### 3. vocabulary Table
- **Confirmed**: Uses `word` and `translation` columns (not `german_word` and `english_translation`)
- **Confirmed**: No `difficulty_level` column (moved to `user_progress` table)

#### 4. user_progress Table
- **Confirmed**: Contains `difficulty_level` column for per-user word difficulty tracking

### Functions Updated

1. **get_dashboard_stats()** - Dashboard statistics for last 7 days
2. **get_user_progress_summary()** - Detailed progress for all users
3. **get_daily_activity(days)** - Daily activity metrics
4. **get_difficulty_distribution()** - Difficulty level distribution
5. **get_exercise_accuracy(days)** - Exercise completion rates
6. **get_difficult_words(limit_count)** - Most challenging words
7. **get_all_sessions_summary()** - System-wide session summary
8. **get_user_streak(user_id_param)** - Learning streak calculation
9. **get_active_users_count(days)** - Active user counts
10. **get_words_taught_today()** - Today's word statistics
11. **get_user_response_rate(user_id_param, days)** - User response success rate
12. **calculate_user_accuracy(user_id_param)** - Overall user accuracy
13. **get_user_weekly_performance(user_id_param)** - Weekly performance metrics (NEW)

### Key Design Changes

#### Success Rate Logic
All functions now determine success by the **absence** of a `user_mistakes` record:
```sql
-- A response is successful if NO mistake exists
WHERE NOT EXISTS (
    SELECT 1 FROM user_mistakes um 
    WHERE um.user_id = ls.user_id 
    AND um.word_id = ls.word_id
    AND um.created_at >= ls.session_date
)
```

#### Timezone Handling
All date-based operations use `Europe/Berlin` timezone:
```sql
(ls.session_date AT TIME ZONE 'Europe/Berlin')::date
```

#### Security
All functions use `SECURITY DEFINER` with `SET search_path = public` for controlled privilege escalation.

---

## Deployment Instructions

### Prerequisites

1. **Backup Database**
   ```bash
   # Create a database backup before migration
   pg_dump -h your_host -U your_user -d your_database > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Verify Schema Compliance**
   ```bash
   # Run schema verification script
   psql -h your_host -U your_user -d your_database -f sql/tests/verify_schema_compliance.sql
   ```
   
   Review the output for any warnings. If the schema doesn't match expectations, you may need to run schema migration scripts first (not included in this migration).

### Deployment Steps

#### Option 1: Using psql

```bash
# Apply the migration
psql -h your_host -U your_user -d your_database -f supabase/migrations/20251101095455_fix_analytics_functions.sql
```

#### Option 2: Using Supabase Dashboard

1. Navigate to **SQL Editor** in Supabase Dashboard
2. Open the migration file: `supabase/migrations/20251101095455_fix_analytics_functions.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run** to execute

#### Option 3: Using Supabase CLI

```bash
# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Post-Deployment Verification

1. **Run Test Suite**
   ```bash
   psql -h your_host -U your_user -d your_database -f sql/tests/test_analytics_functions.sql
   ```

2. **Check for Errors**
   Review the test output for:
   - ✅ No "column does not exist" errors
   - ✅ All functions return results
   - ✅ No runtime errors
   - ✅ Plausible data values

3. **Test Frontend Integration**
   - Load the admin dashboard (`german_vocab_dashboard (4) copy.html`)
   - Click "Test Connection" to verify API connectivity
   - Click "Refresh Data" to load analytics
   - Verify all charts and tables populate correctly

4. **Smoke Test Individual Functions**
   ```sql
   -- Quick smoke tests
   SELECT * FROM get_dashboard_stats();
   SELECT * FROM get_user_progress_summary() LIMIT 1;
   SELECT * FROM get_daily_activity(7);
   ```

---

## Rollback Procedure

### If You Need to Rollback

If the migration causes issues, you can rollback by restoring the previous function definitions with old column names.

#### Step 1: Restore from Backup
```bash
# Restore from the backup created before migration
psql -h your_host -U your_user -d your_database < backup_YYYYMMDD_HHMMSS.sql
```

#### Step 2: Verify Restoration
```bash
# Test that old functions work
psql -h your_host -U your_user -d your_database -c "SELECT * FROM get_dashboard_stats();"
```

### Important Rollback Notes

⚠️ **Warning**: Rollback is only safe if:
- The underlying schema still has the old column names (`vocabulary_id`, `mistake_date`)
- If the schema has already been migrated, rollback requires reverting the schema changes as well
- No other migrations have been applied that depend on these functions

---

## Testing Guide

### Automated Testing

Run the comprehensive test suite:
```bash
cd /path/to/project
psql -h your_host -U your_user -d your_database -f sql/tests/test_analytics_functions.sql
```

The test suite includes:
- Function execution tests (all 13 functions)
- Schema compliance checks
- Data sample validation
- Performance timing tests

### Manual Testing

#### Test with Specific User ID

If you have a specific test user (e.g., `59d71456-8d30-4e01-a548-7724003e4e48`):

```sql
-- Convert UUID to bigint if needed, or use directly
SELECT * FROM get_user_streak(your_user_id);
SELECT * FROM get_user_response_rate(your_user_id, 7);
SELECT * FROM calculate_user_accuracy(your_user_id);
SELECT * FROM get_user_weekly_performance(your_user_id);
```

#### Test Dashboard Integration

1. Open `german_vocab_dashboard (4) copy.html` in a browser
2. Configure Supabase credentials at the top of the file
3. Click "Test Connection" - should show success message
4. Click "Toggle Debug" to see detailed API calls
5. Click "Refresh Data" - all sections should populate

### Expected Behavior

After successful migration:
- ✅ All dashboard cards show numeric values (not "-")
- ✅ Charts display data
- ✅ User table populates with user information
- ✅ No console errors in browser developer tools
- ✅ Debug output shows successful function calls

---

## Troubleshooting

### Common Issues

#### 1. "column does not exist" Error

**Symptom**: Error mentions `vocabulary_id` or `mistake_date`

**Cause**: Schema hasn't been updated yet, or migration was partially applied

**Solution**:
```sql
-- Check which columns actually exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'learning_sessions';

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_mistakes';
```

Then either:
- Run schema migration to rename columns first
- OR use the old function definitions that match your current schema

#### 2. Functions Return Empty Results

**Symptom**: Functions execute but return no data or zeros

**Cause**: Either no data in tables, or foreign key relationships broken

**Solution**:
```sql
-- Verify data exists
SELECT COUNT(*) FROM learning_sessions;
SELECT COUNT(*) FROM user_mistakes;
SELECT COUNT(*) FROM vocabulary;

-- Check for orphaned records
SELECT COUNT(*) FROM learning_sessions ls
LEFT JOIN vocabulary v ON ls.word_id = v.id
WHERE v.id IS NULL;
```

#### 3. Permission Denied Errors

**Symptom**: "permission denied for function" or similar

**Cause**: Function needs SECURITY DEFINER or user lacks privileges

**Solution**:
```sql
-- Verify function has SECURITY DEFINER
SELECT routine_name, security_type 
FROM information_schema.routines
WHERE routine_name = 'get_dashboard_stats';

-- Grant execute permission if needed
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO your_user_role;
```

#### 4. Timezone Issues

**Symptom**: Dates off by hours, "today" shows wrong data

**Cause**: Timezone not properly applied

**Solution**:
```sql
-- Check current timezone
SHOW timezone;

-- Verify data has timezone info
SELECT session_date, 
       session_date AT TIME ZONE 'Europe/Berlin' as berlin_time
FROM learning_sessions LIMIT 1;
```

---

## Performance Considerations

### Indexed Columns

For optimal performance, ensure indexes exist on:

```sql
-- Recommended indexes
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_word_id ON learning_sessions(word_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_session_date ON learning_sessions(session_date);

CREATE INDEX IF NOT EXISTS idx_user_mistakes_user_id ON user_mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_word_id ON user_mistakes(word_id);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_created_at ON user_mistakes(created_at);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_word_id ON user_progress(word_id);
```

### Query Performance

Expected execution times (with ~10k sessions):
- `get_dashboard_stats()`: < 100ms
- `get_user_progress_summary()`: < 200ms
- `get_daily_activity(7)`: < 50ms

If queries are slow, check:
1. Missing indexes
2. ANALYZE/VACUUM needed
3. Excessive data volume

---

## Schema Migration Dependencies

This migration expects that a **schema migration** has already been run to rename the columns. If not, you'll need to run that first:

```sql
-- Example schema migration (not included in this file)
ALTER TABLE learning_sessions 
  RENAME COLUMN vocabulary_id TO word_id;

ALTER TABLE user_mistakes 
  RENAME COLUMN vocabulary_id TO word_id;

ALTER TABLE user_mistakes 
  RENAME COLUMN mistake_date TO created_at;
```

⚠️ **Important**: Coordinate with your DBA or development team to ensure schema changes are applied in the correct order.

---

## Support and Questions

If you encounter issues not covered in this document:

1. Check the debug output in test scripts
2. Review function comments in the migration file
3. Verify your schema matches the expected structure in `sql/tests/verify_schema_compliance.sql`
4. Contact the development team with:
   - Error messages
   - Database version
   - Output of schema verification script

---

## Changelog

### 2025-11-01 - Initial Migration
- Created migration file for 13 analytics functions
- Updated all functions to use `word_id` instead of `vocabulary_id`
- Updated all functions to use `created_at` instead of `mistake_date`
- Added comprehensive test suite
- Added schema verification script
- Added this documentation

---

## Related Files

- `supabase/migrations/20251101095455_fix_analytics_functions.sql` - Main migration file
- `sql/tests/test_analytics_functions.sql` - Test suite
- `sql/tests/verify_schema_compliance.sql` - Schema verification
- `sql/user_analytics_functions.sql` - Reference copy of functions (old column names)
- `sql/README.md` - Function documentation
- `german_vocab_dashboard (4) copy.html` - Admin dashboard frontend

---

## Quick Reference Commands

```bash
# 1. Backup
pg_dump -h HOST -U USER -d DB > backup.sql

# 2. Verify schema
psql -h HOST -U USER -d DB -f sql/tests/verify_schema_compliance.sql

# 3. Apply migration
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql

# 4. Run tests
psql -h HOST -U USER -d DB -f sql/tests/test_analytics_functions.sql

# 5. Rollback if needed
psql -h HOST -U USER -d DB < backup.sql
```
