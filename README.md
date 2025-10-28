# German Vocabulary Learning System - Admin Dashboard

A standalone HTML dashboard that connects to a Supabase database to display real-time analytics for a German vocabulary learning system.

## Features

- 📊 Real-time analytics and statistics
- 👥 User progress tracking
- 📈 Interactive charts and visualizations
- 🔄 Auto-refresh every 5 minutes
- 🐛 Built-in debug console for troubleshooting
- 🔌 Connection testing utilities

## Prerequisites

- A Supabase project with the German vocabulary database
- The following Supabase database functions (must be created in your Supabase project):
  - `get_dashboard_stats()`
  - `get_user_progress_summary()`
  - `get_daily_activity()`
  - `get_difficulty_distribution()`
  - `get_exercise_accuracy()`
  - `get_difficult_words()`
  - `get_all_sessions_summary()`

## Setup Instructions

### Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (a long string starting with `eyJ...`)

### Step 2: Configure the Dashboard

1. Open `german_vocab_dashboard (4) copy.html` in a text editor
2. Find the configuration section (around line 421):
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```
3. Replace the placeholders with your actual credentials:
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```
4. Save the file

### Step 3: Open the Dashboard

1. Simply open the HTML file in a web browser (Chrome, Firefox, Safari, Edge, etc.)
2. The dashboard will automatically:
   - Initialize the Supabase connection
   - Test the connection
   - Load all analytics data
   - Start auto-refreshing every 5 minutes

## Usage

### Main Features

- **Refresh Data**: Click the "🔄 Refresh Data" button to manually reload all analytics
- **Toggle Debug**: Click the "🔍 Toggle Debug" button to show/hide the debug console
- **Test Connection**: Click the "🔌 Test Connection" button to verify database connectivity

### Dashboard Sections

1. **System Overview**: All-time statistics including total sessions, messages, and active days
2. **Key Metrics**: 7-day active users, words taught today, response rate, and average daily words
3. **Daily Activity Chart**: Visual representation of messages and responses over the last 7 days
4. **Difficulty Distribution**: Pie chart showing the distribution of word difficulty levels
5. **Exercise Completion Rate**: Line chart tracking completion rates over time
6. **Top Performers**: Bar chart of users with the most words learned
7. **Active Users Table**: Detailed table of all users with progress metrics
8. **Most Challenging Words**: Table showing words that users find most difficult

## Troubleshooting

### Dashboard shows "Configuration Required"

- **Cause**: Supabase credentials are not properly configured
- **Solution**: Follow the setup instructions above to add your credentials

### Connection Test Fails

Possible causes and solutions:

1. **Invalid Credentials**
   - Verify your Supabase URL and anon key are correct
   - Make sure there are no extra spaces or quotes

2. **CORS Issues**
   - Supabase should allow cross-origin requests by default
   - Check your browser's developer console for CORS errors

3. **Database Functions Missing**
   - Ensure all required database functions exist in your Supabase project
   - Check the Functions/RPC section in your Supabase dashboard

4. **Network Issues**
   - Check your internet connection
   - Verify you can access your Supabase project URL in a browser

### No Data Displayed

- **Cause**: Database functions may not be returning data or may not exist
- **Solution**: 
  1. Enable debug mode by clicking "🔍 Toggle Debug"
  2. Click "🔄 Refresh Data" and check the debug output
  3. Verify the database functions exist and return data in your Supabase SQL Editor

### JavaScript Errors

1. Open your browser's Developer Tools (F12)
2. Check the Console tab for error messages
3. Enable debug mode in the dashboard for more detailed logging

## Security Considerations

### Using the Anon Key

The anon/public key is designed to be used in client-side applications and is safe to include in the HTML file because:

- It respects Row Level Security (RLS) policies
- It only provides the access you've configured in your Supabase project
- All database queries are still protected by your RLS rules

### Important Security Notes

⚠️ **Do NOT commit this file to public repositories with your credentials**

If you need to share the code:
1. Remove your credentials before committing
2. Use environment variables in a build process
3. Add the HTML file to `.gitignore` if it contains credentials
4. Consider using a `.env` file approach with a build tool

### Best Practices

1. **For Development**: Direct credential configuration (as shown in this setup) is fine
2. **For Production**: 
   - Use a proper build tool (Webpack, Vite, etc.)
   - Store credentials in environment variables
   - Serve the file through a web server with proper security headers
   - Consider implementing authentication for the dashboard itself

## Browser Compatibility

This dashboard works in all modern browsers:
- ✅ Chrome/Edge (Chromium) 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## Dependencies

All dependencies are loaded from CDN:
- [Supabase JS Client](https://github.com/supabase/supabase-js) v2 - Database connectivity
- [Chart.js](https://www.chartjs.org/) - Data visualization

## Support

If you encounter issues:
1. Check the debug console in the dashboard
2. Check your browser's developer console (F12)
3. Verify all database functions exist in Supabase
4. Test the connection using the "🔌 Test Connection" button

## Technical Details

### Database Functions Required

The dashboard expects these PostgreSQL functions in your Supabase database:

- `get_dashboard_stats()` - Returns overall statistics
- `get_user_progress_summary()` - Returns user progress data
- `get_daily_activity()` - Returns daily activity metrics
- `get_difficulty_distribution()` - Returns word difficulty distribution
- `get_exercise_accuracy()` - Returns exercise completion rates
- `get_difficult_words()` - Returns most challenging words
- `get_all_sessions_summary()` - Returns system-wide session summary

Each function should be accessible via RPC and return appropriate JSON data.

### Error Handling

The dashboard includes comprehensive error handling:
- Connection validation on startup
- Function-level error catching with detailed logging
- Global error handlers for uncaught exceptions
- User-friendly error messages with actionable guidance

## License

This dashboard is part of the German Vocabulary Learning System project.
