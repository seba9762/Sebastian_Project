# Vocabulary VARCHAR Fix Guide

## Error Encountered

```
ERROR: 42804: structure of query does not match function result type
DETAIL: Returned type character varying(200) does not match expected type text in column 1.
CONTEXT: PL/pgSQL function get_difficult_words(integer) line 3 at RETURN QUERY
```

## Root Cause

Your `vocabulary` table has VARCHAR columns:
- `word`: `varchar(200)` (not `text`)
- `translation`: `varchar(200)` or similar (not `text`)

But the `get_difficult_words` function declares it should return `text`.

## Solution

Apply the vocabulary VARCHAR fix:

```bash
psql -h HOST -U USER -d DB -f sql/fix_vocabulary_varchar.sql
```

## Complete Deployment Sequence (Updated)

If you're getting this error, here's the COMPLETE deployment order:

```bash
# Step 1: Clean up old functions
psql -h HOST -U USER -d DB -f sql/cleanup_existing_functions.sql

# Step 2: Deploy main migration
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql

# Step 3: Apply UUID + users VARCHAR fix
psql -h HOST -U USER -d DB -f sql/fix_uuid_user_ids.sql

# Step 4: Apply vocabulary VARCHAR fix (NEW!)
psql -h HOST -U USER -d DB -f sql/fix_vocabulary_varchar.sql

# Step 5: Test
psql -h HOST -U USER -d DB -c "SELECT * FROM get_difficult_words(10);"
```

## What This Fixes

The `fix_vocabulary_varchar.sql` script:
1. Drops the existing `get_difficult_words` function
2. Recreates it with explicit `::text` casts
3. Changes:
   ```sql
   -- Before (causes error):
   SELECT ws.word, ws.translation, ...
   
   -- After (fixed):
   SELECT ws.word::text, ws.translation::text, ...
   ```

## Your Complete Schema

Based on all the errors you've encountered:

### users table
- `id`: `uuid` (not bigint) ✅ Fixed
- `name`: `varchar(100)` (not text) ✅ Fixed
- `phone_number`: `varchar` (not text) ✅ Fixed

### vocabulary table
- `word`: `varchar(200)` (not text) ✅ Fixed (NEW!)
- `translation`: `varchar(200)` (not text) ✅ Fixed (NEW!)

### learning_sessions table
- `session_date`: `date` (not timestamptz) ✅ Fixed

## Verification

After applying the fix:

```sql
-- Should work without errors
SELECT * FROM get_difficult_words(10);

-- Check function signature
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'get_difficult_words';
```

Expected output: 10 rows with columns:
- word (text)
- translation (text)
- times_taught (bigint)
- marked_hard (bigint)
- difficulty_pct (numeric)

## Check Your Schema

To see your vocabulary table structure:

```sql
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'vocabulary'
ORDER BY ordinal_position;
```

## All VARCHAR Fixes Summary

You now have **3 VARCHAR fix scripts**:

| Script | What It Fixes | Tables Affected |
|--------|---------------|-----------------|
| `sql/fix_uuid_user_ids.sql` | UUID + users VARCHAR + DATE | users, learning_sessions |
| `sql/fix_vocabulary_varchar.sql` | vocabulary VARCHAR | vocabulary |

## Why So Many VARCHAR Issues?

Your Supabase database uses VARCHAR with length limits (100, 200, etc.) for text fields, which is common for:
- Database optimization
- Data validation
- Storage efficiency

However, PostgreSQL functions need exact type matching, so we must explicitly cast VARCHAR to TEXT.

## Alternative: Single Combined Fix

If you prefer, you can apply all fixes in one command:

```bash
# All fixes at once
psql -h HOST -U USER -d DB << 'EOF'
-- Start transaction
BEGIN;

-- Apply UUID and users VARCHAR fix
\i sql/fix_uuid_user_ids.sql

-- Apply vocabulary VARCHAR fix
\i sql/fix_vocabulary_varchar.sql

-- Commit
COMMIT;

-- Test
SELECT 'Testing all functions...' as status;
SELECT * FROM get_dashboard_stats();
SELECT * FROM get_user_progress_summary() LIMIT 1;
SELECT * FROM get_difficult_words(5);
SELECT '✅ All functions working!' as status;
EOF
```

## Testing

Test in browser console after fixing:

```javascript
// Test get_difficult_words
const testDifficultWords = async () => {
    const { data, error } = await supabase.rpc('get_difficult_words', { 
        limit_count: 10 
    });
    
    if (error) {
        console.error('❌ Error:', error);
    } else {
        console.log('✅ Data:', data);
        if (data && data[0]) {
            console.log('Columns:', Object.keys(data[0]));
        }
    }
};

testDifficultWords();
```

Expected console output:
```
✅ Data: [{ word: "...", translation: "...", times_taught: X, marked_hard: Y, difficulty_pct: Z }, ...]
Columns: ["word", "translation", "times_taught", "marked_hard", "difficulty_pct"]
```

## Troubleshooting

### Still Getting VARCHAR Error?

Check if other tables have VARCHAR columns used in other functions:

```sql
-- Find all VARCHAR columns in your schema
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public'
AND data_type LIKE '%char%'
ORDER BY table_name, column_name;
```

### Function Not Found After Fix?

```bash
# Reapply the fix
psql -h HOST -U USER -d DB -f sql/fix_vocabulary_varchar.sql
```

### Dashboard Still Not Working?

1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console for errors
4. Verify Supabase credentials

## Success Criteria

After applying this fix:
- ✅ `get_difficult_words(10)` returns data without errors
- ✅ Dashboard "Most Difficult Words" section displays
- ✅ No "varchar does not match text" errors
- ✅ Browser console shows no errors

## Summary

✅ **Issue**: vocabulary.word and vocabulary.translation are VARCHAR(200)  
✅ **Fix**: Add ::text casts in get_difficult_words function  
✅ **Script**: sql/fix_vocabulary_varchar.sql  
✅ **Status**: Ready to apply  

Run the script and your dashboard should work completely!
