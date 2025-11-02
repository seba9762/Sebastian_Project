# German Vocabulary Learning System - Admin Dashboard

A clean, responsive admin dashboard for monitoring and analyzing the German Vocabulary Learning System.

## Features

### Dashboard Sections

1. **System Overview** - All-time statistics including total sessions, messages sent, active days, and system age
2. **Key Metrics** - Weekly active users, words taught today, response rate, and average daily words
3. **Analytics Charts**
   - Daily Activity (Last 7 Days) - Line chart showing messages sent and user responses
   - Difficulty Distribution - Doughnut chart of word difficulty levels
   - Exercise Accuracy - Line chart of completion rates over time
   - Top Performers - Horizontal bar chart of users with most words learned
4. **Active Users Table** - Detailed user performance with clickable links to user detail pages
5. **Most Challenging Words** - Table showing words with highest difficulty ratings
6. **Recent Activity Feed** - Live feed of recent user sessions

### Key Features

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Export & Print** - Export data to CSV or print dashboard for reports
- **Real-time Updates** - Auto-refresh every 5 minutes
- **Debug Console** - Built-in debugging tools for troubleshooting
- **Clean Architecture** - Modular JavaScript with separation of concerns

## Project Structure

```
/
├── dashboard.html              # Main admin dashboard
├── user-detail.html            # User detail page (placeholder)
├── assets/
│   ├── css/
│   │   └── admin.css          # Centralized stylesheet with CSS variables
│   └── js/
│       ├── api.js             # API calls and Supabase integration
│       ├── charts.js          # Chart.js initialization and updates
│       └── dashboard.js       # Main dashboard logic
└── README.md
```

## Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Supabase account with configured database

### Configuration

1. Open `assets/js/api.js`
2. Update the Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';
   ```

### Running

Simply open `dashboard.html` in a web browser, or serve via a local web server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx http-server

# Then open http://localhost:8000/dashboard.html
```

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties (CSS variables), Grid, Flexbox
- **JavaScript (ES6+)** - Modules, async/await
- **Chart.js** - Data visualization via CDN
- **Supabase** - Backend API and database

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Design System

### Colors

- Primary: `#667eea`
- Secondary: `#764ba2`
- Success: `#28a745`
- Warning: `#ffc107`
- Danger: `#dc3545`
- Info: `#17a2b8`

### Components

- **Cards** - White background with shadow and border-radius
- **Badges** - Color-coded status indicators
- **Progress Bars** - Gradient-filled percentage indicators
- **Tables** - Responsive with hover effects
- **Charts** - Canvas-based with Chart.js

## Development

The project uses pure HTML/CSS/JavaScript with no build step required. Simply edit the files and refresh your browser.

### Code Style

- ES6 modules for JavaScript organization
- Semantic HTML5 elements
- CSS variables for theming
- No inline styles (except dynamic values from JavaScript)
- Mobile-first responsive design

## License

Internal project for German Vocabulary Learning System.
