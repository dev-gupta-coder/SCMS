import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { TopBar } from '@/components/layout/TopBar'
import { useProfile } from '@/features/auth/useProfile'
import { useMyBuildings } from './api'
import { BuildingSelector } from './BuildingSelector'
import { AlertsIcon, LedgerIcon, NotesIcon, ProductsIcon } from './icons'
import { navPillActive, navPillBase, navPillInactive } from './navPillStyles'

/** Persistent top bar shared by every CEM screen (PRD 11) — same TopBar primitive as Admin. Renders child routes via <Outlet />. */
export function CemShell() {
  const navigate = useNavigate()
  const { buildingId } = useParams<{ buildingId: string }>()
  const { data: profile } = useProfile()
  const { data: buildings } = useMyBuildings()

  const quickLinks = buildingId
    ? [
        { to: `/cem/${buildingId}/products`, label: 'Products', Icon: ProductsIcon },
        { to: `/cem/${buildingId}/ledger`, label: 'Ledger', Icon: LedgerIcon },
        { to: `/cem/${buildingId}/alerts`, label: 'Alerts', Icon: AlertsIcon },
        { to: '/cem/note', label: 'Notes', Icon: NotesIcon },
      ]
    : []

  return (
    <div className="min-h-full">
      <TopBar
        sticky
        maxWidthClassName="max-w-4xl"
        userName={profile?.full_name}
        roleBadge={profile?.role}
        navItems={quickLinks.map((link) => ({
          key: link.to,
          to: link.to,
          label: link.label,
          icon: <link.Icon className="h-5 w-5 shrink-0" />,
        }))}
        drawerExtra={
          buildingId && buildings && buildings.length > 1 ? (
            <BuildingSelector buildings={buildings} value={buildingId} onChange={(id) => navigate(`/cem/${id}`)} />
          ) : undefined
        }
        secondaryRow={
          quickLinks.length > 0 && (
            <>
              {quickLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => cn(navPillBase, isActive ? navPillActive : navPillInactive)}
                >
                  <link.Icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </NavLink>
              ))}
              {buildingId && buildings && buildings.length > 1 && (
                <BuildingSelector buildings={buildings} value={buildingId} onChange={(id) => navigate(`/cem/${id}`)} />
              )}
            </>
          )
        }
      />

      <main>
        <Outlet />
      </main>
    </div>
  )
}
