import { useState } from 'react'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useAllActiveAlerts, useAllBuildings, useStockHealth } from './api'
import type { LocationScope } from './api'
import { StockHealthSummary } from './StockHealthSummary'
import { AlertsList } from './AlertsList'
import { SpendSummary } from './SpendSummary'
import type { BuildingHealth, StockHealthCounts } from './types'

const EMPTY_COUNTS: StockHealthCounts = { healthy: 0, low: 0, noThreshold: 0 }

export type StockStatusFilter = 'healthy' | 'low' | 'no-threshold' | null

/** PRD 11, Admin screen 2 — Overview Dashboard. */
export function OverviewDashboardPage() {
  const [scope, setScope] = useState<LocationScope>('all')
  const [statusFilter, setStatusFilter] = useState<StockStatusFilter>(null)

  const { data: buildings, isLoading: buildingsLoading } = useAllBuildings()
  const { data: health, isLoading: healthLoading } = useStockHealth(scope)
  const { data: alerts, isLoading: alertsLoading } = useAllActiveAlerts()

  if (buildingsLoading || healthLoading || alertsLoading) return <LoadingScreen />

  const buildingHealth: BuildingHealth[] = (buildings ?? []).map((building) => ({
    buildingId: building.id,
    buildingName: building.name,
    ...(health?.perBuilding[building.id] ?? EMPTY_COUNTS),
  }))

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-8">
      {/* <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Overview</h1> */}

      <StockHealthSummary
        overall={health?.overall ?? EMPTY_COUNTS}
        buildings={buildingHealth}
        scope={scope}
        onScopeChange={setScope}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <AlertsList alerts={alerts ?? []} />

      <SpendSummary />
    </div>
  )
}
