import { useMemo, useState } from 'react'
import { Input } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useAllBuildingsFull } from '@/features/admin/buildings/api'
import { computeDateRange } from '../dateRanges'
import type { DateRangePreset } from '../dateRanges'
import { useConsumptionAnalytics, useDeliveryAnalytics } from './api'
import { spendByBuilding, spendByCategory, spendOverTime, topConsumedProducts, usageOverTime } from './aggregate'
import { SpendByCategoryChart } from './SpendByCategoryChart'
import { SpendByBuildingChart } from './SpendByBuildingChart'
import { SpendOverTimeChart } from './SpendOverTimeChart'
import { TopConsumedProductsChart } from './TopConsumedProductsChart'
import { UsageTrendChart } from './UsageTrendChart'

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom' },
]

const TODAY_ISO = new Date().toISOString().slice(0, 10)

/** PRD 11, Admin screen 4 — Analytics: spend by category/building/time, top-consumed products, usage trend. */
export function AnalyticsPage() {
  const [preset, setPreset] = useState<DateRangePreset>('month')
  const [customFrom, setCustomFrom] = useState(TODAY_ISO)
  const [customTo, setCustomTo] = useState(TODAY_ISO)

  const dateRange = computeDateRange(preset, customFrom, customTo)

  const { data: buildings, isLoading: buildingsLoading } = useAllBuildingsFull()
  const {
    data: deliveryRows,
    isLoading: deliveryLoading,
    isPlaceholderData: deliveryStale,
  } = useDeliveryAnalytics(dateRange)
  const {
    data: consumptionRows,
    isLoading: consumptionLoading,
    isPlaceholderData: consumptionStale,
  } = useConsumptionAnalytics(dateRange)

  const categorySpend = useMemo(() => spendByCategory(deliveryRows ?? []), [deliveryRows])
  const buildingSpend = useMemo(() => spendByBuilding(deliveryRows ?? [], buildings ?? []), [deliveryRows, buildings])
  const dailySpend = useMemo(() => spendOverTime(deliveryRows ?? []), [deliveryRows])
  const topProducts = useMemo(() => topConsumedProducts(consumptionRows ?? []), [consumptionRows])
  const dailyUsage = useMemo(() => usageOverTime(consumptionRows ?? []), [consumptionRows])

  if (buildingsLoading || deliveryLoading || consumptionLoading) return <LoadingScreen />

  // A filter change re-renders the previous data at reduced opacity instead of
  // blanking to a loading screen (only the very first load shows one above).
  const isRefetching = deliveryStale || consumptionStale

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Analytics</h1>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setPreset(option.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              preset === option.value
                ? 'bg-canvas-500 text-white'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">From</span>
            <Input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">To</span>
            <Input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} />
          </label>
        </div>
      )}

      <div className={`flex flex-col gap-6 transition-opacity ${isRefetching ? 'opacity-60' : 'opacity-100'}`}>
        <SpendByCategoryChart data={categorySpend} />
        <SpendByBuildingChart data={buildingSpend} />
        <SpendOverTimeChart data={dailySpend} />
        <TopConsumedProductsChart data={topProducts} />
        <UsageTrendChart data={dailyUsage} />
      </div>
    </div>
  )
}
