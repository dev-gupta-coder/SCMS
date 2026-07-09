import { useState } from 'react'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  tableHeaders: string[]
  tableRows: (string | number)[][]
}

/** Every chart gets a "View data" table twin — the accessible, non-color-dependent equivalent (dataviz skill). */
export function ChartCard({ title, subtitle, children, tableHeaders, tableRows }: ChartCardProps) {
  const [showTable, setShowTable] = useState(false)

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={() => setShowTable((value) => !value)}
          className="shrink-0 text-sm font-medium text-canvas-600 hover:text-canvas-700 dark:text-canvas-400 dark:hover:text-canvas-300"
        >
          {showTable ? 'View chart' : 'View data'}
        </button>
      </div>

      {showTable ? (
        tableRows.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">No data for this range.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                <tr>
                  {tableHeaders.map((header) => (
                    <th key={header} className="px-3 py-2">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-900 dark:text-gray-100">
                {tableRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-gray-100 dark:border-gray-800">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="h-72 w-full">{children}</div>
      )}
    </Card>
  )
}
