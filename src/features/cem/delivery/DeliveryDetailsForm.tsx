import { useState } from 'react'
import { Button, NumericKeypadInput } from '@/components/ui'
import type { DeliveryProduct } from './types'

interface DeliveryDetailsFormProps {
  product: DeliveryProduct
  submitting: boolean
  onSubmit: (quantity: string, pricePerUnit: string) => void
}

/** PRD 5, Step 3a — quantity + price per unit (pre-filled with last price used), auto-calculated total. */
export function DeliveryDetailsForm({ product, submitting, onSubmit }: DeliveryDetailsFormProps) {
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState(String(product.current_price_per_unit))

  const quantityValue = Number(quantity)
  const priceValue = Number(price)
  const canSubmit = quantity !== '' && quantityValue > 0 && price !== '' && priceValue >= 0
  const total = quantity !== '' && price !== '' ? quantityValue * priceValue : 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-lg font-semibold text-gray-900">{product.name}</p>
        <p className="text-sm text-gray-500">
          Currently {product.current_stock} {product.unit} at Warehouse
        </p>
      </div>

      <NumericKeypadInput label="Quantity received" value={quantity} onChange={setQuantity} unit={product.unit} />

      <NumericKeypadInput
        label={`Price per unit — Last time: ₹${product.current_price_per_unit.toFixed(2)}/unit`}
        value={price}
        onChange={setPrice}
        unit={`per ${product.unit}`}
      />

      <div className="rounded-xl bg-gray-50 px-4 py-3 text-center">
        <span className="text-sm text-gray-500">Total</span>
        <p className="text-2xl font-semibold text-gray-900">₹{total.toFixed(2)}</p>
      </div>

      <Button fullWidth disabled={!canSubmit} loading={submitting} onClick={() => onSubmit(quantity, price)}>
        Confirm
      </Button>
    </div>
  )
}
