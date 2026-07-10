import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { TopBar } from '@/components/layout/TopBar'
import { useProfile } from '@/features/auth/useProfile'
import { AnalyticsIcon, BuildingsIcon, CatalogIcon, CemsIcon, LedgerIcon, OverviewIcon, ReportsIcon } from './icons'

const NAV_LINKS = [
  { to: '/admin', label: 'Overview', end: true, Icon: OverviewIcon },
  { to: '/admin/analytics', label: 'Analytics', Icon: AnalyticsIcon },
  { to: '/admin/buildings', label: 'Buildings', Icon: BuildingsIcon },
  { to: '/admin/cems', label: 'CEMs', Icon: CemsIcon },
  { to: '/admin/ledger', label: 'Ledger', Icon: LedgerIcon },
  { to: '/admin/products', label: 'Catalog', Icon: CatalogIcon },
  { to: '/admin/reports', label: 'Reports', Icon: ReportsIcon },
]

/** Persistent desktop-first top nav shared by every Admin screen (PRD 11). Renders child routes via <Outlet />. */
export function AdminShell() {
  const { data: profile } = useProfile()

  return (
    <div className="min-h-full">
      <TopBar
        userName={profile?.full_name}
        roleBadge={profile?.role}
        navSlot={NAV_LINKS.map((link) => (
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
        navItems={NAV_LINKS.map((link) => ({
          key: link.to,
          to: link.to,
          label: link.label,
          end: link.end,
          icon: <link.Icon className="h-5 w-5 shrink-0" />,
        }))}
      />

      <main>
        <Outlet />
      </main>
    </div>
  )
}
