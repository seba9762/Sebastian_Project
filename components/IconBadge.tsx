import { ReactNode } from 'react'

interface IconBadgeProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

export default function IconBadge({
  children,
  className = '',
  variant = 'default',
  size = 'md',
}: IconBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }

  const variantClasses = {
    default: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50',
    success: 'bg-success bg-opacity-10 dark:bg-opacity-20 text-success',
    warning: 'bg-warning bg-opacity-10 dark:bg-opacity-20 text-warning',
    error: 'bg-error bg-opacity-10 dark:bg-opacity-20 text-error',
    info: 'bg-info bg-opacity-10 dark:bg-opacity-20 text-info',
  }

  return (
    <div
      className={`
        inline-flex items-center justify-center
        rounded-full
        font-semibold
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
