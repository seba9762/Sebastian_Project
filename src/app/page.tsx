import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            German Vocabulary Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Admin dashboard for the German Vocabulary Learning System with real-time analytics
          </p>
          <div className="flex gap-4 justify-center mb-12">
            <Link href="/dashboard" className="btn-primary">
              View Dashboard
            </Link>
            <Link href="/docs" className="btn-secondary">
              Documentation
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                This is a modern Next.js 14 application with TypeScript and Tailwind CSS. The
                project is structured to support scalability and maintainability.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6">Project Structure</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">src/app/</code> - Next.js App
                  Router pages
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">src/components/</code> - Reusable
                  React components
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">src/lib/</code> - Utility
                  functions and helpers
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">src/content/</code> - Static
                  content and data
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">public/</code> - Static assets
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">legacy/</code> - Previous static
                  assets (archived)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
