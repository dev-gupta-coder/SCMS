import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { TopBar } from '@/components/layout/TopBar'
import { LoadingScreen } from '@/components/LoadingScreen'
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
  const { data: buildings, isLoading: buildingsLoading } = useMyBuildings()

  // Single access check for the whole /cem/:buildingId/* tree (Known gap,
  // CLAUDE.md) — RLS already blocks the data either way, this is just so an
  // unassigned CEM sees a clear message instead of an empty page shell.
  // While buildings is still loading, hold off on both the shell and the
  // child route (matches BuildingGatePage's own isLoading pattern) so a
  // direct/reloaded URL never mounts the child page before access is known.
  const buildingAccessKnown = !buildingId || !buildingsLoading
  const hasBuildingAccess = !buildingId || (buildings ?? []).some((building) => building.id === buildingId)

  const quickLinks = buildingId && buildingAccessKnown && hasBuildingAccess
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
          buildingId && buildingAccessKnown && hasBuildingAccess && buildings && buildings.length > 1 ? (
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
              {buildingId && buildingAccessKnown && hasBuildingAccess && buildings && buildings.length > 1 && (
                <BuildingSelector buildings={buildings} value={buildingId} onChange={(id) => navigate(`/cem/${id}`)} />
              )}
            </>
          )
        }
      />

      <main>
        {!buildingAccessKnown ? (
          <LoadingScreen />
        ) : hasBuildingAccess ? (
          <Outlet />
        ) : (
          <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              You are not assigned to this building. Contact your Admin.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
