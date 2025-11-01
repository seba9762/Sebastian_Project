# German Vocabulary Learning System

A comprehensive vocabulary learning system with analytics dashboard for tracking user progress, word difficulty, and learning patterns.

## Overview

This system helps users learn German vocabulary through interactive sessions while providing detailed analytics for administrators and teachers to track progress and identify challenging words.

## Features

- **User Progress Tracking**: Monitor individual user learning progress, streaks, and accuracy
- **Word Analytics**: Identify the most challenging words and difficulty distribution
- **Daily/Weekly Reports**: View activity patterns and engagement metrics
- **Real-time Dashboard**: Interactive admin dashboard with charts and statistics
- **Timezone Support**: All analytics use Europe/Berlin timezone for consistency
- **Security**: SECURITY DEFINER functions with controlled privilege escalation

## Quick Start

See [QUICKSTART.md](QUICKSTART.md) for a 5-minute deployment guide.

## Project Structure

```
.
├── supabase/
│   └── migrations/
│       └── 20251101095455_fix_analytics_functions.sql  # Main migration file
├── sql/
│   ├── tests/
│   │   ├── test_analytics_functions.sql                # Test suite
│   │   └── verify_schema_compliance.sql                # Schema verification
│   ├── README.md                                        # Function documentation
│   ├── user_analytics_functions.sql                    # Reference (old schema)
│   ├── test_queries.sql                                # Legacy tests
│   └── verify_schema_compliance.sql                    # Legacy verification
├── german_vocab_dashboard (4) copy.html                # Admin dashboard
├── MIGRATIONS.md                                        # Detailed migration docs
├── QUICKSTART.md                                        # Quick deployment guide
└── README.md                                            # This file
```

## Database Schema

### Core Tables

- **users**: User accounts and profiles
- **vocabulary**: German words with English translations
- **learning_sessions**: Records of learning activities (uses `word_id`, not `vocabulary_id`)
- **user_mistakes**: Mistakes made by users (uses `word_id` and `created_at`)
- **user_progress**: Per-user word progress tracking with difficulty levels

### Key Schema Notes

⚠️ **Important Column Names**:
- `learning_sessions.word_id` (NOT `vocabulary_id`)
- `user_mistakes.word_id` (NOT `vocabulary_id`)
- `user_mistakes.created_at` (NOT `mistake_date`)
- `vocabulary.word` and `vocabulary.translation` (NOT `german_word`/`english_translation`)
- `user_progress.difficulty_level` (NOT in `vocabulary` table)

## Analytics Functions

13 PostgreSQL functions provide comprehensive analytics:

### System-Wide Analytics
- `get_dashboard_stats()` - Overall dashboard metrics
- `get_all_sessions_summary()` - System-wide session data
- `get_difficulty_distribution()` - Difficulty level distribution
- `get_active_users_count(days)` - Active user counts

### User Analytics
- `get_user_progress_summary()` - All users' progress summary
- `get_user_streak(user_id)` - Learning streak calculation
- `get_user_response_rate(user_id, days)` - Success rate per user
- `calculate_user_accuracy(user_id)` - Overall accuracy metrics
- `get_user_weekly_performance(user_id)` - Weekly performance trends

### Time-Series Analytics
- `get_daily_activity(days)` - Daily activity metrics
- `get_exercise_accuracy(days)` - Daily accuracy rates
- `get_words_taught_today()` - Today's statistics

### Word Analytics
- `get_difficult_words(limit)` - Most challenging words

See [sql/README.md](sql/README.md) for detailed function documentation.

## Installation

### Prerequisites

- PostgreSQL 12+ or Supabase project
- Admin database access
- `psql` CLI (or Supabase Dashboard access)

### Deploy Analytics Functions

```bash
# 1. Verify schema compliance
psql -h HOST -U USER -d DB -f sql/tests/verify_schema_compliance.sql

# 2. Apply migration
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql

# 3. Test installation
psql -h HOST -U USER -d DB -f sql/tests/test_analytics_functions.sql
```

### Set Up Dashboard

1. Open `german_vocab_dashboard (4) copy.html`
2. Update Supabase credentials (lines 414-415):
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_KEY = 'your-anon-public-key';
   ```
3. Open in browser and test connection

## Testing

### Automated Tests

Run the comprehensive test suite:

```bash
# Full test suite with schema verification
psql -h HOST -U USER -d DB -f sql/tests/test_analytics_functions.sql
```

### Manual Testing

```sql
-- Test dashboard functions
SELECT * FROM get_dashboard_stats();
SELECT * FROM get_user_progress_summary() LIMIT 5;

-- Test user-specific functions (replace with actual user ID)
SELECT * FROM get_user_streak(1);
SELECT * FROM calculate_user_accuracy(1);
```

### Browser Testing

1. Open dashboard HTML file
2. Click "Test Connection" → Should see success message
3. Click "Toggle Debug" → See detailed function calls
4. Click "Refresh Data" → All sections should populate

## Development

### Running Locally

No build process required - this is a SQL + HTML system.

1. Set up local PostgreSQL or connect to Supabase
2. Apply migrations
3. Open HTML dashboard in browser

### Making Changes

When modifying analytics functions:

1. Update the function in `supabase/migrations/` directory
2. Create a new migration file with timestamp
3. Update tests in `sql/tests/test_analytics_functions.sql`
4. Update documentation in `sql/README.md`
5. Test thoroughly before deployment

### Code Style

- SQL: Use 4-space indentation, uppercase keywords
- Comments: Document complex logic and schema dependencies
- Functions: Always include SECURITY DEFINER and SET search_path

## Deployment

### Production Deployment

See [MIGRATIONS.md](MIGRATIONS.md) for detailed deployment instructions including:

- Pre-deployment checklist
- Backup procedures
- Migration steps
- Post-deployment verification
- Rollback procedures

### Recommended Indexes

For optimal performance:

```sql
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_word_id ON learning_sessions(word_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_session_date ON learning_sessions(session_date);

CREATE INDEX IF NOT EXISTS idx_user_mistakes_user_id ON user_mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_word_id ON user_mistakes(word_id);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_created_at ON user_mistakes(created_at);
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "column vocabulary_id does not exist" | Schema not migrated | Run schema migration first (see QUICKSTART.md) |
| Functions return empty data | No data in tables | Normal for new installations; add sample data |
| Permission denied errors | Missing SECURITY DEFINER | Reapply migration file |
| Timezone issues | Wrong timezone in queries | All functions use Europe/Berlin |

See [MIGRATIONS.md#troubleshooting](MIGRATIONS.md#troubleshooting) for detailed troubleshooting guide.

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute deployment guide
- **[MIGRATIONS.md](MIGRATIONS.md)** - Comprehensive migration documentation
- **[sql/README.md](sql/README.md)** - Analytics function reference
- **[sql/tests/](sql/tests/)** - Test scripts and schema verification

## Architecture Decisions

### Success Rate Logic

Success is determined by the **absence** of a mistake record, not by an `is_correct` flag:

```sql
-- Successful response = no matching mistake record
WHERE NOT EXISTS (
    SELECT 1 FROM user_mistakes um 
    WHERE um.user_id = ls.user_id 
    AND um.word_id = ls.word_id
    AND um.created_at >= ls.session_date
)
```

### Timezone Handling

All date operations use `Europe/Berlin` timezone to ensure consistent date boundaries for German users:

```sql
(ls.session_date AT TIME ZONE 'Europe/Berlin')::date
```

### Security Model

Functions use `SECURITY DEFINER` with `SET search_path = public` to:
- Allow cross-user analytics without exposing data
- Prevent privilege escalation attacks
- Ensure consistent execution environment

## Contributing

When contributing to this project:

1. Test all changes with the test suite
2. Update documentation for any schema or function changes
3. Follow existing code style and conventions
4. Add tests for new functionality
5. Ensure migrations are reversible

## License

[Your License Here]

## Support

For questions or issues:

1. Check the troubleshooting section
2. Review the test output for specific errors
3. Verify schema compliance with verification script
4. Contact the development team with:
   - Error messages
   - Database version
   - Output of schema verification

## Changelog

### 2025-11-01 - Schema Migration
- Updated all analytics functions to use `word_id` instead of `vocabulary_id`
- Changed `user_mistakes.mistake_date` to `created_at`
- Added comprehensive test suite and documentation
- Created migration file with proper rollback procedures
- Added 13th function: `get_user_weekly_performance`

---

**Built with ❤️ for German language learners**
