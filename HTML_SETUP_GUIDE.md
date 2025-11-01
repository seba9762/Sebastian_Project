# 📊 HTML Dashboard Setup Guide

## Overview

Two HTML files have been created to visualize your German vocabulary learning analytics:

1. **dashboard.html** - Main analytics dashboard
2. **user-details.html** - Individual user performance details

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on "Settings" (⚙️) in the left sidebar
3. Click on "API"
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 2: Configure the HTML Files

Open both `dashboard.html` and `user-details.html` and replace these lines:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual credentials:

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### Step 3: Open the Dashboard

Simply open `dashboard.html` in your web browser:
- Double-click the file, OR
- Right-click → "Open with" → Your browser

That's it! 🎉

## 📱 Features

### Main Dashboard (dashboard.html)

**Overview Stats:**
- 📊 Active Users (last 7 days)
- 📖 Words Taught Today
- ✅ Success Rate
- 🔥 Average Engagement

**Charts & Tables:**
- 📈 Daily Activity Chart (last 7 days)
- 👥 User Progress Table (clickable rows)
- 🎯 Most Difficult Words
- 📊 System Summary

**Interactions:**
- Click on any user row to view detailed statistics
- Auto-refreshes every 60 seconds
- Manual refresh button

### User Details (user-details.html)

**Quick Stats:**
- 📚 Total Attempts
- ✅ Successful Attempts
- ❌ Mistakes
- 🎯 Overall Accuracy
- 🔥 Current & Longest Streak

**Detailed Views:**
- 📊 Accuracy Progress Ring (visual)
- 📅 Weekly Performance Table (last 8 weeks)
- 🔥 Learning Streak Information
- 🎯 Response Rate (last 7 days)
- 📖 Most Difficult Word

**Navigation:**
- Back button to return to dashboard

## 🔧 Troubleshooting

### Issue 1: "Not Connected" Status

**Symptoms:**
- Red "⚠️ Not Connected" badge
- Error message displayed

**Solutions:**

1. **Check Supabase Credentials**
   ```javascript
   // Make sure these are replaced with your actual values
   const SUPABASE_URL = 'https://xxxxx.supabase.co'; // Your actual URL
   const SUPABASE_ANON_KEY = 'eyJhbG...'; // Your actual key
   ```

2. **Verify Functions Are Deployed**
   ```bash
   # Make sure you ran all deployment steps
   psql -h HOST -U USER -d DB -f sql/cleanup_existing_functions.sql
   psql -h HOST -U USER -d DB -f supabase/migrations/20251101095455_fix_analytics_functions.sql
   psql -h HOST -U USER -d DB -f sql/fix_uuid_user_ids.sql
   ```

3. **Check Browser Console**
   - Press F12 to open Developer Tools
   - Look at the "Console" tab for error messages

### Issue 2: CORS Errors

**Error Message:**
```
Access to fetch at 'https://xxxxx.supabase.co' from origin 'null' has been blocked by CORS
```

**Solution:**
You need to serve the HTML files through a web server. Options:

**Option A: Using Python (easiest)**
```bash
# In the project directory
python3 -m http.server 8000
```
Then open: http://localhost:8000/dashboard.html

**Option B: Using Node.js**
```bash
npx http-server -p 8000
```
Then open: http://localhost:8000/dashboard.html

**Option C: Using VS Code**
- Install "Live Server" extension
- Right-click on dashboard.html
- Select "Open with Live Server"

### Issue 3: "Please configure your Supabase credentials"

**Solution:**
You forgot to replace the placeholder values. Edit the HTML files and update the credentials as shown in Step 2.

### Issue 4: Functions Return No Data

**Symptoms:**
- Dashboard loads but shows zeros everywhere
- "No users found" message

**Possible Causes:**

1. **No data in database**
   ```sql
   -- Check if you have data
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM learning_sessions;
   SELECT COUNT(*) FROM user_mistakes;
   ```

2. **Date/timezone issues**
   - Functions filter by date ranges
   - Make sure your data has recent dates
   ```sql
   -- Check recent sessions
   SELECT MAX(session_date) FROM learning_sessions;
   ```

3. **RLS (Row Level Security) enabled**
   - If RLS is enabled on tables, the anon key might not have access
   - Either disable RLS or configure proper policies
   ```sql
   -- Check RLS status
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

### Issue 5: User Details Page Shows "No user ID provided"

**Solution:**
Don't open `user-details.html` directly. You must:
1. Open `dashboard.html` first
2. Click on a user row in the table
3. This will navigate to `user-details.html` with the correct parameters

## 🎨 Customization

### Change Colors

Edit the CSS gradient in both files:

```css
/* Find this in the <style> section */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Replace with your colors, for example: */
background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); /* Purple */
background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); /* Blue */
background: linear-gradient(135deg, #10b981 0%, #059669 100%); /* Green */
```

### Change Auto-Refresh Interval

In `dashboard.html`, find:

```javascript
// Auto-refresh every 60 seconds
setInterval(() => {
    if (isConnected && !isLoading) {
        loadDashboard();
    }
}, 60000); // Change this value (in milliseconds)
```

Examples:
- 30 seconds: `30000`
- 2 minutes: `120000`
- 5 minutes: `300000`

### Change Time Ranges

Modify the RPC calls:

```javascript
// Dashboard - Daily Activity
await supabase.rpc('get_daily_activity', { days: 14 }); // Change from 7 to 14 days

// User Details - Response Rate
await supabase.rpc('get_user_response_rate', { 
    user_id_param: userId,
    days: 14  // Change from 7 to 14 days
});
```

## 📊 Using the Dashboards

### Dashboard Workflow

1. **Open Dashboard**
   - Start at `dashboard.html`
   - Wait for data to load (connection badge turns green)

2. **View Overview**
   - Check the 4 stat cards at the top
   - Review daily activity chart
   - Scroll to see all sections

3. **Explore Users**
   - Find a user in the table
   - Click their row to view details

4. **Refresh Data**
   - Click the "🔄 Refresh Data" button
   - Or wait for auto-refresh (every 60 seconds)

### User Details Workflow

1. **Navigate from Dashboard**
   - Click on any user row

2. **View Performance**
   - Check accuracy ring
   - Review weekly performance table
   - See streak information

3. **Return to Dashboard**
   - Click "← Back to Dashboard" button

## 🔒 Security Notes

### Supabase Credentials

- The `anon/public` key is safe to use in client-side code
- It's meant for public access
- However, make sure you have proper RLS (Row Level Security) policies

### Recommended RLS Policies

If you want to restrict access:

```sql
-- Example: Only allow reading analytics functions
-- (The functions themselves handle permissions)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mistakes ENABLE ROW LEVEL SECURITY;

-- Allow function access through SECURITY DEFINER
-- (Functions already have SECURITY DEFINER, so they bypass RLS)
```

## 📁 File Structure

```
project/
├── dashboard.html              # Main dashboard
├── user-details.html           # User detail page
├── HTML_SETUP_GUIDE.md        # This file
├── sql/
│   ├── cleanup_existing_functions.sql
│   ├── fix_uuid_user_ids.sql
│   └── ...
└── supabase/
    └── migrations/
        └── 20251101095455_fix_analytics_functions.sql
```

## 🧪 Testing

### Test Main Dashboard

```javascript
// Open browser console (F12)
// Run these commands to test individual functions

// Test connection
await supabase.rpc('get_dashboard_stats')
// Should return: { total_users: X, words_today: Y, ... }

// Test user list
await supabase.rpc('get_user_progress_summary')
// Should return: array of user objects

// Test daily activity
await supabase.rpc('get_daily_activity', { days: 7 })
// Should return: array with 7 days of data
```

### Test User Details

```javascript
// Get a user ID first
const users = await supabase.rpc('get_user_progress_summary')
const userId = users.data[0].user_id

// Test user functions
await supabase.rpc('get_user_streak', { user_id_param: userId })
await supabase.rpc('calculate_user_accuracy', { user_id_param: userId })
await supabase.rpc('get_user_weekly_performance', { user_id_param: userId })
```

## 🎯 Next Steps

1. ✅ Configure Supabase credentials
2. ✅ Open dashboard.html
3. ✅ Verify connection (green badge)
4. ✅ Test clicking on users
5. ✅ Customize colors if desired
6. ✅ Deploy to a web server for production use

## 🌐 Production Deployment

For production use, you should:

1. **Host on a Web Server**
   - Netlify (free, easy)
   - Vercel (free, easy)
   - GitHub Pages (free)
   - Your own server

2. **Use Environment Variables**
   - Don't hardcode credentials
   - Use a build process

3. **Add Authentication**
   - Use Supabase Auth
   - Protect the dashboard

4. **Monitor Usage**
   - Track dashboard views
   - Monitor API calls

## 📞 Support

If you encounter issues:
1. Check browser console (F12 → Console tab)
2. Verify Supabase credentials
3. Ensure functions are deployed
4. Test with Supabase SQL editor first

## ✅ Checklist

Before using the dashboards:

- [ ] SQL functions deployed successfully
- [ ] All type fixes applied (UUID, VARCHAR, DATE)
- [ ] Supabase credentials obtained
- [ ] Credentials updated in both HTML files
- [ ] dashboard.html opens without errors
- [ ] Connection status shows "Connected"
- [ ] User table displays users
- [ ] Can click on users to view details
- [ ] user-details.html shows user statistics

---

**Status**: Ready to use! 🚀

Open `dashboard.html` and start exploring your analytics!
