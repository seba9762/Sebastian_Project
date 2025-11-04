# Migration Guide: Fix get_top_performers words_mastered Count

## Quick Summary

**What**: Fixed inflated word counts in `get_top_performers()` function  
**Why**: Cartesian product between tables was multiplying counts  
**Impact**: No breaking changes, frontend code unchanged  
**Action Required**: Apply SQL migration to Supabase database

## The Issue

Users reported that the `get_top_performers()` function was returning incorrect `words_mastered` counts:
- A user with 96 actual words mastered showed 4,662 in the dashboard
- The issue was caused by a cartesian product between `user_progress` and `learning_sessions` tables
- Each user_progress record was counted multiple times (once for each learning_session)

## The Fix

The migration changes how `words_mastered` is calculated:

**Before (problematic):**
```sql
COUNT(CASE WHEN up.difficulty_level = 'easy' AND up.times_seen >= 3 
      THEN up.id END) as words_mastered
FROM users u
LEFT JOIN user_progress up ON up.user_id = u.id
LEFT JOIN learning_sessions ls ON ls.user_id = u.id
```

**After (fixed):**
```sql
COALESCE(
    (
        SELECT COUNT(*)
        FROM user_progress up2
        WHERE up2.user_id = u.id
        AND up2.difficulty_level = 'easy'
        AND up2.times_seen >= 3
    ), 0
) as words_mastered
FROM users u
LEFT JOIN learning_sessions ls ON ls.user_id = u.id
```

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Log into your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Open the migration file: `supabase/migrations/20241104000000_fix_get_top_performers_words_mastered.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** to execute

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
cd /path/to/project
supabase migration apply
```

### Option 3: psql Command Line

```bash
psql -h your-supabase-host.supabase.co \
     -U postgres \
     -d postgres \
     -f supabase/migrations/20241104000000_fix_get_top_performers_words_mastered.sql
```

## Verification

After applying the migration, verify it worked:

### 1. Check the function exists
```sql
\df get_top_performers
```

### 2. Run the function
```sql
SELECT * FROM get_top_performers();
```

### 3. Verify accurate counts
Pick a user from the results and verify their count:

```sql
-- Get a user_id from the results above
SELECT user_id, words_mastered FROM get_top_performers() LIMIT 1;

-- Verify the count matches actual records (replace [USER_ID] with actual ID)
SELECT COUNT(*) 
FROM user_progress 
WHERE user_id = [USER_ID]
AND difficulty_level = 'easy' 
AND times_seen >= 3;
```

The two counts should match exactly!

### 4. Frontend Test
1. Open the dashboard in your browser
2. Check the "Top Performers" chart
3. Numbers should now be reasonable (not inflated)

## What Changes

| Aspect | Before | After |
|--------|--------|-------|
| **words_mastered** | Inflated (96 → 4,662) | Accurate (96) |
| **response_rate** | Works correctly | Still works correctly |
| **streak_days** | Works correctly | Still works correctly |
| **last_active** | Works correctly | Still works correctly |
| **Function signature** | (unchanged) | (unchanged) |
| **Return structure** | (unchanged) | (unchanged) |
| **Frontend code** | (unchanged) | (unchanged) |

## No Frontend Changes Required

✓ The fix is entirely in the database function  
✓ API contract (function signature) unchanged  
✓ Return structure unchanged  
✓ JavaScript code continues to work as-is  
✓ No dashboard code changes needed

## Rollback

If you need to rollback (unlikely), you would need the original function definition. Before applying the migration, you can save the current definition:

```sql
-- Save current definition before migration
\df+ get_top_performers
```

## Files Changed

- ✓ `supabase/migrations/20241104000000_fix_get_top_performers_words_mastered.sql` - The fix (NEW)
- ✓ `supabase/README.md` - Database documentation (NEW)
- ✓ `supabase/CHANGELOG.md` - Detailed change log (NEW)
- ✓ `supabase/TESTING.md` - Verification queries (NEW)
- ✓ `README.md` - Updated project structure (MODIFIED)
- ✓ `MIGRATION_GUIDE.md` - This file (NEW)

## Documentation

For more details, see:
- **Technical Details**: `supabase/CHANGELOG.md`
- **Testing & Verification**: `supabase/TESTING.md`
- **Database Functions**: `supabase/README.md`

## Support

If you encounter issues:
1. Check the verification queries in `supabase/TESTING.md`
2. Review the technical details in `supabase/CHANGELOG.md`
3. Ensure the migration was applied successfully
4. Check Supabase logs for any function errors

## Acceptance Criteria ✓

- ✓ Function returns accurate word counts matching actual user_progress records
- ✓ No cartesian product multiplication between joined tables
- ✓ All other metrics (response_rate, streak_days) continue to work correctly
- ✓ Function maintains same signature and return structure
- ✓ No frontend changes required
- ✓ Comprehensive testing guide provided
- ✓ Migration can be applied cleanly
