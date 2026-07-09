import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'danger'
type ButtonSize = 'lg' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Every button carries a visible text label — no icon-only actions (PRD 10.2). */
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-canvas-500 text-white hover:bg-canvas-600 active:bg-canvas-700 disabled:bg-canvas-200 dark:disabled:bg-canvas-900',
  secondary:
    'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:disabled:text-gray-600 dark:disabled:border-gray-800',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-200 dark:disabled:bg-red-950',
}

const sizeClasses: Record<ButtonSize, string> = {
  lg: 'min-h-14 px-6 text-lg',
  md: 'min-h-11 px-4 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = 'primary', size = 'lg', fullWidth = false, loading = false, disabled, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas-500',
        'disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      <span>{children}</span>
    </button>
  )
})
