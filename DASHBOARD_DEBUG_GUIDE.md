# Dashboard Debug Guide

## Issues Found

### Issue 1: get_difficult_words Parameter Mismatch

**Problem**: The dashboard HTML calls:
```javascript
await supabase.rpc('get_difficult_words', { word_limit: 10 });
```

**But the function expects**:
```sql
CREATE OR REPLACE FUNCTION get_difficult_words(limit_count integer DEFAULT 10)
```

**Return columns**:
- `word` (text)
- `translation` (text)
- `times_taught` (bigint)
- `marked_hard` (bigint) ← This is what the function returns
- `difficulty_pct` (numeric)

But the dashboard expects `mistake_count` instead of `marked_hard`.

### Issue 2: Dashboard RPC Calls

Several functions may have similar issues with parameter names or expected return columns.

## Quick Fixes

### Fix 1: Update dashboard.html RPC Call

Change this line in `dashboard.html`:
```javascript
// OLD (wrong parameter name):
await supabase.rpc('get_difficult_words', { word_limit: 10 });

// NEW (correct parameter name):
await supabase.rpc('get_difficult_words', { limit_count: 10 });
```

### Fix 2: Update Column Name in Rendering

Change this in the `renderDifficultWords` function:
```javascript
// OLD:
<span class="badge warning">${word.mistake_count} mistakes</span>

// NEW:
<span class="badge warning">${word.marked_hard} mistakes</span>
```

## Complete Function Parameters Reference

Here's the correct way to call each function:

```javascript
// Functions with NO parameters
await supabase.rpc('get_dashboard_stats');
await supabase.rpc('get_user_progress_summary');
await supabase.rpc('get_difficulty_distribution');
await supabase.rpc('get_all_sessions_summary');
await supabase.rpc('get_words_taught_today');

// Functions with parameters
await supabase.rpc('get_daily_activity', { days: 7 });
await supabase.rpc('get_exercise_accuracy', { days: 7 });
await supabase.rpc('get_difficult_words', { limit_count: 10 }); // ← FIXED!
await supabase.rpc('get_active_users_count', { days: 7 });

// User-specific functions (UUID required)
await supabase.rpc('get_user_streak', { user_id_param: 'uuid-here' });
await supabase.rpc('get_user_response_rate', { 
    user_id_param: 'uuid-here',
    days: 7
});
await supabase.rpc('calculate_user_accuracy', { user_id_param: 'uuid-here' });
await supabase.rpc('get_user_weekly_performance', { user_id_param: 'uuid-here' });
```

## Debugging Steps

### Step 1: Test Functions in Supabase SQL Editor

```sql
-- Test each function manually
SELECT * FROM get_dashboard_stats();
SELECT * FROM get_user_progress_summary() LIMIT 1;
SELECT * FROM get_daily_activity(7);
SELECT * FROM get_difficult_words(10); -- Check the output columns!
```

### Step 2: Check Browser Console

1. Open dashboard.html
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for errors like:
   - CORS errors
   - Function not found errors
   - Type mismatch errors
   - Network errors

### Step 3: Test Supabase Connection

In browser console:
```javascript
// Test connection
const testConnection = async () => {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    console.log('Data:', data);
    console.log('Error:', error);
};
testConnection();
```

### Step 4: Check Return Data Structure

```javascript
// Check what get_difficult_words actually returns
const testDifficultWords = async () => {
    const { data, error } = await supabase.rpc('get_difficult_words', { limit_count: 10 });
    console.log('Difficult words data:', data);
    if (data && data[0]) {
        console.log('Columns:', Object.keys(data[0]));
    }
};
testDifficultWords();
```

## Common Errors and Solutions

### Error: "Could not find the function get_difficult_words"

**Cause**: Functions not deployed or wrong function name

**Solution**:
```bash
# Redeploy functions
psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql
```

### Error: "relation does not exist"

**Cause**: Missing tables or wrong schema

**Solution**: Check your schema matches expected structure

### Error: "CORS policy blocked"

**Cause**: Opening HTML file directly (file://)

**Solution**: Use a web server:
```bash
python3 -m http.server 8000
# Then open http://localhost:8000/dashboard.html
```

### Error: Connection shows "Not Connected"

**Cause**: Invalid Supabase credentials

**Solution**: 
1. Go to Supabase → Settings → API
2. Copy correct URL and anon key
3. Update in dashboard.html

## Testing Checklist

- [ ] Supabase credentials configured correctly
- [ ] All 13 functions deployed successfully
- [ ] Type fixes applied (UUID, VARCHAR, DATE)
- [ ] Dashboard opened through web server (not file://)
- [ ] Browser console shows no errors
- [ ] Connection status shows "Connected"
- [ ] get_dashboard_stats() returns data
- [ ] get_user_progress_summary() returns data
- [ ] get_difficult_words() returns data

## Quick Test Script

Run this in browser console after opening dashboard:

```javascript
// Complete test of all functions
async function testAllFunctions() {
    console.log('🧪 Testing all analytics functions...\n');
    
    const tests = [
        { name: 'get_dashboard_stats', params: {} },
        { name: 'get_user_progress_summary', params: {} },
        { name: 'get_daily_activity', params: { days: 7 } },
        { name: 'get_difficult_words', params: { limit_count: 10 } },
        { name: 'get_all_sessions_summary', params: {} },
    ];
    
    for (const test of tests) {
        try {
            const { data, error } = await supabase.rpc(test.name, test.params);
            if (error) {
                console.error(`❌ ${test.name}:`, error.message);
            } else {
                console.log(`✅ ${test.name}:`, data?.length || 'OK');
            }
        } catch (e) {
            console.error(`❌ ${test.name}: Exception:`, e.message);
        }
    }
    
    console.log('\n✅ Test complete!');
}

testAllFunctions();
```

## Next Steps

1. Apply the fixes to dashboard.html (see Fix 1 and Fix 2 above)
2. Test in browser console
3. If still not working, check the specific error messages
4. Verify all functions work in Supabase SQL Editor first

See the updated dashboard.html file for the corrected implementation.
