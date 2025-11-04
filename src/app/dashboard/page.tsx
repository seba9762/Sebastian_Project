import Link from 'next/link';

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-lg font-bold text-primary-600 hover:text-primary-700">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Analytics and statistics coming soon</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Users', value: '-' },
            { label: 'Active Sessions', value: '-' },
            { label: 'Words Learned', value: '-' },
            { label: 'Accuracy Rate', value: '-' },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-gray-600">
            Dashboard content will be implemented to integrate with your Supabase backend.
          </p>
        </div>
      </div>
    </main>
  );
}
