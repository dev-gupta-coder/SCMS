// isme admin ka navbar h aue cem ka nhi h 


import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui'
import { signOut } from '@/features/auth/authActions'
import { cn } from '@/lib/cn'          //yahi h ki jo ham class me likhte h usko ye file join karke ek string me convert kar deta h.

interface TopBarProps {
  /** Primary nav row, e.g. Admin's persistent section links. Omit for shells with no top-level nav. */
  navSlot?: ReactNode
  /** Optional row below the logo/actions row, e.g. CEM's quick-link pills + building selector. */
  secondaryRow?: ReactNode
  userName?: string
  roleBadge?: string
  maxWidthClassName?: string
  sticky?: boolean
}

/** Shared top bar shell for both Admin and CEM (PRD 11) — same logo treatment and right-side action group everywhere; only the nav content differs per role. */
export function TopBar({ navSlot, secondaryRow, userName, roleBadge, maxWidthClassName = 'max-w-7xl', sticky = false }: TopBarProps) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header
      className={cn(
        'border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900',
        sticky && 'sticky top-0 z-10',
      )}
    >
      <div className={cn('mx-auto flex flex-col gap-2 px-4 py-3 sm:px-6', maxWidthClassName)}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <img src="/logo.png" alt="Canvas Workspace" className="h-9 w-auto shrink-0" />

          {navSlot ? <nav className="flex flex-1 flex-wrap items-center gap-1">{navSlot}</nav> : <div className="flex-1" />}

          <div className="flex shrink-0 flex-wrap items-center gap-4">
            <ThemeToggle />

            {userName && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-900 dark:text-gray-100">{userName}</span>
                {roleBadge && (
                  <span className="rounded-full bg-canvas-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-canvas-700 dark:bg-canvas-500/10 dark:text-canvas-300">
                    {roleBadge}
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/change-password')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Sign Out
            </button>
          </div>
        </div>

        {secondaryRow && <div className="flex flex-wrap items-center gap-2">{secondaryRow}</div>}
      </div>
    </header>
  )
}
