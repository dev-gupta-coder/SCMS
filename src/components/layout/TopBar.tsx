import { useEffect, useState } from 'react'
import type { ReactNode, SVGProps } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui'
import { signOut } from '@/features/auth/authActions'
import { cn } from '@/lib/cn'          //yahi h ki jo ham class me likhte h usko ye file join karke ek string me convert kar deta h.

export interface TopBarNavItem {
  key: string
  to: string
  label: string
  icon?: ReactNode
  end?: boolean
}

interface TopBarProps {
  /** Primary nav row, e.g. Admin's persistent section links. Omit for shells with no top-level nav. */
  navSlot?: ReactNode
  /** Optional row below the logo/actions row, e.g. CEM's quick-link pills + building selector. */
  secondaryRow?: ReactNode
  /** Same nav items as navSlot/secondaryRow, as data — used to render the <768px drawer. Not a separate item list. */
  navItems?: TopBarNavItem[]
  /** Extra drawer-only content below navItems, e.g. CEM's building selector. */
  drawerExtra?: ReactNode
  userName?: string
  roleBadge?: string
  maxWidthClassName?: string
  sticky?: boolean
}

function HamburgerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

interface NavDrawerProps {
  open: boolean
  onClose: () => void
  navItems: TopBarNavItem[]
  drawerExtra?: ReactNode
  userName?: string
  roleBadge?: string
  onChangePassword: () => void
  onSignOut: () => void
}

/** Off-canvas mobile nav (<768px) — same nav items as the desktop navSlot/secondaryRow, rendered as a vertical list instead of a horizontal row (CLAUDE.md Mobile Navigation Pattern). */
function NavDrawer({ open, onClose, navItems, drawerExtra, userName, roleBadge, onChangePassword, onSignOut }: NavDrawerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const frame = requestAnimationFrame(() => setVisible(true))

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(frame)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 md:hidden" role="presentation">
      <div
        className={cn('absolute inset-0 bg-black/40 transition-opacity duration-[250ms]', visible ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'relative flex h-full w-[270px] max-w-[80vw] flex-col overflow-y-auto bg-white shadow-xl transition-transform duration-[250ms] ease-out dark:bg-gray-900',
          visible ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-4 dark:border-gray-800">
          <img src="/favicon.png" alt="Canvas Workspace" className="h-8 w-8 shrink-0" />
          <span className="text-sm font-semibold text-canvas-600 dark:text-gray-100">Canvas Workspace</span>
        </div>

        {(navItems.length > 0 || drawerExtra) && (
          <nav className="flex flex-col gap-1 px-3 py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-canvas-50 text-canvas-700 dark:bg-canvas-500/10 dark:text-canvas-300'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
            {drawerExtra && <div className="mt-1">{drawerExtra}</div>}
          </nav>
        )}

        <div className="flex-1" />

        <div className="border-t border-gray-100 px-3 py-3 dark:border-gray-800">
          {userName && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm">
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
            onClick={() => {
              onClose()
              onChangePassword()
            }}
            className="flex min-h-[48px] w-full items-center rounded-lg px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            Change Password
          </button>
          <button
            type="button"
            onClick={() => {
              onClose()
              onSignOut()
            }}
            className="flex min-h-[48px] w-full items-center rounded-lg px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Shared top bar shell for both Admin and CEM (PRD 11) — same logo treatment and right-side action group everywhere; only the nav content differs per role. Below 768px, renders a hamburger + compact logo + off-canvas drawer instead of the full row (CLAUDE.md Mobile Navigation Pattern). */
export function TopBar({
  navSlot,
  secondaryRow,
  navItems = [],
  drawerExtra,
  userName,
  roleBadge,
  maxWidthClassName = 'max-w-7xl',
  sticky = false,
}: TopBarProps) {
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

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
        {/* Mobile compact bar (<768px) */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            className="-ml-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            <HamburgerIcon className="h-6 w-6" />
          </button>
          <img src="/logo.png" alt="Canvas Workspace" className="h-8 w shrink-0" />
          {/* <span className="text-sm font-semibold text-canvas-600 dark:text-gray-100 " >Canvas Workspace </span> */}

          <div className="flex-1" />
          <ThemeToggle />
        </div>

        {/* Desktop/tablet bar (≥768px) — unchanged */}
        <div className="hidden flex-wrap items-center gap-x-6 gap-y-2 md:flex">
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

        {secondaryRow && <div className="hidden flex-wrap items-center gap-2 md:flex">{secondaryRow}</div>}
      </div>

      <NavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navItems={navItems}
        drawerExtra={drawerExtra}
        userName={userName}
        roleBadge={roleBadge}
        onChangePassword={() => navigate('/change-password')}
        onSignOut={handleSignOut}
      />
    </header>
  )
}
