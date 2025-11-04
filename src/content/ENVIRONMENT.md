# Environment Variables Documentation

This document describes all environment variables used in the German Vocabulary Dashboard project.

## Setup

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Update the values in `.env.local` with your actual configuration.

## Required Variables

### Supabase Configuration

Configure your Supabase instance for backend integration:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
  - Example: `https://your-project.supabase.co`
  - Find at: Supabase Dashboard → Settings → API

- `NEXT_PUBLIC_SUPABASE_KEY` - Your Supabase public API key
  - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - Find at: Supabase Dashboard → Settings → API → Project API Keys

## Optional Variables

### API Configuration

- `NEXT_PUBLIC_API_URL` - API endpoint for the application
  - Default: `http://localhost:3000`
  - Used for: Development and staging environments
  - Change to: Your production API URL in production

## Environment-Specific Files

Next.js supports environment-specific overrides:

- `.env` - Used in all environments
- `.env.local` - Local development (NOT committed to git)
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.test` - Test environment

## Security Notes

⚠️ **Important:**

- Never commit `.env.local` to git (already in .gitignore)
- Never share environment variables containing secrets
- Use `NEXT_PUBLIC_` prefix only for non-sensitive variables
- Keep API keys and tokens in `.env.local` (development) or environment variables (production)

## Accessing Variables in Code

### Client-Side (Browser)

Only variables prefixed with `NEXT_PUBLIC_` are accessible in the browser:

```typescript
// ✅ Accessible in client-side code
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

// ❌ NOT accessible in client-side code
const secretKey = process.env.SUPABASE_SECRET_KEY;
```

### Server-Side

All variables are accessible in server-side code:

```typescript
// ✅ Accessible in server-side code
const secretKey = process.env.SUPABASE_SECRET_KEY;
```

## Example `.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key_here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Troubleshooting

### Variables Not Loading

1. Make sure the file is named `.env.local` (not `.env.development.local` etc.)
2. Variables must start with `NEXT_PUBLIC_` to be accessible in the browser
3. Restart the development server after changing variables
4. Clear `.next/` folder and rebuild

### Type Safety

TypeScript is configured to recognize environment variables. Import types:

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
```

## References

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase API Reference](https://supabase.com/docs/reference)
