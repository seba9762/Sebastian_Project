import { ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  className?: string
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 cursor-pointer no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent'

  const variantClasses = {
    primary: 'bg-accent text-white hover:bg-accent-dark focus-visible:ring-accent',
    secondary: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 hover:bg-slate-300 dark:hover:bg-slate-600',
    outline: 'border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900',
    ghost: 'text-accent hover:bg-accent hover:bg-opacity-10',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {children}
      </Link>
    )
  }

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  )
}
