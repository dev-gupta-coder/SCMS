// Fixed, system-wide enums (PRD section 7). Not user-editable in Phase 1 —
// mirrors the `products.category` check constraint in 0001_init_schema.sql.
export const PRODUCT_CATEGORIES = [
  'Pantry',
  'Cleaning Materials',
  'Stationery',
  'Bathroom Supplies',
  'Miscellaneous',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

// Consumption reasons a CEM picks from (PRD section 5, step 3b / section 7).
// `value` matches the `ledger_entries.reason` check constraint; `label` is
// the no-jargon text shown on screen (PRD 10.6).
export const CONSUMPTION_REASONS = [
  { value: 'Routine Consumption', label: 'Routine Use' },
  { value: 'Event Usage', label: 'Event' },
  { value: 'Emergency Usage', label: 'Emergency' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Damaged/Wasted', label: 'Damaged' },
] as const

// Mirrors the `products.unit` check constraint.
export const PRODUCT_UNITS = [
  'Liters',
  'Kg',
  'Rolls',
  'Boxes',
  'Units',
  'Sachets',
  'Packets',
  'Pieces',
  'Bags',
] as const

export type ProductUnit = (typeof PRODUCT_UNITS)[number]

// Mirrors the `products.priority` check constraint (PRD section 4.1 / 7).
export const PRODUCT_PRIORITIES = ['Emergency', 'Necessary', 'Optional'] as const

export type ProductPriority = (typeof PRODUCT_PRIORITIES)[number]
