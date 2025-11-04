# German Vocabulary Dashboard

Admin dashboard for the German Vocabulary Learning System with real-time analytics.

## Project Structure

```
.
├── assets/
│   └── js/
│       ├── api.js          # Centralized API utilities and Supabase RPC helpers
│       ├── dashboard.js    # Dashboard logic, data loading, and chart rendering
│       └── user-detail.js  # User detail page logic
├── supabase/
│   ├── migrations/         # Database migrations and function definitions
│   └── README.md          # Database documentation
├── german_vocab_dashboard (4) copy.html  # Main dashboard HTML
├── user-detail.html       # User detail page HTML
└── README.md
```

## Features

### API Module (`assets/js/api.js`)
- **Reusable Supabase RPC Helper**: `callRPC(functionName, params)`
  - Accepts parameters (e.g., `{ days: 7, limit: 10 }`)
  - Consistent parsing of returned arrays/objects
  - Automatic response normalization
  
- **Data Validation & Coercion**:
  - `parseNumber()` / `parseIntSafe()` - Safe numeric parsing with defaults
  - `normalizeResponse()` - Handles both single objects and arrays
  - `validateArray()` - Ensures array responses
  
- **Date Formatting**:
  - `formatDate()` - Safe date formatting with fallback
  - `formatRelativeDate()` - Human-readable relative times (e.g., "2h ago")
  - `formatChartDate()` - Formatted dates for chart labels
  - Guards against invalid timestamps
  
- **Error Handling**:
  - Centralized `handleError()` function
  - User-facing alerts via `showAlert()`
  - Structured logging with `log(message, data, level)`
  
- **Print/Export**:
  - `printDashboard()` - Triggers browser print dialog
  - Print-friendly CSS included

### Dashboard Module (`assets/js/dashboard.js`)
- **Async Data Loading**:
  - Loads all datasets in parallel using `Promise.all()`
  - Loading spinners for better UX
  - Auto-refresh every 5 minutes
  
- **RPC Functions Called**:
  - `get_dashboard_stats` - Overall statistics
  - `get_daily_activity` (days: 7) - Activity over last 7 days
  - `get_exercise_accuracy` (days: 7) - Exercise completion rates
  - `get_top_performers` - Top users by words learned
  - `get_difficult_words` (limit: 10) - Most challenging words
  - `get_recent_activity` (limit: 20) - Recent user activities
  - `get_user_progress_summary` - User progress data
  - `get_all_sessions_summary` - System overview
  - `get_difficulty_distribution` - Word difficulty breakdown
  
- **Chart.js Visualizations**:
  - Daily Activity (line chart)
  - Difficulty Distribution (doughnut chart)
  - Exercise Completion Rate (line chart)
  - Top Performers (horizontal bar chart)
  - Configurable tooltips and legends
  - Empty-state fallbacks for missing data
  
- **Tables & Feeds**:
  - Active Users table
  - Most Challenging Words table
  - Recent Activity feed (if element exists)
  - Graceful "No data" messaging

## Configuration

### Database Setup

1. Apply the database migrations from the `supabase/migrations/` directory:
   - Via Supabase Dashboard SQL Editor: Copy and execute the migration files
   - Via Supabase CLI: Run `supabase migration apply`
   - See `supabase/README.md` for detailed instructions

### Frontend Configuration

1. Open the HTML file
2. Configure your Supabase credentials:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';
```

3. Open the HTML file in a browser

## Development

The project uses ES6 modules. To serve locally, use a web server that supports ES6 modules:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000/german_vocab_dashboard%20(4)%20copy.html`

## Error Handling

- Network errors display user-facing alerts
- Console logs include structured data for debugging
- Invalid dates fall back to "No data" or "Never"
- Missing numeric values default to 0
- Empty datasets show appropriate "No data" messages

## Print/Export

Click the "Print / Export" button to open the browser's print dialog. The dashboard includes print-friendly CSS that:
- Removes interactive buttons
- Hides debug panels and alerts
- Optimizes layout for paper/PDF
- Maintains chart visibility

## Debugging

Click the "Toggle Debug" button to show/hide the debug panel with:
- Structured console logs
- API call details
- Response data samples
- Error messages with context

## Browser Compatibility

- Modern browsers with ES6 module support
- Chart.js 3.x or higher required
- Fetch API for network requests
