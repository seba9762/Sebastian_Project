# Database Changelog

## [2024-11-04] - Fix get_top_performers words_mastered Calculation

### Migration
`20241104000000_fix_get_top_performers_words_mastered.sql`

### Issue Fixed
The `get_top_performers()` function was returning inflated `words_mastered` counts due to a cartesian product between the `user_progress` and `learning_sessions` tables.

#### Root Cause Analysis

**Original Query Pattern:**
```sql
SELECT 
    u.id,
    u.username,
    COUNT(CASE WHEN up.difficulty_level = 'easy' AND up.times_seen >= 3 
          THEN up.id END) as words_mastered,
    -- ... other fields
FROM users u
LEFT JOIN user_progress up ON up.user_id = u.id
LEFT JOIN learning_sessions ls ON ls.user_id = u.id
GROUP BY u.id, u.username
```

**The Problem:**
- Both `user_progress` and `learning_sessions` are joined to `users` only by `user_id`
- There is no join condition between `user_progress` and `learning_sessions`
- This creates a cartesian product where each `user_progress` row is matched with every `learning_sessions` row for the same user
- If a user has 96 user_progress records and 48 learning_sessions, the join produces 4,608 rows (96 × 48)
- COUNT then counts all 4,608 rows instead of just the 96 unique user_progress records

**Example:**
```
User has:
- 96 records in user_progress (matching the criteria)
- 48 records in learning_sessions

Without fix:
- Join produces: 96 × 48 = 4,608 rows
- COUNT returns: 4,608 (inflated!)

With fix:
- Subquery counts user_progress independently: 96 rows
- COUNT returns: 96 (correct!)
```

### Solution Implemented

**Approach: Subquery for words_mastered**

The fix isolates the `words_mastered` calculation in a correlated subquery that runs independently for each user:

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
```

**Why This Works:**
- The subquery runs once per user, independent of learning_sessions
- It counts only user_progress records for that specific user
- No cartesian product can occur
- Other metrics (response_rate, streak_days) continue to work correctly with learning_sessions

**Alternative Considered (COUNT DISTINCT):**
```sql
COUNT(DISTINCT CASE WHEN up.difficulty_level = 'easy' AND up.times_seen >= 3 
      THEN up.id END) as words_mastered
```

This would also work but was not chosen because:
- Subquery approach is more explicit and easier to understand
- Better separation of concerns (words_mastered is independent of sessions)
- Potentially better query plan in PostgreSQL for this specific case

### Changes Made

1. **Modified Function**: `get_top_performers()`
2. **Changed Field**: `words_mastered` calculation
3. **Function Signature**: Unchanged (maintains API compatibility)
4. **Return Structure**: Unchanged (maintains API compatibility)

### Impact

**Positive:**
- ✓ Accurate word counts matching actual database records
- ✓ Eliminates data inflation
- ✓ More predictable and understandable results
- ✓ Better performance (avoids large cartesian product)

**No Breaking Changes:**
- ✓ Function signature remains the same
- ✓ Return type remains the same
- ✓ All other metrics (response_rate, streak_days, last_active) work as before
- ✓ Frontend code requires no changes

### Testing Performed

See `TESTING.md` for detailed test queries and verification steps.

Key verifications:
- words_mastered counts match actual user_progress records
- No inflation from multiple learning_sessions
- Function returns correct top 10 performers
- Ordering works correctly (by words_mastered DESC, response_rate DESC)

### Deployment Notes

**To Apply:**
1. Run the migration SQL in your Supabase SQL editor
2. Or use Supabase CLI: `supabase migration apply`
3. No frontend changes required
4. No data migration required (only function definition changes)

**Rollback:**
- Would require reverting to the previous function definition
- Ensure you have a backup of the original function before applying

### Performance Considerations

**Before Fix:**
- Large cartesian product for users with many sessions
- Example: 96 × 48 = 4,608 rows in memory
- Higher CPU and memory usage

**After Fix:**
- Subquery runs once per user (max 10 users due to LIMIT)
- Simple COUNT on indexed user_id column
- Expected to be faster and more efficient

### Related Files

- Migration: `supabase/migrations/20241104000000_fix_get_top_performers_words_mastered.sql`
- Documentation: `supabase/README.md`
- Testing: `supabase/TESTING.md`
- Frontend usage: `assets/js/dashboard.js` (line 306, no changes needed)

### References

- Ticket: "Fix get_top_performers words_mastered calculation"
- Issue: Cartesian product between user_progress and learning_sessions
- Solution: Subquery approach for isolated counting
