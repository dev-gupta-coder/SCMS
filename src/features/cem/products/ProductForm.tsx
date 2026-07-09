import { useState } from 'react'
import { Button, Input, NumericKeypadInput, Select } from '@/components/ui'
import { PRODUCT_CATEGORIES, PRODUCT_PRIORITIES, PRODUCT_UNITS } from '@/lib/constants'

export interface ProductFormValues {
  name: string
  model: string
  category: string
  unit: string
  priority: string
  vendorName: string
  pricePerUnit: string
  lowStockThreshold: string
}

interface ExistingProduct {
  id: string
  name: string
  name_normalized: string
}

interface ProductFormProps {
  initialValues: ProductFormValues
  submitLabel: string
  submitting: boolean
  /** Every product in the building (active + inactive) — the unique(building_id, name_normalized) constraint doesn't care about is_active. */
  existingProducts: ExistingProduct[]
  /** When editing, exclude the product's own row from the dedup check. */
  excludeProductId?: string
  onSubmit: (values: ProductFormValues) => void
}

/** PRD 11, CEM App screens 8-9 — same fields for Add and Edit. */
export function ProductForm({
  initialValues,
  submitLabel,
  submitting,
  existingProducts,
  excludeProductId,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues)

  const update = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const normalizedName = values.name.trim().toLowerCase()
  const conflict = normalizedName
    ? existingProducts.find((p) => p.name_normalized === normalizedName && p.id !== excludeProductId)
    : undefined

  const canSubmit = values.name.trim() !== '' && values.category !== '' && values.unit !== '' && values.priority !== ''

  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Product name</span>
        <Input type="text" value={values.name} onChange={(event) => update('name', event.target.value)} />
        {conflict && (
          <span className="text-sm text-yellow-700 dark:text-yellow-400">
            A product named "{conflict.name}" already exists in this building.
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Model (optional)</span>
        <Input type="text" value={values.model} onChange={(event) => update('model', event.target.value)} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</span>
        <Select value={values.category} onChange={(event) => update('category', event.target.value)}>
          <option value="" disabled>
            Select a category
          </option>
          {PRODUCT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Unit</span>
        <Select value={values.unit} onChange={(event) => update('unit', event.target.value)}>
          <option value="" disabled>
            Select a unit
          </option>
          {PRODUCT_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </Select>
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority</span>
        <div className="grid grid-cols-3 gap-2">
          {PRODUCT_PRIORITIES.map((priority) => (
            <Button
              key={priority}
              variant={values.priority === priority ? 'primary' : 'secondary'}
              size="md"
              onClick={() => update('priority', priority)}
            >
              {priority}
            </Button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vendor name (optional)</span>
        <Input type="text" value={values.vendorName} onChange={(event) => update('vendorName', event.target.value)} />
      </label>

      <NumericKeypadInput
        label="Price per unit"
        value={values.pricePerUnit}
        onChange={(value) => update('pricePerUnit', value)}
        unit={values.unit ? `per ${values.unit}` : undefined}
      />

      <NumericKeypadInput
        label="Low-stock threshold (optional)"
        value={values.lowStockThreshold}
        onChange={(value) => update('lowStockThreshold', value)}
        unit={values.unit || undefined}
      />

      <Button fullWidth disabled={!canSubmit} loading={submitting} onClick={() => onSubmit(values)}>
        {submitLabel}
      </Button>
    </div>
  )
}
