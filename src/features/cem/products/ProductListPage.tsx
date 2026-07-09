import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { ProductCategory } from '@/lib/constants'
import { CATEGORY_ICON } from '../categoryIcons'
import { useProducts } from './api'

/** Hub for Add/Edit Product (PRD 11, CEM App screens 8-9) — every product in the building, regardless of current stock level. */
export function ProductListPage() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const navigate = useNavigate()
  const { data: products, isLoading } = useProducts(buildingId)

  if (isLoading) return <LoadingScreen />

  const groups = PRODUCT_CATEGORIES.map((category) => ({
    category,
    items: (products ?? []).filter((product) => product.category === category),
  })).filter((group) => group.items.length > 0)

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/cem/${buildingId}`)}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Back
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Products</h1>
      </div>

      <Button onClick={() => navigate(`/cem/${buildingId}/products/new`)}>+ Add Product</Button>

      {groups.length === 0 ? (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">No products yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.category} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {group.category}
              </h3>
              <div className="flex flex-col gap-2">
                {group.items.map((product) => (
                  <Card
                    key={product.id}
                    onClick={() => navigate(`/cem/${buildingId}/products/${product.id}/edit`)}
                    className="flex items-center gap-3 p-3"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {CATEGORY_ICON[product.category as ProductCategory] ?? '📦'}
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {product.name}
                        {!product.is_active && (
                          <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">
                            (Inactive)
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {product.model || product.unit}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
