import { useMemo, useState } from 'react'
import { Button, Card, Input, Select, toast } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import { useAllBuildingsFull } from '@/features/admin/buildings/api'
import { useProductCatalog } from '@/features/admin/products/api'
import { computeDateRange } from '../dateRanges'
import type { DateRangePreset } from '../dateRanges'
import { useReportRows } from './api'
import { grandTotal, groupReportByBuilding } from './aggregate'
import { buildReportCsv, downloadCsv } from './exportCsv'
import { buildAndDownloadReportPdf } from './exportPdf'

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom' },
]

const TODAY_ISO = new Date().toISOString().slice(0, 10)

/** PRD 13 / 11, Admin screen 9 — Reports & Export. Purchase/Delivery history only (Phase 1/2 scope). */
export function ReportsPage() {
  const [preset, setPreset] = useState<DateRangePreset>('month')
  const [customFrom, setCustomFrom] = useState(TODAY_ISO)
  const [customTo, setCustomTo] = useState(TODAY_ISO)
  const [buildingId, setBuildingId] = useState('')
  const [category, setCategory] = useState('')
  const [productId, setProductId] = useState('')

  const dateRange = computeDateRange(preset, customFrom, customTo)

  const { data: buildings, isLoading: buildingsLoading } = useAllBuildingsFull()
  const { data: allProducts, isLoading: productsLoading } = useProductCatalog()

  const productOptions = useMemo(
    () =>
      (allProducts ?? []).filter(
        (product) => (!buildingId || product.building.id === buildingId) && (!category || product.category === category),
      ),
    [allProducts, buildingId, category],
  )

  const filters = useMemo(
    () => ({
      dateRange,
      buildingId: buildingId || undefined,
      category: category || undefined,
      productId: productId || undefined,
    }),
    [dateRange, buildingId, category, productId],
  )

  const { data: rows, isLoading: rowsLoading, isError } = useReportRows(filters)

  if (buildingsLoading || productsLoading) return <LoadingScreen />

  const groups = groupReportByBuilding(rows ?? [], buildings ?? [])
  const total = grandTotal(groups)
  const rangeLabel =
    dateRange.from === dateRange.to ? dateRange.from : `${dateRange.from} to ${dateRange.to}`

  const handleBuildingChange = (value: string) => {
    setBuildingId(value)
    setProductId('')
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setProductId('')
  }

  const handleExportCsv = () => {
    if (groups.length === 0) {
      toast.error('No delivery records match these filters.')
      return
    }
    const csv = buildReportCsv(groups, total)
    downloadCsv(`purchase-report-${dateRange.from}-to-${dateRange.to}.csv`, csv)
  }

  const handleExportPdf = () => {
    if (groups.length === 0) {
      toast.error('No delivery records match these filters.')
      return
    }
    buildAndDownloadReportPdf(groups, total, rangeLabel, `purchase-report-${dateRange.from}-to-${dateRange.to}.pdf`)
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Reports &amp; Export</h1>

      <p className="text-sm text-gray-500 dark:text-gray-400">Purchase/Delivery history only (Phase 1/2 scope).</p>

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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select value={buildingId} onChange={(event) => handleBuildingChange(event.target.value)}>
            <option value="">All Buildings</option>
            {(buildings ?? []).map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </Select>

          <Select value={category} onChange={(event) => handleCategoryChange(event.target.value)}>
            <option value="">All Categories</option>
            {PRODUCT_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
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
        </div>
      </div>

      {rowsLoading ? (
        <LoadingScreen />
      ) : isError ? (
        <p className="text-sm text-red-600 dark:text-red-400">Could not load report data. Try again.</p>
      ) : (
        <Card className="flex flex-col items-center gap-1 p-6">
          <span className="text-3xl font-semibold text-gray-900 dark:text-gray-100">₹{total.toFixed(2)}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {(rows ?? []).length} deliveries across {groups.length} building{groups.length === 1 ? '' : 's'}
          </span>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={handleExportCsv} disabled={rowsLoading}>
          Export Excel (CSV)
        </Button>
        <Button onClick={handleExportPdf} disabled={rowsLoading}>
          Export PDF
        </Button>
      </div>
    </div>
  )
}
