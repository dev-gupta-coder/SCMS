// PRD 10.7 / section 12: green = healthy, yellow = low stock, grey = no
// threshold set. Grey is distinct from healthy — an unmonitored item must
// never read as confirmed-healthy.
export type StockStatus = 'healthy' | 'low' | 'no-threshold'

export function getStockStatus(currentStock: number, threshold: number | null): StockStatus {
  if (threshold == null) return 'no-threshold'
  return currentStock <= threshold ? 'low' : 'healthy'
}

export const STOCK_STATUS_STYLE: Record<StockStatus, { dot: string; label: string }> = {
  healthy: { dot: 'bg-green-500', label: 'Healthy' },
  low: { dot: 'bg-yellow-500', label: 'Low Stock' },
  'no-threshold': { dot: 'bg-gray-400', label: 'No Threshold Set' },
}
