import { useEffect, useState } from 'react'
import { Button, Card, Input, NumericKeypadInput, Select } from '@/components/ui'
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '@/lib/constants'
import { useProductSearch } from './api'
import type { ProductSearchResult } from './types'

export interface ProductFormValues {
  name: string
  model: string
  category: string
  unit: string
  vendorName: string
  pricePerUnit: string
  lowStockThreshold: string
}

interface ProductFormProps {
  buildingId: string
  initialValues: ProductFormValues
  submitLabel: string
  submitting: boolean
  /** Edit mode: exclude the product's own row from duplicate/reuse matching. */
  excludeProductId?: string
  /** Add mode only — when provided, renders the reuse-search list; calling it links an existing global product to this building instead of creating a new one. */
  onLinkExisting?: (product: ProductSearchResult) => void
  linkingProductId?: string | null
  onSubmit: (values: ProductFormValues) => void
}

/** Debounces so search-as-you-type doesn't fire a query on every keystroke. */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

/** PRD 11, CEM App screens 8-9 — same fields for Add and Edit. */
export function ProductForm({
  buildingId,
  initialValues,
  submitLabel,
  submitting,
  excludeProductId,
  onLinkExisting,
  linkingProductId,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues)

  const update = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const debouncedName = useDebouncedValue(values.name, 300)
  const { data: searchResults } = useProductSearch(buildingId, debouncedName)
  const matches = (searchResults ?? []).filter((p) => p.id !== excludeProductId)

  const normalizedName = values.name.trim().toLowerCase()
  const normalizedModel = values.model.trim().toLowerCase()
  const exactDuplicate = normalizedName
    ? matches.find((p) => p.name_normalized === normalizedName && (p.model ?? '').trim().toLowerCase() === normalizedModel)
    : undefined

  const canSubmit = values.name.trim() !== '' && values.category !== '' && values.unit !== ''

  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Product name</span>
        <Input type="text" value={values.name} onChange={(event) => update('name', event.target.value)} />
        {exactDuplicate && (
          <span className="text-sm text-yellow-700 dark:text-yellow-400">
            "{exactDuplicate.name}"{exactDuplicate.model && ` (${exactDuplicate.model})`} already exists in the product
            catalog
            {exactDuplicate.already_linked
              ? ' and is already available in your building — no need to add it again.'
              : onLinkExisting
                ? '. See the match below to link it to your building instead of creating a duplicate.'
                : '.'}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Model (optional)</span>
        <Input type="text" value={values.model} onChange={(event) => update('model', event.target.value)} />
      </label>

      {onLinkExisting && matches.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Matching products already in the catalog
          </span>
          <div className="flex flex-col gap-2">
            {matches.map((match) => (
              <Card key={match.id} className="flex items-center justify-between gap-3 p-3">
                <div className="flex flex-col text-left">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {match.name}
                    {match.model && ` · ${match.model}`}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {match.category} · {match.unit}
                    {match.already_linked && ' · Already in your building'}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  disabled={match.already_linked}
                  loading={linkingProductId === match.id}
                  onClick={() => onLinkExisting(match)}
                >
                  {match.already_linked ? 'Already linked' : 'Link to my building'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

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
