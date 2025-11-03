# German Vocabulary Dashboard

Complete admin dashboard system for the German Vocabulary Learning System with comprehensive analytics and visualizations.

## Project Structure

```
.
├── dashboard.html              # Main admin dashboard
├── user-detail.html            # Detailed user analytics page
├── assets/
│   ├── css/
│   │   └── dashboard.css      # Comprehensive responsive styling
│   └── js/
│       ├── api.js             # Supabase API helper functions
│       ├── dashboard.js       # Dashboard data loading and charts
│       └── user-detail.js     # User detail analytics logic
├── README.md                  # This file
└── IMPLEMENTATION_NOTES.md    # Technical implementation details
```

## Features

### Dashboard (dashboard.html)
- **Overview Statistics**: Total users, active users, words today, response rate
- **Daily Activity Chart**: 7-day activity trends (sessions and words)
- **Exercise Accuracy Chart**: 7-day accuracy metrics
- **Top Performers Chart**: Top 10 learners by words learned
- **Difficult Words Table**: Most challenging words with error rates
- **Recent Activity Feed**: Last 20 activities across all users
- **Print/Export**: Print-friendly layout

### User Detail Page (user-detail.html)
- **User Stats Overview**: Words learned, streak, accuracy, sessions
- **Progress Timeline**: 30-day progress chart
- **Word Mastery Breakdown**: Doughnut chart of mastery levels
- **Learning Patterns**: Activity by hour of day
- **Mistake Analysis**:
  - Mistakes by type (pie chart)
  - Mistakes by category (bar chart)
  - Mistakes by severity (doughnut chart with color coding)
  - Mistake trends (7-day line chart)
- **Chapter Progress**: Progress bars for each chapter
- **Challenging Words Table**: User's 10 most difficult words
- **Recent Activity Feed**: Last 20 user activities

## Supabase Functions

### Dashboard Functions
| Function | Parameters | Description |
|----------|-----------|-------------|
| `get_dashboard_stats` | - | Overall dashboard statistics |
| `get_daily_activity` | `{ days: 7 }` | Daily activity data |
| `get_exercise_accuracy` | `{ days: 7 }` | Exercise accuracy metrics |
| `get_top_performers` | - | Top learners ranking |
| `get_difficult_words` | `{ limit: 10 }` | Most challenging words |
| `get_recent_activity` | `{ limit: 20 }` | Recent system activity |

### User Detail Functions
| Function | Parameters | Description |
|----------|-----------|-------------|
| `get_user_detailed_stats` | `{ user_id }` | User overview stats |
| `get_user_progress_timeline` | `{ user_id, days: 30 }` | Progress over time |
| `get_user_word_mastery` | `{ user_id }` | Word mastery breakdown |
| `get_user_learning_patterns` | `{ user_id }` | Learning time patterns |
| `get_user_mistakes_by_type` | `{ user_id }` | Mistake type analysis |
| `get_user_mistakes_by_category` | `{ user_id }` | Category-based mistakes |
| `get_user_mistakes_by_severity` | `{ user_id }` | Severity distribution |
| `get_user_mistake_trends` | `{ user_id, days: 7 }` | Mistake trends |
| `get_user_challenging_words` | `{ user_id, limit: 10 }` | Difficult words |
| `get_user_recent_activity` | `{ user_id, limit: 20 }` | User activity feed |
| `get_chapter_progress` | `{ user_id }` | Chapter completion |

## Setup

### 1. Configure Supabase Credentials

Edit both `dashboard.html` and `user-detail.html` and update the credentials:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_KEY';
```

### 2. Serve Locally

Since the project uses ES6 modules, you need a web server:

**Using Python:**
```bash
python3 -m http.server 8000
```

**Using Node.js:**
```bash
npx serve
```

**Using PHP:**
```bash
php -S localhost:8000
```

### 3. Access the Dashboard

Open your browser and navigate to:
- Main Dashboard: `http://localhost:8000/dashboard.html`
- User Detail: `http://localhost:8000/user-detail.html?id=USER_ID`

Default test user ID: `59d71456-8d30-4e01-a548-7724003e4e48`

## Color Coding

### Difficulty Levels
- **Easy**: Green (#28a745)
- **Moderate**: Yellow (#ffc107)
- **Hard**: Red (#dc3545)

### Severity Levels
- **Minor**: Blue (#17a2b8)
- **Major**: Orange (#ffc107)
- **Critical**: Dark Red (#721c24)

### Status
- **Success**: Green
- **Warning**: Yellow
- **Danger**: Red
- **Info**: Teal

## Key Features

### Error Handling
- Try-catch blocks for all API calls
- Console logging for debugging
- User-facing error messages
- Fallback values for missing data
- Safe date parsing with "Invalid Date" handling

### Loading States
- Spinners for async operations
- Loading messages in tables
- Disabled buttons during refresh
- Auto-dismissing success messages

### Empty States
- Friendly messages when no data available
- Icon-based empty state displays
- Helpful subtext for guidance

### Responsive Design
- Mobile-friendly layouts
- Flexible grid systems
- Responsive charts
- Touch-friendly buttons

### Print/Export
- Print-friendly CSS
- Button to trigger print dialog
- Hidden interactive elements in print view
- Optimized chart sizes for printing

## Chart Types

- **Line Charts**: Daily activity, progress timeline, mistake trends
- **Bar Charts**: Top performers, learning patterns, category mistakes
- **Pie Charts**: Mistake types
- **Doughnut Charts**: Word mastery, severity distribution

## Browser Compatibility

- Modern browsers with ES6 module support
- Chart.js v4 required (loaded via CDN)
- Fetch API for network requests
- CSS Grid and Flexbox for layouts

## Development

### Code Style
- ES6 modules with named exports
- Async/await for asynchronous operations
- CamelCase function names
- Descriptive variable names
- JSDoc comments for functions

### API Module (api.js)
Centralized helper functions:
- `initAPI()` - Initialize Supabase connection
- `callSupabaseFunction()` - Call RPC functions
- `formatDate()` - Safe date formatting
- `formatRelativeDate()` - Relative time (e.g., "2h ago")
- `formatNumber()` - Number formatting with commas
- `showError()` / `showSuccess()` - User alerts
- `getDifficultyBadge()` - HTML badges for difficulty
- `getSeverityBadge()` - HTML badges for severity
- `createChart()` - Chart.js wrapper
- `createEmptyState()` - Empty state HTML

### Dashboard Module (dashboard.js)
Main dashboard logic:
- `initDashboard()` - Initialize and load data
- `loadAllData()` - Load all dashboard data
- `loadOverviewStats()` - Stats cards
- `loadDailyActivity()` - Activity chart
- `loadExerciseAccuracy()` - Accuracy chart
- `loadTopPerformers()` - Performers chart
- `loadDifficultWords()` - Words table
- `loadRecentActivity()` - Activity feed

### User Detail Module (user-detail.js)
User analytics logic:
- `initUserDetail()` - Initialize with user ID
- `loadAllUserData()` - Load all user data
- `loadUserStats()` - User stat cards
- `loadProgressTimeline()` - Progress chart
- `loadWordMastery()` - Mastery chart
- `loadLearningPatterns()` - Patterns chart
- `loadMistakeAnalysis()` - All mistake charts
- `loadChapterProgress()` - Chapter bars
- `loadChallengingWords()` - Words table
- `loadRecentActivity()` - Activity feed

## Troubleshooting

### Charts not rendering
- Check browser console for errors
- Verify Chart.js CDN is loaded
- Ensure canvas elements exist in HTML

### No data displaying
- Verify Supabase credentials are correct
- Check network tab for API errors
- Ensure Supabase RPC functions exist
- Review console logs for errors

### Module import errors
- Use a web server (not file:// protocol)
- Ensure all JS files are in correct paths
- Check for typos in import statements

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on the repository.
