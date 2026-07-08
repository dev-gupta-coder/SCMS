import { Card } from '@/components/ui'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { ProductCategory } from '@/lib/constants'
import { CATEGORY_ICON } from '../categoryIcons'
import type { DeliveryProduct } from './types'

interface DeliveryProductPickerProps {
  products: DeliveryProduct[]
  onSelect: (product: DeliveryProduct) => void
}

export function DeliveryProductPicker({ products, onSelect }: DeliveryProductPickerProps) {
  const groups = PRODUCT_CATEGORIES.map((category) => ({
    category,
    items: products.filter((product) => product.category === category),
  })).filter((group) => group.items.length > 0)

  if (groups.length === 0) {
    return <p className="text-center text-sm text-gray-400">No products yet — add one first.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray-500">Which product arrived?</p>
      {groups.map((group) => (
        <section key={group.category} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{group.category}</h3>
          <div className="flex flex-col gap-2">
            {group.items.map((product) => (
              <Card
                key={product.id}
                onClick={() => onSelect(product)}
                className="flex items-center gap-3 p-3"
              >
                <span className="text-2xl" aria-hidden="true">
                  {CATEGORY_ICON[product.category as ProductCategory] ?? '📦'}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{product.name}</span>
                  <span className="text-sm text-gray-500">
                    {product.current_stock} {product.unit} at Warehouse
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
