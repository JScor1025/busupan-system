'use client'

import { cn } from '@/lib/utils/cn'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 focus-visible:ring-[var(--primary)]':
              variant === 'primary',
            'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-90':
              variant === 'secondary',
            'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--secondary)]':
              variant === 'outline',
            'bg-transparent text-[var(--foreground)] hover:bg-[var(--secondary)]':
              variant === 'ghost',
            'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90':
              variant === 'destructive',
          },
          {
            'h-8 px-3 text-xs md:h-7': size === 'sm',
            'h-10 px-5 text-sm md:h-9 md:px-4': size === 'md',
            'h-12 px-6 text-base md:h-11': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
