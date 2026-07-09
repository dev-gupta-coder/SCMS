import { useState } from 'react'
import { Card, Input } from '@/components/ui'
import { useSpend } from './api'
import { computeDateRange } from './dateRanges'
import type { DateRangePreset } from './dateRanges'

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom' },
]

const TODAY_ISO = new Date().toISOString().slice(0, 10)

/** PRD 11, Admin screen 2 — total spend, filterable by day/week/month/custom range. Delivery entries only. */
export function SpendSummary() {
  const [preset, setPreset] = useState<DateRangePreset>('month')
  const [customFrom, setCustomFrom] = useState(TODAY_ISO)
  const [customTo, setCustomTo] = useState(TODAY_ISO)

  const range = computeDateRange(preset, customFrom, customTo)
  const spendQuery = useSpend(range)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Spend</h2>

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

      <Card className="flex flex-col items-center gap-1 p-6">
        {spendQuery.isLoading ? (
          <span className="text-gray-400 dark:text-gray-500">Loading…</span>
        ) : spendQuery.isError ? (
          <span className="text-sm text-red-600 dark:text-red-400">Could not load spend.</span>
        ) : (
          <>
            <span className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
              ₹{(spendQuery.data ?? 0).toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {range.from === range.to ? range.from : `${range.from} – ${range.to}`}
            </span>
          </>
        )}
      </Card>
    </div>
  )
}
