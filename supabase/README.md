# Supabase Database Functions

This directory contains database migrations for the German Vocabulary Learning System.

## Structure

```
supabase/
└── migrations/
    └── [timestamp]_[description].sql
```

## Migrations

### 20241104000000_fix_get_top_performers_words_mastered.sql

**Purpose**: Fixes the `get_top_performers()` function to accurately calculate `words_mastered` counts.

**Problem Fixed**: 
- The original function had a cartesian product between `user_progress` and `learning_sessions` tables
- This caused inflated word counts (e.g., 96 records being reported as 4,662)
- The issue occurred because both tables were joined to `users` on `user_id` only, multiplying each user_progress record by the number of learning_sessions

**Solution**:
- Uses a subquery to calculate `words_mastered` independently from `learning_sessions`
- The subquery counts user_progress records directly for each user
- Filters for difficulty_level = 'easy' and times_seen >= 3
- Returns COALESCE(..., 0) to handle users with no mastered words

**Testing**:
To verify the fix works correctly:
```sql
-- Check a specific user's actual user_progress records
SELECT COUNT(*) 
FROM user_progress 
WHERE user_id = [USER_ID]
AND difficulty_level = 'easy' 
AND times_seen >= 3;

-- Compare with what get_top_performers returns
SELECT user_id, username, words_mastered 
FROM get_top_performers() 
WHERE user_id = [USER_ID];
```

The counts should now match exactly.

## Applying Migrations

To apply these migrations to your Supabase project:

1. **Via Supabase Dashboard**:
   - Go to the SQL Editor in your Supabase project
   - Copy and paste the migration file contents
   - Execute the SQL

2. **Via Supabase CLI**:
   ```bash
   supabase migration apply
   ```

3. **Via psql**:
   ```bash
   psql -h [your-supabase-host] -U postgres -d postgres -f migrations/20241104000000_fix_get_top_performers_words_mastered.sql
   ```

## Function Reference

### `get_top_performers()`

Returns the top 10 users ordered by words mastered.

**Returns:**
- `user_id` (INT): User's ID
- `username` (TEXT): User's username
- `words_mastered` (BIGINT): Count of words with difficulty='easy' and times_seen>=3
- `response_rate` (NUMERIC): Percentage of exercise sessions vs total sessions
- `streak_days` (INT): Current streak in days
- `last_active` (TIMESTAMP): Most recent learning session

**Usage:**
```javascript
// Frontend JavaScript
const result = await callRPC('get_top_performers');
```

**Query Logic:**
- Counts user_progress records per user using a subquery (prevents cartesian product)
- Calculates response rate from learning_sessions
- Groups by user
- Orders by words_mastered DESC, then response_rate DESC
- Limits to top 10 performers
