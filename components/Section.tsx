import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export default function Section({
  children,
  className = '',
  padding = 'lg',
}: SectionProps) {
  const paddingClasses = {
    none: '',
    sm: 'py-6 sm:py-8',
    md: 'py-12 sm:py-16',
    lg: 'py-16 sm:py-24',
    xl: 'py-24 sm:py-32',
  }

  return (
    <section className={`${paddingClasses[padding]} ${className}`}>
      {children}
    </section>
  )
}
