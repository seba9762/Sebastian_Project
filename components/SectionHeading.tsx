interface SectionHeadingProps {
  children: React.ReactNode
  level: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}

export default function SectionHeading({
  children,
  level,
  className = '',
}: SectionHeadingProps) {
  const baseClasses = 'font-bold text-slate-900 dark:text-slate-50'

  const sizeClasses = {
    1: 'text-4xl sm:text-5xl lg:text-6xl',
    2: 'text-3xl sm:text-4xl lg:text-5xl',
    3: 'text-2xl sm:text-3xl lg:text-4xl',
    4: 'text-xl sm:text-2xl lg:text-3xl',
    5: 'text-lg sm:text-xl lg:text-2xl',
    6: 'text-base sm:text-lg lg:text-xl',
  }

  const HeadingTag = `h${level}` as const

  return (
    <HeadingTag className={`${baseClasses} ${sizeClasses[level]} ${className}`}>
      {children}
    </HeadingTag>
  )
}
