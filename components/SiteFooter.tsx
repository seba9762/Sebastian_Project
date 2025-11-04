import Container from './Container'
import Link from 'next/link'

export default function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 mt-auto">
      <Container>
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Product
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
                  >
                    Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              © {currentYear} German Vocabulary Dashboard. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <Link
                href="#"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
              >
                Twitter
              </Link>
              <Link
                href="#"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
              >
                GitHub
              </Link>
              <Link
                href="#"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm no-underline transition-colors"
              >
                LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
