import Link from 'next/link';

export default function Docs() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-lg font-bold text-primary-600 hover:text-primary-700">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Documentation</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tech Stack</h2>
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-gray-900">Next.js 14</h3>
              <p className="text-gray-600 mt-2">
                React framework with App Router for modern routing and layouts
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900">TypeScript</h3>
              <p className="text-gray-600 mt-2">
                Type-safe development for better code quality and IDE support
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900">Tailwind CSS</h3>
              <p className="text-gray-600 mt-2">
                Utility-first CSS framework for rapid UI development
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900">ESLint & Prettier</h3>
              <p className="text-gray-600 mt-2">
                Code quality and formatting tools for consistent code style
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900">Husky & Lint-staged</h3>
              <p className="text-gray-600 mt-2">
                Git hooks for pre-commit validation and formatting
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900">SVGR</h3>
              <p className="text-gray-600 mt-2">
                Import SVGs as React components for easy icon management
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900">next-seo</h3>
              <p className="text-gray-600 mt-2">SEO optimization for Next.js pages</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Structure</h2>
          <div className="card">
            <pre className="text-sm text-gray-700 overflow-x-auto">
              {`project/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   ├── globals.css      # Global styles
│   │   └── dashboard/       # Dashboard page
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utility functions
│   └── content/             # Static content
├── public/                  # Static assets
├── legacy/                  # Archived static assets
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies
└── README.md                # Project documentation`}
            </pre>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-gray-900">Installation</h3>
              <code className="block bg-gray-100 p-3 rounded mt-2 text-sm text-gray-700">
                npm install
              </code>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900">Development Server</h3>
              <code className="block bg-gray-100 p-3 rounded mt-2 text-sm text-gray-700">
                npm run dev
              </code>
              <p className="text-gray-600 mt-2 text-sm">
                Open http://localhost:3000 in your browser
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900">Linting</h3>
              <code className="block bg-gray-100 p-3 rounded mt-2 text-sm text-gray-700">
                npm run lint
              </code>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900">Code Formatting</h3>
              <code className="block bg-gray-100 p-3 rounded mt-2 text-sm text-gray-700">
                npm run format
              </code>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900">Build for Production</h3>
              <code className="block bg-gray-100 p-3 rounded mt-2 text-sm text-gray-700">
                npm run build
              </code>
              <code className="block bg-gray-100 p-3 rounded mt-2 text-sm text-gray-700">
                npm start
              </code>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Environment Variables</h2>
          <div className="card">
            <p className="text-gray-600 mb-4">
              Create a <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file in the
              project root:
            </p>
            <pre className="bg-gray-100 p-4 rounded text-sm text-gray-700 overflow-x-auto">
              {`# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000`}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Legacy Assets</h2>
          <div className="card">
            <p className="text-gray-600">
              Previous static dashboard assets have been archived in the{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">legacy/</code> folder. These can be
              referenced for data integration or styling inspiration.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
