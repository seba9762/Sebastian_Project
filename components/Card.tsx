import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export default function Card({
  children,
  className = '',
  hover = true,
  padding = 'md',
}: CardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  }

  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-default' : ''

  return (
    <div
      className={`
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        rounded-lg
        shadow-sm
        ${paddingClasses[padding]}
        ${hoverClasses}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
