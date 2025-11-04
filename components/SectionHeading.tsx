import { ReactNode, JSX } from 'react'

interface SectionHeadingProps {
  children: ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
  subtitle?: ReactNode
}

export default function SectionHeading({
  children,
  level = 2,
  className = '',
  subtitle,
}: SectionHeadingProps) {
  const baseClasses = 'font-bold tracking-tight'
  
  const levelClasses = {
    1: 'text-4xl sm:text-5xl',
    2: 'text-3xl sm:text-4xl',
    3: 'text-2xl sm:text-3xl',
    4: 'text-xl sm:text-2xl',
    5: 'text-lg sm:text-xl',
    6: 'text-base sm:text-lg',
  }

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <div>
      <HeadingTag className={`${baseClasses} ${levelClasses[level]} ${className}`}>
        {children}
      </HeadingTag>
      {subtitle && (
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  )
}
