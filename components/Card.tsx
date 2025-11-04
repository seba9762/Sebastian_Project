interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  href?: string
}

export default function Card({ children, className = '', onClick, href }: CardProps) {
  const baseClasses =
    'rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 transition-all duration-200 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700'

  if (href) {
    return (
      <a href={href} className={`${baseClasses} ${className} block no-underline`}>
        {children}
      </a>
    )
  }

  return (
    <div onClick={onClick} className={`${baseClasses} ${className}`}>
      {children}
    </div>
  )
}
