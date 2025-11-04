import { ReactNode } from 'react'

interface TagProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
}

export default function Tag({
  children,
  className = '',
  variant = 'default',
  size = 'sm',
}: TagProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }

  const variantClasses = {
    default: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50',
    success: 'bg-success bg-opacity-10 dark:bg-opacity-20 text-success',
    warning: 'bg-warning bg-opacity-10 dark:bg-opacity-20 text-warning',
    error: 'bg-error bg-opacity-10 dark:bg-opacity-20 text-error',
    info: 'bg-info bg-opacity-10 dark:bg-opacity-20 text-info',
  }

  return (
    <span
      className={`
        inline-flex items-center
        font-medium
        rounded-md
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
