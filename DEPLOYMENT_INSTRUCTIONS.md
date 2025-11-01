# 🚀 DEPLOYMENT INSTRUCTIONS

## ⚠️ IMPORTANT: Which File to Use

Your database schema has been updated to use:
- `word_id` (not `vocabulary_id`) 
- `created_at` (not `mistake_date`)

Therefore, you MUST use the corrected function definitions.

## ✅ CORRECT Deployment Method

Both of these files are identical and contain the CORRECT column names:

### Option 1: Use the migration file (RECOMMENDED)
```bash
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql
```

### Option 2: Use the updated reference file
```bash
psql -h HOST -U USER -d DB -f sql/user_analytics_functions.sql
```

Both files now contain the same corrected functions.

## 🔍 What You Saw

The error you encountered:
```
ERROR: 42703: column ls.vocabulary_id does not exist
```

This happened because:
1. Your database schema was already updated (has `word_id`, not `vocabulary_id`)
2. But the old function definitions were trying to use `vocabulary_id`

This has now been fixed! Both SQL files now use the correct column names.

## 📋 Quick Deployment Steps

```bash
# 1. Apply the corrected functions
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql

# 2. Test that it works
psql -h HOST -U USER -d DB -c "SELECT * FROM get_dashboard_stats();"

# 3. Run the full test suite
psql -h HOST -U USER -d DB -f sql/tests/test_analytics_functions.sql
```

## ✓ Expected Results

After applying the corrected functions:
- ✅ No "column does not exist" errors
- ✅ All 13 functions return results
- ✅ Dashboard displays data correctly

## 🔄 What Changed

### Before (OLD - caused errors):
```sql
-- OLD CODE (WRONG)
SELECT COUNT(DISTINCT ls.vocabulary_id)  -- ❌ Error!
FROM learning_sessions ls
```

### After (NEW - correct):
```sql
-- NEW CODE (CORRECT)
SELECT COUNT(DISTINCT ls.word_id)  -- ✅ Works!
FROM learning_sessions ls
```

## 📚 Additional Resources

- **QUICKSTART.md** - 5-minute deployment guide
- **MIGRATIONS.md** - Comprehensive migration documentation
- **DEPLOYMENT_CHECKLIST.md** - Pre-deployment checklist
- **sql/tests/test_analytics_functions.sql** - Test suite

## 🆘 Troubleshooting

### Still getting "column does not exist" errors?

1. **Check which column name is in the error:**
   - If error mentions `vocabulary_id`: Database has `word_id`, need to apply corrected functions
   - If error mentions `word_id`: Database still has `vocabulary_id`, need schema migration first

2. **Verify your schema:**
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'learning_sessions' 
   AND column_name IN ('word_id', 'vocabulary_id');
   ```

3. **Verify your functions:**
   ```sql
   SELECT pg_get_functiondef(oid) 
   FROM pg_proc 
   WHERE proname = 'get_dashboard_stats';
   ```

## ✅ Verification

After deployment, verify everything works:

```sql
-- Should return results without errors
SELECT * FROM get_dashboard_stats();
SELECT * FROM get_user_progress_summary() LIMIT 1;
SELECT * FROM get_daily_activity(7);
```

If all three queries return results, you're done! 🎉

## 📝 Summary

- ✅ Both `supabase/migrations/20251101095455_fix_analytics_functions.sql` and `sql/user_analytics_functions.sql` now have the correct column names
- ✅ Use either file to deploy (they're identical)
- ✅ The migration file is recommended for better tracking
- ✅ After deployment, all 13 analytics functions will work correctly
