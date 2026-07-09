import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardBaseProps {
  children: ReactNode
  /** Highlights the card as the active/selected choice (e.g. selected building). */
  selected?: boolean
  className?: string
}

type StaticCardProps = CardBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'> & { onClick?: undefined }

type TappableCardProps = CardBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    onClick: NonNullable<ButtonHTMLAttributes<HTMLButtonElement>['onClick']>
  }

export type CardProps = StaticCardProps | TappableCardProps

/**
 * One reusable Card. Pass `onClick` to get a large, tappable card (e.g. Building
 * Selector); omit it for a static container (e.g. a dashboard summary panel).
 */
export function Card({ children, selected = false, className, onClick, ...props }: CardProps) {
  const shared = cn(
    'rounded-2xl border bg-white p-4 text-left text-gray-900 shadow-sm transition-colors dark:bg-gray-900 dark:text-gray-100',
    selected ? 'border-canvas-500 ring-2 ring-canvas-500' : 'border-gray-200 dark:border-gray-800',
    className,
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          shared,
          'w-full min-h-14 hover:border-canvas-300 hover:bg-canvas-50 active:bg-canvas-100',
          'dark:hover:border-canvas-700 dark:hover:bg-canvas-500/10 dark:active:bg-canvas-500/20',
        )}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    )
  }

  return (
    <div className={shared} {...(props as HTMLAttributes<HTMLDivElement>)}>
      {children}
    </div>
  )
}
