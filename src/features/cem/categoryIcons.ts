import type { ProductCategory } from '@/lib/constants'

// Decorative only — products have no icon field in the schema (Phase 1), so
// each fixed category gets a scannable emoji instead of adding an icon library.
export const CATEGORY_ICON: Record<ProductCategory, string> = {
  Pantry: '☕',
  'Cleaning Materials': '🧴',
  Stationery: '📎',
  'Bathroom Supplies': '🧻',
  Miscellaneous: '📦',
}
