import { useState } from 'react'
import { Button, NumericKeypadInput } from '@/components/ui'
import { CONSUMPTION_REASONS } from '@/lib/constants'
import type { StockRow } from '../types'

interface UpdateStockDetailsFormProps {
  row: StockRow
  submitting: boolean
  onSubmit: (quantity: string, reason: string) => void
}

/** PRD 5, Step 3b — quantity used + reason. Hard-blocked if quantity exceeds current stock. */
export function UpdateStockDetailsForm({ row, submitting, onSubmit }: UpdateStockDetailsFormProps) {
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')

  const quantityValue = Number(quantity)
  const exceedsStock = quantity !== '' && quantityValue > row.current_stock
  const canSubmit = quantity !== '' && quantityValue > 0 && !exceedsStock && reason !== ''
  const newStock = quantity !== '' && !exceedsStock ? row.current_stock - quantityValue : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{row.product.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Currently {row.current_stock} {row.product.unit} here
        </p>
      </div>

      <NumericKeypadInput
        label="Quantity used"
        value={quantity}
        onChange={setQuantity}
        unit={row.product.unit}
        error={exceedsStock ? `Only ${row.current_stock} ${row.product.unit} left` : undefined}
      />

      {newStock !== null && (
        <div className="rounded-xl bg-gray-50 px-4 py-3 text-center dark:bg-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">New stock</span>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {newStock} {row.product.unit}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Reason</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CONSUMPTION_REASONS.map((option) => (
            <Button
              key={option.value}
              variant={reason === option.value ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setReason(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <Button fullWidth disabled={!canSubmit} loading={submitting} onClick={() => onSubmit(quantity, reason)}>
        Confirm
      </Button>
    </div>
  )
}
