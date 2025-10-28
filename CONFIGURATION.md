# Dashboard Configuration Guide

This guide will help you configure the German Vocabulary Dashboard to connect to your Supabase database.

## Quick Start

1. Open `german_vocab_dashboard (4) copy.html` in a text editor
2. Find lines 421-422 (the configuration section)
3. Replace the placeholder values with your actual Supabase credentials
4. Save and open in a browser

## Configuration Details

### Required Credentials

You need two pieces of information from your Supabase project:

#### 1. Supabase Project URL

- Format: `https://[project-id].supabase.co`
- Example: `https://abcdefghijklmnop.supabase.co`
- Where to find it: Supabase Dashboard → Settings → API → Project URL

#### 2. Supabase Anon/Public Key

- Format: Long JWT string starting with `eyJ`
- Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ...`
- Where to find it: Supabase Dashboard → Settings → API → Project API keys → anon public

### Configuration Code

Replace this:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
```

With your actual values:
```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...';
```

## Security Best Practices

### The Anon Key is Safe for Client-Side Use

The Supabase anon/public key is specifically designed for client-side applications:
- ✅ It's safe to include in browser code
- ✅ It respects Row Level Security (RLS) policies
- ✅ It only allows operations you've configured in Supabase
- ✅ Supabase recommends using it in client-side apps

### However, Be Cautious With Git

While the anon key itself is safe:
- ❌ Don't commit files with your credentials to PUBLIC repositories
- ✅ Do add them to PRIVATE repositories (if you trust all collaborators)
- ✅ Consider using `.env` files with a build process for team projects

### If Sharing Code Publicly

If you need to share this dashboard code publicly:

1. **Option 1: Remove credentials before committing**
   ```bash
   # Before committing, ensure credentials are placeholder values
   git add german_vocab_dashboard*.html
   git commit -m "Add dashboard"
   ```

2. **Option 2: Add to .gitignore**
   ```bash
   # Add this line to .gitignore
   echo "german_vocab_dashboard*.html" >> .gitignore
   ```

3. **Option 3: Create a template**
   - Keep a separate template file with placeholders
   - Only commit the template
   - Keep your configured version locally

## Verification Steps

After configuration, verify everything works:

### 1. Open the Dashboard
- Open the HTML file in a browser
- Check for any error messages

### 2. Test Connection
- Click the "🔌 Test Connection" button
- You should see: "✅ Connection successful!"

### 3. Load Data
- Click the "🔄 Refresh Data" button
- Data should populate in all sections

### 4. Check Debug Console
- Click "🔍 Toggle Debug"
- Look for green checkmarks (✓) indicating success
- Red X marks (✗) indicate errors - read the messages for guidance

## Troubleshooting

### Configuration Not Recognized

**Symptom**: Dashboard shows "Configuration Required" warning

**Solutions**:
- Ensure you saved the file after editing
- Refresh the browser page (Ctrl+R or Cmd+R)
- Check for typos in the URL or key
- Make sure there are no extra spaces or quotes

### Invalid Credentials Error

**Symptom**: "Connection failed" or 401/403 errors

**Solutions**:
- Verify you copied the correct anon key (not the service_role key)
- Check your Supabase project is active
- Ensure your Supabase URL is correct

### CORS Errors

**Symptom**: Browser console shows CORS policy errors

**Solutions**:
- This shouldn't happen with Supabase, but if it does:
- Check if you're using a local file:// URL (should work anyway)
- Try serving through a local web server
- Verify your Supabase project settings

### Functions Not Found

**Symptom**: Dashboard loads but shows "No data"

**Solutions**:
- Ensure all required database functions exist in Supabase
- Check RLS policies allow anon access to necessary tables
- Run database migrations if provided
- Enable debug mode to see which functions fail

## Alternative Configuration Methods

### Using Environment Variables (Advanced)

If you're using a build tool like Webpack, Vite, or Parcel:

```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';
```

Then create a `.env` file:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Using a Separate Config File

Create `config.js`:
```javascript
window.SUPABASE_CONFIG = {
  url: 'https://your-project-id.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

Then in the HTML, load it and reference:
```html
<script src="config.js"></script>
```

```javascript
const SUPABASE_URL = window.SUPABASE_CONFIG?.url || 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.anonKey || 'YOUR_SUPABASE_ANON_KEY_HERE';
```

Add `config.js` to `.gitignore`:
```
config.js
```

## Need Help?

If you're still having issues:

1. **Enable Debug Mode**: Click "🔍 Toggle Debug" in the dashboard
2. **Check Browser Console**: Press F12 and look at the Console tab
3. **Test Each Step**: Use the "🔌 Test Connection" button
4. **Review Error Messages**: The dashboard provides detailed error messages

## Summary Checklist

- [ ] Found Supabase URL in project settings
- [ ] Found Supabase anon key in project settings
- [ ] Opened HTML file in text editor
- [ ] Located configuration section (lines 421-422)
- [ ] Replaced placeholder URL with actual URL
- [ ] Replaced placeholder key with actual key
- [ ] Saved the file
- [ ] Opened in browser
- [ ] Tested connection successfully
- [ ] Data loads correctly
- [ ] Understood security implications
- [ ] Decided on git strategy (if applicable)
