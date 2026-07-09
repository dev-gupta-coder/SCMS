import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { ThemeToggle } from '@/components/ui'
import { signOut } from '@/features/auth/authActions'
import { useProfile } from '@/features/auth/useProfile'

const NAV_LINKS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/buildings', label: 'Buildings' },
  { to: '/admin/cems', label: 'CEMs' },
  { to: '/admin/ledger', label: 'Ledger' },
  { to: '/admin/products', label: 'Catalog' },
  { to: '/admin/reports', label: 'Reports' },
]

/** Persistent desktop-first top nav shared by every Admin screen (PRD 11). Renders child routes via <Outlet />. */
export function AdminShell() {
  const navigate = useNavigate()
  const { data: profile } = useProfile()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
          <img src="/logo.png" alt="Canvas Workspace" className="h-8 shrink-0" />

          <nav className="flex flex-1 items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-canvas-50 text-canvas-700 dark:bg-canvas-500/10 dark:text-canvas-300'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-4">
            <ThemeToggle />

            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900 dark:text-gray-100">{profile?.full_name}</span>
              {profile?.role && (
                <span className="rounded-full bg-canvas-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-canvas-700 dark:bg-canvas-500/10 dark:text-canvas-300">
                  {profile.role}
                </span>
              )}
            </div>

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
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
