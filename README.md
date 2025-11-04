# German Vocabulary Dashboard

A modern admin dashboard for the German Vocabulary Learning System with real-time analytics, built with Next.js 14, TypeScript, and Tailwind CSS.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Development](#development)
- [Available Scripts](#available-scripts)
- [Configuration](#configuration)
- [Code Quality](#code-quality)
- [Deployment](#deployment)
- [Legacy Assets](#legacy-assets)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or yarn/pnpm

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

## 💻 Tech Stack

- **Next.js 14** - React framework with App Router for modern web development
- **TypeScript** - Type-safe JavaScript for better code quality and IDE support
- **React 18** - Latest React features and improvements
- **Tailwind CSS 3** - Utility-first CSS framework for rapid UI development
- **PostCSS** - CSS processing with Autoprefixer for vendor prefixes
- **ESLint** - Code quality and consistency checking
- **Prettier** - Automatic code formatting
- **Husky** - Git hooks for pre-commit validation
- **lint-staged** - Run linters on staged files
- **SVGR** - Import SVGs as React components
- **next-seo** - SEO optimization for Next.js

## 📁 Project Structure

```
project/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Root layout with metadata
│   │   ├── globals.css           # Global styles with Tailwind
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard page
│   │   ├── docs/
│   │   │   └── page.tsx          # Documentation page
│   │   └── error.tsx             # Error boundary (optional)
│   ├── components/               # Reusable React components
│   │   └── Header.tsx            # Example header component
│   ├── lib/                      # Utility functions and helpers
│   │   └── utils.ts              # Common utility functions
│   └── content/                  # Static content and data
├── public/                       # Static assets (images, icons, etc.)
├── legacy/                       # Archived static assets from previous version
├── .husky/                       # Git hooks configuration
├── .eslintrc.json                # ESLint configuration
├── .prettierrc.json              # Prettier configuration
├── .prettierignore               # Prettier ignore rules
├── .gitignore                    # Git ignore rules
├── .env.example                  # Environment variables template
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
├── postcss.config.js             # PostCSS configuration
├── package.json                  # Project dependencies and scripts
└── README.md                     # This file
```

## 🔧 Installation

### 1. Clone or create the project

```bash
# If cloning
git clone <repository-url>
cd project

# Install dependencies
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Then update with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_key

# API Configuration (optional)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Install Husky hooks

```bash
npm install
npx husky install
```

## 👨‍💻 Development

### Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser. The page auto-updates as you edit files.

### Project Structure Guide

#### Adding Pages

Pages go in `src/app/`. Use the App Router convention:

```typescript
// src/app/dashboard/page.tsx
export default function Dashboard() {
  return <div>Dashboard Content</div>;
}
```

#### Creating Components

Store reusable components in `src/components/`:

```typescript
// src/components/Card.tsx
interface CardProps {
  title: string;
  children: React.ReactNode;
}

export default function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h3 className="font-bold">{title}</h3>
      {children}
    </div>
  );
}
```

#### Utility Functions

Add helpers in `src/lib/utils.ts`:

```typescript
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US');
}
```

#### Using Path Aliases

The project is configured with `@/*` alias pointing to `src/`:

```typescript
import { formatDate } from '@/lib/utils';
import Header from '@/components/Header';
```

## 📦 Available Scripts

| Script                 | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Start development server (http://localhost:3000) |
| `npm run build`        | Build optimized production bundle                |
| `npm start`            | Start production server (requires build first)   |
| `npm run lint`         | Run ESLint to check code quality                 |
| `npm run format`       | Format code with Prettier                        |
| `npm run format:check` | Check if code is formatted                       |
| `npm run type-check`   | Check TypeScript types without emitting files    |

## ⚙️ Configuration

### Tailwind CSS

Customize Tailwind in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        // Custom color palette
      },
    },
  },
}
```

### TypeScript

Configure TypeScript in `tsconfig.json`. Key settings:

- `strict: true` - Enable strict type checking
- `paths: "@/*": ["./src/*"]` - Path aliases
- `jsx: preserve` - Preserve JSX for Next.js

### ESLint

Extend ESLint rules in `.eslintrc.json`:

```json
{
  "extends": ["next", "next/core-web-vitals"],
  "rules": {
    // Your rules
  }
}
```

### Prettier

Formatting rules in `.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## ✅ Code Quality

### Pre-commit Hooks

Husky runs `lint-staged` before commits to ensure code quality:

- TypeScript files: ESLint + Prettier
- CSS/JSON: Prettier

No need to run formatters manually—they run automatically!

### Manual Quality Checks

```bash
# Check code quality
npm run lint

# Check formatting
npm run format:check

# Check TypeScript types
npm run type-check

# Fix issues
npm run lint -- --fix
npm run format
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment-Specific Variables

Next.js supports environment-specific files:

- `.env.local` - Local overrides (not committed)
- `.env.production` - Production-specific variables

### Deployment Platforms

#### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

#### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Traditional Server

```bash
npm run build
npm start
```

## 📚 Legacy Assets

Previous static dashboard assets have been archived in the `legacy/` folder for reference:

- `legacy/assets/` - JavaScript modules and utilities
- `legacy/*.html` - Static HTML files
- `legacy/IMPLEMENTATION_NOTES.md` - Previous implementation documentation

These can be used as reference for:

- Data integration patterns
- UI design inspiration
- API integration examples

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feat/feature-name`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feat/feature-name`
4. Submit a pull request

### Code Standards

- Use TypeScript for all new code
- Follow Prettier formatting (automatic via git hooks)
- Write descriptive commit messages
- Add tests for new functionality
- Update documentation as needed

## 📝 License

ISC

## 🆘 Support

For issues and questions:

1. Check existing documentation in `/src/app/docs/page.tsx`
2. Review legacy implementation notes in `legacy/IMPLEMENTATION_NOTES.md`
3. Check TypeScript types for API interfaces
4. Review component implementations for usage patterns

## 📞 Additional Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [React 18 Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [ESLint Documentation](https://eslint.org/docs/rules/)
- [Prettier Documentation](https://prettier.io/docs)
