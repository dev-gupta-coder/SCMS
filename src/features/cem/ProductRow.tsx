import { Card } from '@/components/ui'
import { CATEGORY_ICON } from './categoryIcons'
import { getStockStatus, STOCK_STATUS_STYLE } from '@/lib/stockStatus'
import type { ProductCategory } from '@/lib/constants'
import type { StockRow } from './types'

export function ProductRow({ row }: { row: StockRow }) {
  const status = getStockStatus(row.current_stock, row.product.low_stock_threshold)
  const style = STOCK_STATUS_STYLE[status]

  return (
    <Card className="flex items-center justify-between gap-3 p-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">
          {CATEGORY_ICON[row.product.category as ProductCategory] ?? '📦'}
        </span>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">{row.product.name}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {row.current_stock} {row.product.unit}
          </span>
        </div>
      </div>

      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
        <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} aria-hidden="true" />
        {style.label}
      </span>
    </Card>
  )
}
