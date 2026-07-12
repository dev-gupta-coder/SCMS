import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Input, Select } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useFloors } from '../api'
import { useProducts } from '../products/api'
import { useLedgerEntries } from './api'
import { LedgerEntryRow } from '@/features/ledger/LedgerEntryRow'

/** PRD 11, CEM App screen 10 — My Ledger, scoped to the current building. */
export function LedgerPage() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const navigate = useNavigate()

  const [productId, setProductId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const { data: floors, isLoading: floorsLoading } = useFloors(buildingId)
  const { data: products, isLoading: productsLoading } = useProducts(buildingId)

  const filters = useMemo(
    () => ({
      productId: productId || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [productId, fromDate, toDate],
  )
  const { data: entries, isLoading: entriesLoading, isError } = useLedgerEntries(buildingId, filters)

  if (floorsLoading || productsLoading) return <LoadingScreen />
  if (!buildingId) return null

  const hasFilters = productId !== '' || fromDate !== '' || toDate !== ''

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Ledger</h1>
      </div>

      <div className="flex flex-col gap-3">
        <Select value={productId} onChange={(event) => setProductId(event.target.value)}>
          <option value="">All Products</option>
          {(products ?? []).map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </Select>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">From</span>
            <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">To</span>
            <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </label>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setProductId('')
              setFromDate('')
              setToDate('')
            }}
            className="self-start text-sm font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            Clear filters
          </button>
        )}
      </div>

      {entriesLoading && <LoadingScreen />}
      {isError && <p className="text-sm text-red-600 dark:text-red-400">Could not load ledger. Try again.</p>}

      {entries &&
        (entries.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">No entries found.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => (
              <LedgerEntryRow key={entry.id} entry={entry} floors={floors ?? []} />
            ))}
          </div>
        ))}
    </div>
  )
}
