import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { ProductInfo } from './types'

export function groupByCategory<T extends { product: ProductInfo }>(rows: T[]) {
  return PRODUCT_CATEGORIES.map((category) => ({
    category,
    rows: rows.filter((row) => row.product.category === category),
  })).filter((group) => group.rows.length > 0)
}
