'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Container from './Container'

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
      <Container>
        <nav className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center no-underline hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-primary-500">PD</span>
            <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Portfolio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-8">
            <Link
              href="#toolkits"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm font-medium no-underline transition-colors"
            >
              PM Toolkits
            </Link>
            <Link
              href="#projects"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm font-medium no-underline transition-colors"
            >
              n8n Projects
            </Link>
            <Link
              href="#knowledge"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm font-medium no-underline transition-colors"
            >
              Knowledge Base
            </Link>
            <Link
              href="#contact"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm font-medium no-underline transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden sm:block">
            <Link
              href="#contact"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Get in Touch
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 py-4">
            <div className="flex flex-col gap-4">
              <Link
                href="#toolkits"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm font-medium no-underline transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                PM Toolkits
              </Link>
              <Link
                href="#projects"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm font-medium no-underline transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                n8n Projects
              </Link>
              <Link
                href="#knowledge"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm font-medium no-underline transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Knowledge Base
              </Link>
              <Link
                href="#contact"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm font-medium no-underline transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get in Touch
              </Link>
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
