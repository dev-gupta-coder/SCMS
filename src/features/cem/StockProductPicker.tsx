import { Card } from '@/components/ui'
import { CATEGORY_ICON } from './categoryIcons'
import { groupByCategory } from './groupByCategory'
import type { ProductCategory } from '@/lib/constants'
import type { StockRow } from './types'

interface StockProductPickerProps {
  rows: StockRow[]
  onSelect: (row: StockRow) => void
}

/** Shared by Update Stock and Transfer Stock — only products already in stock here can be picked. */
export function StockProductPicker({ rows, onSelect }: StockProductPickerProps) {
  const groups = groupByCategory(rows)

  if (groups.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 dark:text-gray-500">No stock recorded yet at this location.</p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">Which product?</p>
      {groups.map((group) => (
        <section key={group.category} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {group.category}
          </h3>
          <div className="flex flex-col gap-2">
            {group.rows.map((row) => (
              <Card key={row.id} onClick={() => onSelect(row)} className="flex items-center gap-3 p-3">
                <span className="text-2xl" aria-hidden="true">
                  {CATEGORY_ICON[row.product.category as ProductCategory] ?? '📦'}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{row.product.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {row.current_stock} {row.product.unit} here
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
