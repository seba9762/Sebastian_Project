'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Container from './Container'

export default function SiteHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    const html = document.documentElement
    const newTheme = isDarkMode ? 'light' : 'dark'
    html.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    setIsDarkMode(!isDarkMode)
  }

  React.useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light'
    setIsDarkMode(theme === 'dark')
  }, [])

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
      <Container>
        <nav className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center no-underline">
            <span className="text-2xl font-bold text-accent">GV</span>
            <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Vocabulary Dashboard
            </span>
          </Link>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-sm font-medium no-underline transition-colors"
            >
              Home
            </Link>
            
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.828 2.828a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.828 2.829a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM10 7a1 1 0 011 1v1a1 1 0 11-2 0V8a1 1 0 011-1zm-4.22-1.78a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414L5.78 6.22a1 1 0 010-1.414zm2.828-2.829a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM10 17a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm4.22-1.78a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.828-2.828a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM10 13a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22 1.78a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm-2.828 2.828a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </Container>
    </header>
  )
}
