import { useState } from 'react'
import { Button, NumericKeypadInput } from '@/components/ui'
import { DestinationPicker } from './DestinationPicker'
import type { Floor, StockRow } from '../types'

interface TransferDetailsFormProps {
  row: StockRow
  sourceFloorId: string
  floors: Floor[]
  submitting: boolean
  onSubmit: (quantity: string, toFloorId: string) => void
}

/** PRD 5, Step 3c — quantity + destination. Hard-blocked if quantity exceeds source stock. No price fields. */
export function TransferDetailsForm({ row, sourceFloorId, floors, submitting, onSubmit }: TransferDetailsFormProps) {
  const [quantity, setQuantity] = useState('')
  const [toFloorId, setToFloorId] = useState('')

  const quantityValue = Number(quantity)
  const exceedsStock = quantity !== '' && quantityValue > row.current_stock
  const canSubmit = quantity !== '' && quantityValue > 0 && !exceedsStock && toFloorId !== ''

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{row.product.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Currently {row.current_stock} {row.product.unit} here
        </p>
      </div>

      <NumericKeypadInput
        label="Quantity to transfer"
        value={quantity}
        onChange={setQuantity}
        unit={row.product.unit}
        error={exceedsStock ? `Only ${row.current_stock} ${row.product.unit} left` : undefined}
      />

      <DestinationPicker floors={floors} excludeFloorId={sourceFloorId} value={toFloorId} onSelect={setToFloorId} />

      <Button fullWidth disabled={!canSubmit} loading={submitting} onClick={() => onSubmit(quantity, toFloorId)}>
        Confirm
      </Button>
    </div>
  )
}
