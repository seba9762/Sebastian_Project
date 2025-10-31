# Function Reference

## Quick Function Signatures

All functions are in the `public` schema and can be called via Supabase RPC.

### Core Analytics Functions

```sql
-- 1. Get detailed user statistics
get_user_detailed_stats(p_user_id UUID)

-- 2. Get challenging words
get_user_challenging_words(p_user_id UUID, p_limit INTEGER DEFAULT 20)

-- 3. Get progress timeline
get_user_progress_timeline(p_user_id UUID, p_days INTEGER DEFAULT 30)

-- 4. Get recent activity
get_user_recent_activity(p_user_id UUID, p_limit INTEGER DEFAULT 20)

-- 5. Get word mastery by difficulty
get_user_word_mastery(p_user_id UUID)

-- 6. Get learning patterns
get_user_learning_patterns(p_user_id UUID)

-- 7. Get detailed progress summary
get_user_progress_detailed(p_user_id UUID)
```

### Mistake Analytics Functions

```sql
-- 8. Get mistakes by type
get_user_mistakes_by_type(p_user_id UUID)

-- 9. Get mistakes by category
get_user_mistakes_by_category(p_user_id UUID)

-- 10. Get mistakes by severity
get_user_mistakes_by_severity(p_user_id UUID)

-- 11. Get overall mistake analysis
get_user_mistake_analysis(p_user_id UUID)

-- 12. Get mistake trends
get_user_mistake_trends(p_user_id UUID, p_days INTEGER DEFAULT 30)
```

## JavaScript Usage

### Using Supabase Client

```javascript
// Functions with only user_id
const { data, error } = await supabase.rpc('get_user_detailed_stats', {
    p_user_id: userId
});

// Functions with p_limit parameter
const { data, error } = await supabase.rpc('get_user_challenging_words', {
    p_user_id: userId,
    p_limit: 10
});

// Functions with p_days parameter
const { data, error } = await supabase.rpc('get_user_progress_timeline', {
    p_user_id: userId,
    p_days: 30
});
```

## Parameter Types

| Function | p_user_id | Second Parameter | Type |
|----------|-----------|-----------------|------|
| get_user_detailed_stats | ✅ Required | - | - |
| get_user_challenging_words | ✅ Required | p_limit | INTEGER |
| get_user_progress_timeline | ✅ Required | p_days | INTEGER |
| get_user_recent_activity | ✅ Required | p_limit | INTEGER |
| get_user_word_mastery | ✅ Required | - | - |
| get_user_learning_patterns | ✅ Required | - | - |
| get_user_progress_detailed | ✅ Required | - | - |
| get_user_mistakes_by_type | ✅ Required | - | - |
| get_user_mistakes_by_category | ✅ Required | - | - |
| get_user_mistakes_by_severity | ✅ Required | - | - |
| get_user_mistake_analysis | ✅ Required | - | - |
| get_user_mistake_trends | ✅ Required | p_days | INTEGER |

## Common Errors & Solutions

### Error: "Could not find the function"
**Cause:** Wrong parameter names or order  
**Solution:** Use exact parameter names from table above

### Error: "function ... does not exist"
**Cause:** Functions not deployed  
**Solution:** Run `user_detail_functions_updated.sql` in Supabase

### Error: "column does not exist"
**Cause:** Old version of functions  
**Solution:** Re-deploy the SQL file

## Testing

```sql
-- Get a test user
SELECT id FROM users LIMIT 1;

-- Test each function (replace USER_ID)
SELECT * FROM get_user_detailed_stats('USER_ID');
SELECT * FROM get_user_challenging_words('USER_ID', 5);
SELECT * FROM get_user_progress_timeline('USER_ID', 7);
SELECT * FROM get_user_recent_activity('USER_ID', 5);
SELECT * FROM get_user_word_mastery('USER_ID');
SELECT * FROM get_user_learning_patterns('USER_ID');
SELECT * FROM get_user_progress_detailed('USER_ID');
SELECT * FROM get_user_mistakes_by_type('USER_ID');
SELECT * FROM get_user_mistakes_by_category('USER_ID');
SELECT * FROM get_user_mistakes_by_severity('USER_ID');
SELECT * FROM get_user_mistake_analysis('USER_ID');
SELECT * FROM get_user_mistake_trends('USER_ID', 7);
```

---

**Updated:** Fixed parameter naming issue in dashboards  
**Status:** All functions working correctly
