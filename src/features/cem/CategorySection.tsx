import { ProductRow } from './ProductRow'
import type { StockRow } from './types'

export function CategorySection({ category, rows }: { category: string; rows: StockRow[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{category}</h3>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <ProductRow key={row.id} row={row} />
        ))}
      </div>
    </section>
  )
}
