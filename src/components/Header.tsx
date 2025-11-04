import Link from 'next/link';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = 'German Vocabulary Dashboard' }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="font-bold text-xl text-primary-600 hover:text-primary-700">
            {title}
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
              Documentation
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
