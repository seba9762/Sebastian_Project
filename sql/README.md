# User Analytics Functions

This directory contains PostgreSQL functions for analyzing user data in the German Vocabulary Learning System.

## Files

- **user_analytics_functions.sql** - Main file containing all 12 analytics functions with SECURITY DEFINER
- **test_queries.sql** - Test queries to verify all functions work correctly

## Schema Requirements

The functions expect the following database schema:

### Tables

1. **users**
   - `id` (bigint, primary key)
   - `name` (text)
   - `phone_number` (text)

2. **vocabulary**
   - `id` (bigint, primary key)
   - `word` (text) - The German word
   - `translation` (text) - The English translation
   - ❌ **No `difficulty_level` column** (removed from this table)

3. **learning_sessions**
   - `id` (bigint, primary key)
   - `user_id` (bigint, foreign key to users)
   - `vocabulary_id` (bigint, foreign key to vocabulary)
   - `session_date` (timestamp with time zone) - Used with Europe/Berlin timezone
   - `session_type` (text) - e.g., 'learn', 'exercise', 'review'

4. **user_progress**
   - `id` (bigint, primary key)
   - `user_id` (bigint, foreign key to users)
   - `vocabulary_id` (bigint, foreign key to vocabulary)
   - `difficulty_level` (text) - 'easy', 'medium', or 'hard'
   - Other progress tracking fields

5. **user_mistakes**
   - `id` (bigint, primary key)
   - `user_id` (bigint, foreign key to users)
   - `vocabulary_id` (bigint, foreign key to vocabulary)
   - `mistake_date` (timestamp with time zone)
   - Records when a user makes a mistake with a word

6. **user_responses** (if exists)
   - ❌ **No `is_correct` column** (removed from this table)

## Key Design Principles

### 1. Success Rate Calculation
Success is determined by the **absence** of a record in `user_mistakes`:
```sql
-- A response is successful if NO mistake exists
WHERE NOT EXISTS (
    SELECT 1 FROM user_mistakes um 
    WHERE um.user_id = ls.user_id 
    AND um.vocabulary_id = ls.vocabulary_id
    AND um.mistake_date >= ls.session_date
)
```

### 2. Difficulty Level Access
Difficulty levels are stored in `user_progress`, not in `vocabulary`:
```sql
-- Join user_progress to get difficulty_level
FROM user_progress up
WHERE up.difficulty_level IN ('easy', 'medium', 'hard')
```

### 3. Timezone Handling
All date-based aggregations use `Europe/Berlin` timezone:
```sql
-- Convert session_date to Berlin timezone
(ls.session_date AT TIME ZONE 'Europe/Berlin')::date
```

### 4. Security
All functions use `SECURITY DEFINER` to run with elevated privileges:
```sql
CREATE OR REPLACE FUNCTION function_name()
...
SECURITY DEFINER
```

## Functions Overview

### 1. get_dashboard_stats()
Returns key metrics for the dashboard:
- `total_users` - Active users in last 7 days
- `words_today` - Unique words taught today
- `response_rate` - Success rate percentage (7 days)
- `avg_engagement` - Average daily words per active user

### 2. get_user_progress_summary()
Returns detailed progress for all users:
- `user_id`, `name`, `phone_number`
- `words_learned` - Total unique words
- `current_streak` - Consecutive days (30 days)
- `response_rate` - Success rate (7 days)
- `last_active` - Last session timestamp

### 3. get_daily_activity(days)
Returns daily metrics for specified period (default 7 days):
- `date` - The date
- `messages_sent` - Total sessions
- `responses_received` - Successful responses (no mistakes)
- `active_users` - Unique users that day

### 4. get_difficulty_distribution()
Returns distribution of difficulty levels from user_progress:
- `difficulty` - 'easy', 'medium', or 'hard'
- `count` - Number of records

### 5. get_exercise_accuracy(days)
Returns exercise completion rates (default 7 days):
- `date` - The date
- `total_exercises` - All sessions
- `successful_exercises` - Sessions without mistakes
- `completion_rate` - Success percentage

### 6. get_difficult_words(limit_count)
Returns most challenging words (default top 10):
- `word` - German word
- `translation` - English translation
- `times_taught` - Total teaching sessions
- `marked_hard` - Number of mistakes
- `difficulty_pct` - Percentage of times marked as mistake

### 7. get_all_sessions_summary()
Returns system-wide summary:
- `total_sessions` - All sessions ever
- `session_types` - JSON object with counts by type
- `dates_with_data` - Number of unique dates
- `earliest_date` - First session date
- `latest_date` - Most recent session date

### 8. get_user_streak(user_id_param)
Calculates streak for a specific user (30 days):
- `user_id` - The user ID
- `current_streak` - Current consecutive days
- `longest_streak` - Longest streak in period
- `total_active_days` - Total days with activity

### 9. get_active_users_count(days)
Returns active user statistics (default 7 days):
- `active_users` - Users with sessions
- `total_users` - All users in system
- `activity_rate` - Percentage active

### 10. get_words_taught_today()
Returns today's teaching statistics:
- `words_today` - Unique words taught
- `unique_users` - Users who had sessions
- `total_sessions` - Total sessions today

### 11. get_user_response_rate(user_id_param, days)
Calculates response rate for a user (default 7 days):
- `user_id` - The user ID
- `total_responses` - All responses
- `successful_responses` - Responses without mistakes
- `response_rate` - Success percentage
- `mistake_count` - Total mistakes

### 12. calculate_user_accuracy(user_id_param)
Calculates overall accuracy for a user:
- `user_id` - The user ID
- `total_attempts` - All attempts
- `successful_attempts` - Attempts without mistakes
- `failed_attempts` - Attempts with mistakes
- `accuracy_rate` - Success percentage
- `most_difficult_word` - Word with most mistakes

## Installation

⚠️ **IMPORTANT**: Use the migration file instead of this reference file!

The correct way to install these functions is through the migration system:

```bash
# Apply the migration (includes schema fixes)
psql -U your_username -d your_database -f ../supabase/migrations/20251101095455_fix_analytics_functions.sql
```

See [MIGRATIONS.md](../MIGRATIONS.md) for complete deployment instructions.

### Development Reference Only

The `user_analytics_functions.sql` file in this directory uses **old column names** and is kept as a reference. For production deployment, always use the migration file which includes:
- Updated column names (`word_id`, `created_at`)
- Proper documentation
- DROP statements for clean installation

## Testing

After installation, run the comprehensive test suite:

```bash
# Verify schema compliance BEFORE migration
psql -U your_username -d your_database -f tests/verify_schema_compliance.sql

# Run full test suite AFTER migration
psql -U your_username -d your_database -f tests/test_analytics_functions.sql
```

## Notes

- All functions handle NULL values gracefully with COALESCE
- Date ranges are inclusive
- Empty result sets return zero values, not NULL
- All percentage calculations are rounded to 1 decimal place
- Timezone conversions ensure consistent date boundaries using Europe/Berlin
- All functions use SECURITY DEFINER for cross-user analytics with controlled privileges
