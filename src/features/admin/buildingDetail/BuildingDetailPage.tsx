import { useNavigate, useParams } from 'react-router-dom'
import { LoadingScreen } from '@/components/LoadingScreen'
import { LedgerEntryRow } from '@/features/ledger/LedgerEntryRow'
import { useProducts } from '@/features/cem/products/api'
import { getStockStatus, STOCK_STATUS_STYLE } from '@/lib/stockStatus'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import { useBuilding, useBuildingStock, useRecentLedger } from './api'
import type { BuildingStockRow } from './api'

function sortFloors(floors: BuildingStockRow['floor'][]) {
  return floors
    .filter((floor, index, all) => all.findIndex((f) => f.id === floor.id) === index)
    .sort((a, b) => {
      if (a.floor_type !== b.floor_type) return a.floor_type === 'warehouse' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
}

/** PRD 11, Admin screen 3 — drill into one building's full product list, stock by location, and recent activity. */
export function BuildingDetailPage() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const navigate = useNavigate()

  const { data: building, isLoading: buildingLoading } = useBuilding(buildingId)
  const { data: products, isLoading: productsLoading } = useProducts(buildingId)
  const { data: stockRows, isLoading: stockLoading } = useBuildingStock(buildingId)
  const { data: ledger, isLoading: ledgerLoading } = useRecentLedger(buildingId)

  if (buildingLoading || productsLoading || stockLoading || ledgerLoading) return <LoadingScreen />
  if (!building) return null

  const floors = sortFloors((stockRows ?? []).map((row) => row.floor))

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {building.name}
            {!building.is_active && (
              <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">(Inactive)</span>
            )}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/admin/buildings/${buildingId}/manage`)}
          className="text-sm font-medium text-canvas-600 hover:text-canvas-700 dark:text-canvas-400 dark:hover:text-canvas-300"
        >
          Manage
        </button>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Stock by Location</h2>
        {floors.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No floors yet.</p>
        ) : (
          floors.map((floor) => {
            const rows = (stockRows ?? []).filter((row) => row.floor_id === floor.id)
            return (
              <div key={floor.id} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  {floor.floor_type === 'warehouse' ? 'Warehouse' : floor.name}
                </h3>
                <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                      <tr>
                        <th className="px-3 py-2">Product</th>
                        <th className="px-3 py-2">Stock</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-900 dark:text-gray-100">
                      {rows.map((row) => {
                        const status = getStockStatus(row.current_stock, row.product.low_stock_threshold)
                        const style = STOCK_STATUS_STYLE[status]
                        return (
                          <tr key={row.id} className="border-t border-gray-100 dark:border-gray-800">
                            <td className="px-3 py-2">
                              {row.product.name}
                              {!row.product.is_active && (
                                <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">(Inactive)</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {row.current_stock} {row.product.unit}
                            </td>
                            <td className="px-3 py-2">
                              <span className="flex items-center gap-1.5">
                                <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden="true" />
                                {style.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Product Catalog</h2>
        {(products ?? []).length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No products yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {PRODUCT_CATEGORIES.map((category) => {
              const items = (products ?? []).filter((product) => product.category === category)
              if (items.length === 0) return null
              return (
                <div key={category} className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    {category}
                  </h3>
                  {items.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span>
                        {product.name}
                        {!product.is_active && (
                          <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">(Inactive)</span>
                        )}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">
                        ₹{product.current_price_per_unit}/{product.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
        {(ledger ?? []).length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No ledger activity yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {(ledger ?? []).map((entry) => (
              <LedgerEntryRow key={entry.id} entry={entry} floors={floors} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
