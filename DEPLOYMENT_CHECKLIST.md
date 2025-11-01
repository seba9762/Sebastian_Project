# Deployment Checklist - Analytics Functions Migration

Use this checklist to ensure a smooth deployment of the analytics functions migration.

## Pre-Deployment

### 1. Backup ☑️
- [ ] Create full database backup
  ```bash
  pg_dump -h HOST -U USER -d DB > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- [ ] Verify backup file size is reasonable
- [ ] Test backup can be restored (on test database if available)

### 2. Schema Verification ☑️
- [ ] Run schema verification script
  ```bash
  psql -h HOST -U USER -d DB -f sql/tests/verify_schema_compliance.sql
  ```
- [ ] Review output - should show:
  - [ ] ✓ `learning_sessions.word_id` exists
  - [ ] ✓ `user_mistakes.word_id` exists  
  - [ ] ✓ `user_mistakes.created_at` exists
  - [ ] ✓ `vocabulary.word` and `vocabulary.translation` exist
  - [ ] ✓ `user_progress.difficulty_level` exists

### 3. Environment Check ☑️
- [ ] Confirm correct database environment (dev/staging/production)
- [ ] Verify database credentials are correct
- [ ] Check database version compatibility (PostgreSQL 12+)
- [ ] Ensure sufficient privileges to CREATE/DROP functions

### 4. Team Communication ☑️
- [ ] Notify team of maintenance window (if applicable)
- [ ] Coordinate with frontend team about expected downtime
- [ ] Schedule deployment during low-traffic period
- [ ] Have rollback team member on standby

## Schema Migration (If Needed)

**Only if schema verification shows old column names**

### 5. Schema Update ☑️
- [ ] Create schema migration backup
- [ ] Run schema migration script
  ```sql
  ALTER TABLE learning_sessions RENAME COLUMN vocabulary_id TO word_id;
  ALTER TABLE user_mistakes RENAME COLUMN vocabulary_id TO word_id;
  ALTER TABLE user_mistakes RENAME COLUMN mistake_date TO created_at;
  ```
- [ ] Verify schema changes applied
- [ ] Test existing queries still work
- [ ] Update application code to use new column names (if needed)

## Deployment

### 6. Apply Migration ☑️
- [ ] Apply the analytics functions migration
  ```bash
  psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql
  ```
- [ ] Check for errors in migration output
- [ ] Verify all 13 functions were created successfully
- [ ] Review any warnings or notices

### 7. Basic Smoke Tests ☑️
- [ ] Test `get_dashboard_stats()`
  ```sql
  SELECT * FROM get_dashboard_stats();
  ```
- [ ] Test `get_user_progress_summary()` 
  ```sql
  SELECT * FROM get_user_progress_summary() LIMIT 1;
  ```
- [ ] Test `get_daily_activity(7)`
  ```sql
  SELECT * FROM get_daily_activity(7);
  ```
- [ ] Verify no "column does not exist" errors
- [ ] Confirm results are plausible (not all zeros if data exists)

## Post-Deployment Testing

### 8. Comprehensive Test Suite ☑️
- [ ] Run full test suite
  ```bash
  psql -h HOST -U USER -d DB -f sql/tests/test_analytics_functions.sql
  ```
- [ ] Review test output for any failures
- [ ] Check performance timing (should be < 1 second for most functions)
- [ ] Verify schema compliance checks pass

### 9. Dashboard Testing ☑️
- [ ] Update dashboard Supabase credentials
- [ ] Open dashboard in browser
- [ ] Click "Test Connection" - expect success message
- [ ] Enable debug mode (click "Toggle Debug")
- [ ] Click "Refresh Data" and verify:
  - [ ] All stat cards populate with numbers
  - [ ] Activity chart displays data
  - [ ] Difficulty distribution chart shows data
  - [ ] Exercise accuracy chart renders
  - [ ] Top performers chart appears
  - [ ] Users table loads with data
  - [ ] Difficult words table populates
- [ ] Check browser console for errors (should be none)
- [ ] Verify debug output shows successful API calls

### 10. User-Specific Function Tests ☑️
- [ ] Get a real user ID from database
  ```sql
  SELECT id FROM users LIMIT 1;
  ```
- [ ] Test user streak function
  ```sql
  SELECT * FROM get_user_streak(USER_ID);
  ```
- [ ] Test user response rate
  ```sql
  SELECT * FROM get_user_response_rate(USER_ID, 7);
  ```
- [ ] Test user accuracy
  ```sql
  SELECT * FROM calculate_user_accuracy(USER_ID);
  ```
- [ ] Test weekly performance (new function)
  ```sql
  SELECT * FROM get_user_weekly_performance(USER_ID);
  ```

### 11. Integration Testing ☑️
- [ ] Test from frontend application (if applicable)
- [ ] Verify API endpoints return correct data
- [ ] Check that dashboard refreshes without errors
- [ ] Confirm user-facing features work correctly
- [ ] Test on different user accounts/roles

### 12. Performance Verification ☑️
- [ ] Run performance timing tests (included in test suite)
- [ ] Verify query execution times are acceptable
- [ ] Check database CPU/memory usage (should be normal)
- [ ] Test with concurrent requests (if high traffic expected)

## Documentation

### 13. Update Documentation ☑️
- [ ] Document deployment date/time in changelog
- [ ] Note any issues encountered and resolutions
- [ ] Update any internal wiki/documentation
- [ ] Share deployment notes with team

## Monitoring

### 14. Post-Deployment Monitoring ☑️
- [ ] Monitor database logs for errors (first hour)
- [ ] Check application error tracking (Sentry, etc.)
- [ ] Monitor API response times
- [ ] Watch for user reports of issues
- [ ] Set up alerts for function failures (if available)

### 15. Final Verification ☑️
- [ ] Verify all 13 functions are accessible
- [ ] Confirm no breaking changes to existing functionality
- [ ] Test that old code paths (if any) still work
- [ ] Verify data integrity (counts match expected values)

## If Issues Occur

### Rollback Procedure ☑️
- [ ] Stop application (if needed)
- [ ] Restore from backup
  ```bash
  psql -h HOST -U USER -d DB < backup_TIMESTAMP.sql
  ```
- [ ] Verify rollback successful
- [ ] Test old functions work
- [ ] Restart application
- [ ] Document issues for investigation

### Issue Investigation ☑️
- [ ] Capture error messages and logs
- [ ] Note which function(s) failed
- [ ] Check schema vs. expected schema
- [ ] Review function definitions for syntax errors
- [ ] Test queries manually to isolate issue
- [ ] Contact development team with findings

## Sign-Off

### 16. Deployment Approval ☑️
- [ ] All tests passing
- [ ] No critical errors in logs
- [ ] Dashboard functioning correctly
- [ ] Performance acceptable
- [ ] Team notified of completion
- [ ] Maintenance window closed

**Deployed By:** ___________________  
**Date/Time:** ___________________  
**Environment:** ___________________  
**Issues Encountered:** ___________________  
**Status:** ☑️ Success / ☐ Rolled Back / ☐ Partial  

---

## Quick Reference Commands

```bash
# Backup
pg_dump -h HOST -U USER -d DB > backup.sql

# Verify schema
psql -h HOST -U USER -d DB -f sql/tests/verify_schema_compliance.sql

# Deploy migration
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql

# Test
psql -h HOST -U USER -d DB -f sql/tests/test_analytics_functions.sql

# Quick smoke test
psql -h HOST -U USER -d DB -c "SELECT * FROM get_dashboard_stats();"

# Rollback
psql -h HOST -U USER -d DB < backup.sql
```

## Notes

- This migration is **idempotent** - safe to run multiple times
- All functions use `SECURITY DEFINER` - verify execution context
- Timezone is hardcoded to `Europe/Berlin` - verify this matches requirements
- Functions depend on schema having `word_id` and `created_at` columns
- Test suite includes ~50 test cases covering all functions

## Success Criteria

✅ Deployment is considered successful when:
1. All 13 functions created without errors
2. Test suite passes all checks
3. Dashboard loads and displays data correctly
4. No errors in database logs
5. Performance meets expectations (< 1s per function)
6. Team confirms functionality works as expected

---

**For detailed information, see:**
- [QUICKSTART.md](QUICKSTART.md) - Quick deployment guide
- [MIGRATIONS.md](MIGRATIONS.md) - Comprehensive migration docs
- [sql/README.md](sql/README.md) - Function reference
