import { useMemo, useState } from 'react'
import { Button, Card, Select, toast } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import { useProductCatalog, useToggleProductActive } from './api'

/** PRD 11, Admin screen 7 — read-only list across all buildings, deactivate toggle only (no create/edit). */
export function ProductCatalogPage() {
  const { data: products, isLoading } = useProductCatalog()
  const toggleActive = useToggleProductActive()
  const [buildingFilter, setBuildingFilter] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)

  const buildingOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const product of products ?? []) map.set(product.building.id, product.building.name)
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [products])

  const filtered = (products ?? []).filter((product) => !buildingFilter || product.building.id === buildingFilter)

  const groups = PRODUCT_CATEGORIES.map((category) => ({
    category,
    items: filtered.filter((product) => product.category === category),
  })).filter((group) => group.items.length > 0)

  const handleToggle = async (productId: string, nextActive: boolean) => {
    setPendingId(productId)
    try {
      await toggleActive.mutateAsync({ productId, isActive: nextActive })
      toast.success(nextActive ? 'Product reactivated.' : 'Product deactivated.')
    } catch {
      toast.error('Could not update product. Try again.')
    } finally {
      setPendingId(null)
    }
  }

  if (isLoading) return <LoadingScreen />

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Product Catalog</h1>

      <Select value={buildingFilter} onChange={(event) => setBuildingFilter(event.target.value)}>
        <option value="">All Buildings</option>
        {buildingOptions.map((building) => (
          <option key={building.id} value={building.id}>
            {building.name}
          </option>
        ))}
      </Select>

      {groups.length === 0 ? (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">No products found.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.category} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {group.category}
              </h3>
              <div className="flex flex-col gap-2">
                {group.items.map((product) => (
                  <Card key={product.id} className="flex items-center justify-between gap-3 p-3">
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
                        {product.building.name}
                        {product.model && ` · ${product.model}`}
                        {product.vendor_name && ` · ${product.vendor_name}`}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ₹{product.current_price_per_unit}/{product.unit} · {product.priority}
                        {product.low_stock_threshold != null && ` · Threshold: ${product.low_stock_threshold}`}
                      </span>
                    </div>
                    <Button
                      variant={product.is_active ? 'danger' : 'secondary'}
                      size="md"
                      loading={pendingId === product.id}
                      onClick={() => handleToggle(product.id, !product.is_active)}
                    >
                      {product.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
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
