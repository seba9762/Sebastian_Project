# Quick Start Guide

## Installation

### Step 1: Deploy Functions
```bash
psql -U your_username -d your_database -f sql/user_analytics_functions.sql
```

Expected output:
```
DROP FUNCTION (12 times)
CREATE FUNCTION (12 times)
```

### Step 2: Verify Installation
```bash
psql -U your_username -d your_database -f sql/verify_schema_compliance.sql
```

Expected output:
```
✓ PASS (8 verification checks)
```

### Step 3: Test Functions
```bash
psql -U your_username -d your_database -f sql/test_queries.sql
```

## Quick Test

### Test in psql
```sql
-- Connect to your database
psql -U your_username -d your_database

-- Run a quick test
SELECT * FROM get_dashboard_stats();

-- Check function count
SELECT COUNT(*) 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE 'get_%' OR p.proname LIKE 'calculate_%';
-- Should return at least 12
```

## Common Issues

### Issue 1: Function already exists
**Error**: `function "get_dashboard_stats" already exists`  
**Solution**: The script includes DROP statements, ensure you run the complete file

### Issue 2: Column does not exist
**Error**: `column "difficulty_level" does not exist`  
**Solution**: Verify your schema matches the requirements in README.md

### Issue 3: Permission denied
**Error**: `permission denied for relation`  
**Solution**: Grant necessary permissions or run as superuser

## Dashboard Integration

The functions are designed to work with Supabase RPC calls:

```javascript
// Example: Call from JavaScript
const { data, error } = await supabase
  .rpc('get_dashboard_stats');

if (error) console.error('Error:', error);
else console.log('Stats:', data);
```

## File Structure

```
sql/
├── user_analytics_functions.sql    # Main implementation (deploy this)
├── test_queries.sql                 # Test all functions
├── verify_schema_compliance.sql    # Verify installation
├── README.md                        # Full documentation
├── IMPLEMENTATION_SUMMARY.md       # Implementation details
└── QUICK_START.md                  # This file
```

## Next Steps

1. ✅ Deploy `user_analytics_functions.sql`
2. ✅ Run `verify_schema_compliance.sql`
3. ✅ Test with `test_queries.sql`
4. ✅ Update your dashboard to use the new functions
5. ✅ Monitor performance and optimize indexes if needed

## Support

For issues or questions:
1. Check README.md for detailed documentation
2. Review IMPLEMENTATION_SUMMARY.md for compliance details
3. Examine the function source code for specific behavior
4. Test with sample data using test_queries.sql

## Schema Quick Reference

### Required Tables
- ✓ users (id, name, phone_number)
- ✓ vocabulary (id, word, translation)
- ✓ learning_sessions (id, user_id, vocabulary_id, session_date, session_type)
- ✓ user_progress (id, user_id, vocabulary_id, difficulty_level)
- ✓ user_mistakes (id, user_id, vocabulary_id, mistake_date)

### Important
- ❌ vocabulary.difficulty_level does NOT exist
- ❌ user_responses.is_correct does NOT exist
- ✓ Use user_progress for difficulty_level
- ✓ Use user_mistakes for success calculation
- ✓ Use Europe/Berlin timezone for all dates
