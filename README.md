# German Vocabulary Learning System - Admin Dashboard

A modern, responsive admin analytics dashboard for the German Vocabulary Learning System, built with vanilla JavaScript, Chart.js v4, and Supabase.

## Features

### Dashboard (`dashboard.html`)
- 📊 **Real-time Analytics**: Overview metrics showing total users, words taught, accuracy, and exercises
- 📈 **Interactive Charts**: 
  - Daily activity trends (last 7 days)
  - Exercise accuracy rates
- 👥 **Active Users Table**: User performance with direct links to detailed analytics
- 📖 **Challenging Words**: Most difficult vocabulary with error rates
- 📋 **Activity Feed**: Recent user activities
- 🖨️ **Print/Export**: Print-friendly layout for reports
- 🔄 **Auto-refresh**: Manual refresh button to reload data

### User Detail (`user-detail.html`)
- 📊 **User Stats**: Words learned, accuracy, study streak, mastery level
- 📈 **Learning Progress Timeline**: Dual-axis chart showing words learned and accuracy over 30 days
- 🎓 **Mastery Distribution**: Doughnut chart showing word mastery levels
- 🔥 **Learning Patterns**: Study hours by day of week
- ⚠️ **Mistake Analysis**: 
  - Mistakes by type (pie chart)
  - Mistakes by category (bar chart)
  - Mistakes by severity (doughnut chart with color coding)
  - Mistake trends over time (line chart)
- 📖 **Challenging Words**: User's most difficult vocabulary with success rates
- 📋 **Recent Activity**: Detailed activity log
- 📚 **Chapter Progress**: Progress bars for each chapter
- 🖨️ **Print Support**: Clean print layout

## Project Structure

```
.
├── dashboard.html              # Main dashboard page
├── user-detail.html            # Individual user analytics
├── assets/
│   ├── css/
│   │   └── dashboard.css       # Shared styles
│   └── js/
│       ├── api.js              # Supabase client and helpers
│       ├── dashboard.js        # Dashboard logic
│       └── user-detail.js      # User detail logic
├── README.md
└── IMPLEMENTATION_NOTES.md
```

## Setup

### 1. Configure Supabase Credentials

Edit both `dashboard.html` and `user-detail.html` to add your Supabase credentials:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 2. Serve via HTTP Server

The dashboard uses ES6 modules which require an HTTP server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then navigate to:
- Dashboard: `http://localhost:8000/dashboard.html`
- User Detail: `http://localhost:8000/user-detail.html?user_id=USER_ID`

## API Architecture

### Supabase RPC Functions

The dashboard expects the following Supabase RPC functions to be defined:

#### Dashboard Functions
- `get_dashboard_stats()` - Returns: `{ total_users, total_words_learned, average_accuracy, total_exercises }`
- `get_daily_activity({ days: 7 })` - Returns: `[{ date, active_users, total_exercises }]`
- `get_exercise_accuracy({ days: 7 })` - Returns: `[{ date, accuracy }]`
- `get_top_performers()` - Returns: `[{ user_id, user_name, words_learned, exercises_completed, accuracy, last_active }]`
- `get_difficult_words({ limit: 10 })` - Returns: `[{ word, translation, times_taught, error_rate, difficulty }]`
- `get_recent_activity({ limit: 20 })` - Returns: `[{ user_name, timestamp, activity_type, details }]`

#### User Detail Functions
- `get_user_stats({ user_id })` - Returns: `{ user_name, words_learned, accuracy, streak, mastery }`
- `get_user_timeline({ user_id, days: 30 })` - Returns: `[{ date, words_learned, accuracy }]`
- `get_user_mastery({ user_id })` - Returns: `[{ level, count }]`
- `get_user_learning_patterns({ user_id })` - Returns: `[{ day_of_week, study_hours }]`
- `get_user_mistakes_by_type({ user_id })` - Returns: `[{ type, count }]`
- `get_user_mistakes_by_category({ user_id })` - Returns: `[{ category, count }]`
- `get_user_mistakes_by_severity({ user_id })` - Returns: `[{ severity, count }]`
- `get_user_mistake_trends({ user_id, days: 30 })` - Returns: `[{ date, count }]`
- `get_user_challenging_words({ user_id, limit: 10 })` - Returns: `[{ word, translation, attempts, success_rate, difficulty, last_practiced }]`
- `get_user_recent_activity({ user_id, limit: 20 })` - Returns: `[{ date, activity_type, details, result }]`
- `get_user_chapter_progress({ user_id })` - Returns: `[{ chapter_name, progress, words_learned, total_words }]`

### API Module (`api.js`)

The API module provides:

- **Supabase Client**: `initSupabase(url, key)`, `callSupabaseFunction(functionName, params)`
- **Date Formatting**: `formatDate()`, `formatDateTime()`, `formatRelativeTime()`
- **Number Formatting**: `formatNumber()`, `formatPercentage()`
- **UI Helpers**: `showError()`, `showInfo()`, `showSuccess()`, `showLoading()`, `hideLoading()`
- **Data Helpers**: `normalizeArray()`, `safeParseDate()`
- **Badge Helpers**: `getDifficultyBadgeClass()`, `getSeverityBadgeClass()`

## Design System

### Color Palette
- **Primary**: `#667eea` (purple-blue)
- **Secondary**: `#764ba2` (purple)
- **Success**: `#28a745` (green)
- **Warning**: `#ffc107` (yellow)
- **Danger**: `#dc3545` (red)
- **Info**: `#17a2b8` (cyan)

### Difficulty Levels
- **Easy**: Green badge
- **Medium**: Yellow badge
- **Hard**: Red badge

### Severity Levels
- **Low**: Light green background
- **Moderate**: Light yellow background
- **High**: Light red background

## Error Handling

- **Missing Credentials**: Alert shown if Supabase URL/key not configured
- **Network Errors**: User-friendly error messages displayed
- **Invalid Data**: Graceful fallbacks (e.g., "N/A", "0", empty states)
- **Empty Datasets**: Friendly empty state messages with icons
- **Date Parsing**: Safe parsing with fallback values
- **Console Logging**: Structured error logs for debugging

## Responsive Design

- **Desktop**: Multi-column grid layouts
- **Tablet**: 1-2 column layouts
- **Mobile**: Single column, stacked cards
- **Print**: Optimized for paper/PDF export

Breakpoints:
- `max-width: 1200px` - Adjusts chart grid
- `max-width: 768px` - Mobile layout
- `max-width: 480px` - Small mobile adjustments

## Browser Compatibility

- Modern browsers with ES6 module support
- Chart.js 4.x required (loaded via CDN)
- Fetch API for network requests
- CSS Grid and Flexbox for layouts

## Development

### Adding New Charts

1. Add canvas element to HTML
2. Create loading function in JS module
3. Use `callSupabaseFunction()` to fetch data
4. Use `normalizeArray()` to handle response
5. Check for empty data and call `renderEmptyChart()` if needed
6. Create Chart.js instance with responsive options
7. Store chart reference for destruction on refresh

### Adding New RPC Functions

1. Define function in Supabase
2. Call via `callSupabaseFunction('function_name', { params })`
3. Handle response with proper error checking
4. Display data or empty state

## License

This project is part of the German Vocabulary Learning System.
