import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

/** One reusable dropdown — every screen gets its light+dark contrast pair from here, never restyled per page. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        'min-h-12 rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900',
        'focus:border-canvas-500 focus:outline-none',
        'disabled:bg-gray-50 disabled:text-gray-400',
        'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
        'dark:disabled:bg-gray-800 dark:disabled:text-gray-600',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
})
