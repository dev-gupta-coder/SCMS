import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui'
import { STOCK_STATUS_STYLE } from '@/lib/stockStatus'
import type { LocationScope } from './api'
import type { StockStatusFilter } from './OverviewDashboardPage'
import type { BuildingHealth, StockHealthCounts } from './types'

interface StockHealthSummaryProps {
  overall: StockHealthCounts
  buildings: BuildingHealth[]
  scope: LocationScope
  onScopeChange: (scope: LocationScope) => void
  statusFilter: StockStatusFilter
  onStatusFilterChange: (filter: StockStatusFilter) => void
}

/** PRD 11, Admin screen 2 — all buildings at a glance (with a location scope toggle) + stock health summary. */
export function StockHealthSummary({
  overall,
  buildings,
  scope,
  onScopeChange,
  statusFilter,
  onStatusFilterChange,
}: StockHealthSummaryProps) {
  const navigate = useNavigate()
  const total = overall.healthy + overall.low + overall.noThreshold

  const toggleFilter = (value: Exclude<StockStatusFilter, null>) => {
    onStatusFilterChange(statusFilter === value ? null : value)
  }

  const visibleBuildings =
    statusFilter === null
      ? buildings
      : buildings.filter((building) =>
          statusFilter === 'healthy'
            ? building.healthy > 0
            : statusFilter === 'low'
              ? building.low > 0
              : building.noThreshold > 0,
        )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Stock Health</h2>
        <div className="flex rounded-xl border border-gray-200 p-1 dark:border-gray-800">
          <button
            type="button"
            onClick={() => onScopeChange('all')}
            className={`rounded-lg px-3 py-1 text-sm font-medium ${
              scope === 'all' ? 'bg-canvas-500 text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            All Locations
          </button>
          <button
            type="button"
            onClick={() => onScopeChange('warehouse')}
            className={`rounded-lg px-3 py-1 text-sm font-medium ${
              scope === 'warehouse' ? 'bg-canvas-500 text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Warehouse Only
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card
          onClick={() => toggleFilter('healthy')}
          selected={statusFilter === 'healthy'}
          className="flex flex-col items-center gap-1 p-4"
        >
          <span className={`h-3 w-3 rounded-full ${STOCK_STATUS_STYLE.healthy.dot}`} aria-hidden="true" />
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{overall.healthy}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Healthy</span>
        </Card>
        <Card
          onClick={() => toggleFilter('low')}
          selected={statusFilter === 'low'}
          className="flex flex-col items-center gap-1 p-4"
        >
          <span className={`h-3 w-3 rounded-full ${STOCK_STATUS_STYLE.low.dot}`} aria-hidden="true" />
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{overall.low}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Low Stock</span>
        </Card>
        <Card
          onClick={() => toggleFilter('no-threshold')}
          selected={statusFilter === 'no-threshold'}
          className="flex flex-col items-center gap-1 p-4"
        >
          <span className={`h-3 w-3 rounded-full ${STOCK_STATUS_STYLE['no-threshold'].dot}`} aria-hidden="true" />
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{overall.noThreshold}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">No Threshold</span>
        </Card>
        <Card
          onClick={() => onStatusFilterChange(null)}
          selected={statusFilter === null}
          className="flex flex-col items-center gap-1 p-4"
        >
          <span className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" aria-hidden="true" />
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{total}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Total Products</span>
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            All Buildings
          </h3>
          {statusFilter !== null && (
            <button
              type="button"
              onClick={() => onStatusFilterChange(null)}
              className="text-xs font-medium text-canvas-600 hover:text-canvas-700 dark:text-canvas-400 dark:hover:text-canvas-300"
            >
              Clear filter
            </button>
          )}
        </div>
        {visibleBuildings.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {buildings.length === 0 ? 'No buildings yet.' : 'No buildings match this filter.'}
          </p>
        ) : (
          visibleBuildings.map((building) => (
            <Card
              key={building.buildingId}
              onClick={() => navigate(`/admin/buildings/${building.buildingId}`)}
              className="flex items-center justify-between p-3"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">{building.buildingName}</span>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${STOCK_STATUS_STYLE.healthy.dot}`} aria-hidden="true" />
                  {building.healthy}
                </span>
                <span className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${STOCK_STATUS_STYLE.low.dot}`} aria-hidden="true" />
                  {building.low}
                </span>
                <span className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${STOCK_STATUS_STYLE['no-threshold'].dot}`} aria-hidden="true" />
                  {building.noThreshold}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
