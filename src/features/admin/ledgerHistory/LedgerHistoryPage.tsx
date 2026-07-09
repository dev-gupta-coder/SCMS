import { useMemo, useState } from 'react'
import { Input, Select } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useAllBuildingsFull, useAllFloors } from '@/features/admin/buildings/api'
import { useCems } from '@/features/admin/cem/api'
import { useProductCatalog } from '@/features/admin/products/api'
import { computeDateRange } from '../dateRanges'
import type { DateRangePreset } from '../dateRanges'
import type { LedgerEntryType } from '@/features/ledger/types'
import { useLedgerHistory } from './api'
import { PurchaseHistoryTable } from './PurchaseHistoryTable'
import { TransferHistoryTable } from './TransferHistoryTable'
import { ConsumeHistoryTable } from './ConsumeHistoryTable'

const TABS: { value: LedgerEntryType; label: string }[] = [
  { value: 'delivery', label: 'Purchase/Delivery' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'consumption', label: 'Consume/Update' },
]

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom' },
]

const TODAY_ISO = new Date().toISOString().slice(0, 10)

/** PRD 11, Admin screen 8 — Ledger History: Purchase/Delivery, Transfer, Consume/Update. */
export function LedgerHistoryPage() {
  const [tab, setTab] = useState<LedgerEntryType>('delivery')

  const [preset, setPreset] = useState<DateRangePreset>('month')
  const [customFrom, setCustomFrom] = useState(TODAY_ISO)
  const [customTo, setCustomTo] = useState(TODAY_ISO)
  const [buildingId, setBuildingId] = useState('')
  const [floorId, setFloorId] = useState('')
  const [productId, setProductId] = useState('')
  const [cemId, setCemId] = useState('')

  const dateRange = computeDateRange(preset, customFrom, customTo)

  const { data: buildings, isLoading: buildingsLoading } = useAllBuildingsFull()
  const { data: floors, isLoading: floorsLoading } = useAllFloors()
  const { data: cems, isLoading: cemsLoading } = useCems()
  const { data: allProducts, isLoading: productsLoading } = useProductCatalog()

  const floorOptions = useMemo(
    () => (floors ?? []).filter((floor) => !buildingId || floor.building_id === buildingId),
    [floors, buildingId],
  )
  const productOptions = useMemo(
    () => (allProducts ?? []).filter((product) => !buildingId || product.building.id === buildingId),
    [allProducts, buildingId],
  )

  const filters = useMemo(
    () => ({
      dateRange,
      productId: productId || undefined,
      buildingId: buildingId || undefined,
      floorId: floorId || undefined,
      cemId: cemId || undefined,
    }),
    [dateRange, productId, buildingId, floorId, cemId],
  )

  const { data: entries, isLoading: entriesLoading, isError } = useLedgerHistory(tab, filters)

  if (buildingsLoading || floorsLoading || cemsLoading || productsLoading) return <LoadingScreen />

  const handleBuildingChange = (value: string) => {
    setBuildingId(value)
    setFloorId('')
    setProductId('')
  }

  const hasFilters = buildingId !== '' || floorId !== '' || productId !== '' || cemId !== ''

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ledger History</h1>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {TABS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTab(option.value)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === option.value
                ? 'border-canvas-500 text-canvas-600 dark:text-canvas-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={buildingId} onChange={(event) => handleBuildingChange(event.target.value)}>
            <option value="">All Buildings</option>
            {(buildings ?? []).map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </Select>

          <Select value={floorId} onChange={(event) => setFloorId(event.target.value)} disabled={!buildingId}>
            <option value="">All Floors</option>
            {floorOptions.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.floor_type === 'warehouse' ? 'Warehouse' : floor.name}
              </option>
            ))}
          </Select>

          <Select value={productId} onChange={(event) => setProductId(event.target.value)}>
            <option value="">All Products</option>
            {productOptions.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
                {buildingId ? '' : ` (${product.building.name})`}
              </option>
            ))}
          </Select>

          <Select value={cemId} onChange={(event) => setCemId(event.target.value)}>
            <option value="">All CEMs</option>
            {(cems ?? []).map((cem) => (
              <option key={cem.id} value={cem.id}>
                {cem.full_name}
              </option>
            ))}
          </Select>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              handleBuildingChange('')
              setCemId('')
            }}
            className="self-start text-sm font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            Clear filters
          </button>
        )}
      </div>

      {entriesLoading && <LoadingScreen />}
      {isError && <p className="text-sm text-red-600 dark:text-red-400">Could not load ledger history. Try again.</p>}

      {entries && tab === 'delivery' && <PurchaseHistoryTable entries={entries} buildings={buildings ?? []} />}
      {entries && tab === 'transfer' && (
        <TransferHistoryTable entries={entries} buildings={buildings ?? []} floors={floors ?? []} />
      )}
      {entries && tab === 'consumption' && (
        <ConsumeHistoryTable entries={entries} buildings={buildings ?? []} floors={floors ?? []} />
      )}
    </div>
  )
}
